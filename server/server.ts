import express from "express";
import { Server, Socket } from "socket.io";
import { customCors } from "./middlewares/cors";
import {
    getRoom,
    roomIdWith,
    login,
    userByName,
    signup,
    userById,
    search,
    createRoom,
    addMessageToRoom,
    addLastMessageToRoom,
    findNewMessagesIndexMarker,
} from "./functions/account";
import mongoose from "mongoose";
import { isAuthorized } from "./functions/auth";
import RoomModel from "./models/room";
require("dotenv").config();

let PORT = 8080;
const MONGODB_URI = process.env.MONGODB_URI || "";
console.log(MONGODB_URI);

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});

const app = express();

app.use(customCors);

const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket: Socket) => {
    console.log("A user connected");

    let room: string | null = null;

    socket.on("search", async (data: { token: string; id: string; search: string }) => {
        if (isAuthorized(data.token)) {
            const users = await search(data.search, 20);
            if (users) {
                socket.emit("search", { success: true, message: "Users found", users: users });
            }
        } else {
            socket.emit("search", { success: false, message: "Token not provided" });
        }
    });

    socket.on("menu", async (data: { token: string; id: string }) => {
        if (isAuthorized(data.token)) {
            const u = await userById(data.id);
            if (u) {
                socket.emit("menu", { user: u, success: true, message: "User found" });
            } else {
                socket.emit("menu", { success: false, message: "User not found" });
            }
        } else {
            socket.emit("menu", { success: false, message: "Token not provided" });
        }
    });

    socket.on("profile", async (data: { token: string; id: string; username: string }) => {
        if (isAuthorized(data.token)) {
            const user = await userByName(data.username);
            if (user) {
                const roomId = roomIdWith(data.id, user);
                if (roomId) {
                    const messages = await getRoom(roomId, 100);
                    if (messages) {
                        const newMessagesMarker = findNewMessagesIndexMarker(messages);

                        socket.emit("profile", {
                            success: true,
                            message: "Messages found",
                            new_messages_marker: newMessagesMarker,
                            username: user.username,
                            bio: user.bio,
                            room_id: roomId,
                            messages: messages,
                        });
                    } else {
                        socket.emit("profile", { success: false, message: "Chat Not Found" });
                    }
                } else {
                    socket.emit("profile", {
                        success: true,
                        message: "No messages",
                        username: user.username,
                        bio: user.bio,
                    });
                }
            } else {
                socket.emit("profile", { success: false, message: "User not found" });
            }
        } else {
            socket.emit("profile", { success: false, message: "Token not provided" });
        }
    });

    socket.on(
        "seen",
        async (data: {
            token: string;
            id: string;
            message: Message;
            index: number;
            is_last: boolean;
        }) => {
            if (isAuthorized(data.token)) {
                const sender = await userByName(data.message.sender);
                if (sender) {
                    const newMessage: Message = {
                        ...data.message,
                        seen: true,
                    };
                    socket.to(sender._id.toString()).emit("seen", { message: newMessage });

                    const receiver = await userByName(data.message.receiver);
                    if (receiver) {
                        const roomId = roomIdWith(sender._id.toString(), receiver);
                        if (roomId) {
                            const room = await RoomModel.findById(roomId);
                            // let notSeenCount: number | null = null;

                            if (room) {
                                let firstSeenIndex: number | null = null;

                                for (let i = 0; i < room.messages.length; i++) {
                                    if (room.messages[i].index === data.index) {
                                        room.messages[i].seen = true;
                                        firstSeenIndex = i;
                                        // notSeenCount = i;
                                    }
                                }

                                if (firstSeenIndex !== null) {
                                    let max: number = Math.min(
                                        firstSeenIndex + 200,
                                        room.messages.length
                                    );

                                    for (let i = firstSeenIndex; i < max; i++) {
                                        room.messages[i].seen = true;
                                    }
                                }

                                await room.save();

                                if (data.is_last) {
                                    await addLastMessageToRoom(
                                        sender,
                                        receiver,
                                        newMessage,
                                        roomId
                                    );
                                }

                                const newSender = await userByName(data.message.sender);
                                if (newSender) {
                                    socket.to(newSender._id.toString()).emit("menu", {
                                        user: newSender,
                                        success: true,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    );

    socket.on("signup", (data: SignupData) => {
        signup(socket, data);
    });

    socket.on("login", (data: LoginData) => {
        login(socket, data);
    });

    socket.on("join", (data: { token: string; id: string }) => {
        if (isAuthorized(data.token)) {
            if (!room) {
                socket.join(data.id);
                room = data.id;
            }
        } else {
            socket.emit("join", { success: false, message: "Token not provided" });
        }
        // console.log(`User joined room ${data.id}`);
    });

    socket.on(
        "message",
        async (data: {
            token: string;
            sender: string;
            receiver: string;
            content: string;
            time: Date;
        }) => {
            try {
                if (isAuthorized(data.token)) {
                    const message: Message = {
                        ms: (performance.now() * 1000).toString(),
                        index: 0,
                        sender: data.sender,
                        receiver: data.receiver,
                        content: data.content,
                        seen: false,
                        time: data.time,
                    };
                    const sender = await userByName(data.sender);
                    const receiver = await userByName(data.receiver);
                    if (sender && receiver) {
                        const roomId = roomIdWith(sender._id.toString(), receiver);
                        if (roomId) {
                            let index: number = 0;
                            for (let i = 0; i < sender.rooms.length; i++) {
                                if (sender.rooms[i].id === roomId) {
                                    index = sender.rooms[i].last_message.index + 1;
                                    message.index = index;
                                }
                            }

                            socket.to(receiver._id.toString()).emit("message", {
                                success: true,
                                message: message,
                            });

                            socket.emit("message", { success: true, message: message });

                            await addMessageToRoom(message, roomId);

                            await addLastMessageToRoom(sender, receiver, message, roomId);

                            const newReceiver = await userByName(data.receiver);
                            if (newReceiver) {
                                socket.to(newReceiver._id.toString()).emit("menu", {
                                    user: newReceiver,
                                    success: true,
                                });
                            }

                            const newSender = await userByName(data.sender);
                            if (newSender) {
                                socket.emit("menu", {
                                    user: newSender,
                                    success: true,
                                });
                            }
                        } else {
                            socket
                                .to(receiver._id.toString())
                                .emit("message", { success: true, message: message });

                            socket.emit("message", { success: true, message: message });

                            await createRoom(sender, receiver, message, 2);

                            const newReceiver = await userByName(data.receiver);
                            if (newReceiver) {
                                socket.to(newReceiver._id.toString()).emit("menu", {
                                    user: newReceiver,
                                    success: true,
                                });
                            }

                            const newSender = await userByName(data.sender);
                            if (newSender) {
                                socket.emit("menu", {
                                    user: newSender,
                                    success: true,
                                });
                            }
                        }
                    } else {
                        socket.emit("message", { success: false, message: "User not found" });
                    }
                } else {
                    socket.emit("message", { success: false, message: "Token not provided" });
                }
            } catch (e) {
                console.log(e);
            }
        }
    );

    socket.on("disconnect", () => {
        console.log("A user disconnected");
        if (room) {
            socket.leave(room);
        }
    });
});
