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
    addLastMessageToRoom,
    findNewMessagesIndexMarker,
    addMessageToRoomByParticipants,
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
        console.log("socket.on search executed");
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
        console.log("socket.on menu executed");
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
        console.log("socket.on profile executed");
        if (!isAuthorized(data.token)) {
            socket.emit("profile", { success: false, message: "Token not provided" });
            return;
        }

        const user = await userByName(data.username);
        if (!user) {
            socket.emit("profile", { success: false, message: "User not found" });
            return;
        }

        const roomId = roomIdWith(data.id, user);
        if (!roomId) {
            socket.emit("profile", {
                success: true,
                message: "No messages",
                username: user.username,
                bio: user.bio,
            });
            return;
        }

        const messages = await getRoom(roomId, 200);
        if (messages) {
            const newMessagesMarker: number | null = findNewMessagesIndexMarker(
                messages,
                user.username
            );

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
            // console.log("socket.on seen executed");
            if (!isAuthorized(data.token)) {
                return;
            }

            const sender = await userByName(data.message.sender);
            if (!sender) {
                return;
            }

            const newMessage: Message = {
                ...data.message,
                seen: true,
            };
            socket.to(sender._id.toString()).emit("seen", { message: newMessage });

            const receiver = await userByName(data.message.receiver);
            if (!receiver) {
                return;
            }

            const roomId = roomIdWith(sender._id.toString(), receiver);
            if (!roomId) {
                return;
            }

            const room = await RoomModel.findById(roomId);
            if (!room) {
                return;
            }

            let firstSeenIndex: number | null = null;
            for (let i = 0; i < room.messages.length; i++) {
                if (room.messages[i].index === data.index) {
                    room.messages[i].seen = true;
                    firstSeenIndex = i;
                    // notSeenCount = i;
                }
            }
            if (firstSeenIndex !== null) {
                let max: number = Math.min(firstSeenIndex + 200, room.messages.length);
                for (let i = firstSeenIndex; i < max; i++) {
                    room.messages[i].seen = true;
                }
            }

            await room.save();

            if (data.is_last) {
                await addLastMessageToRoom(sender, receiver, newMessage, roomId);
            }

            const newSender = await userByName(data.message.sender);
            if (newSender) {
                socket.to(newSender._id.toString()).emit("menu", {
                    user: newSender,
                    success: true,
                });
            }
        }
    );

    socket.on("signup", (data: SignupData) => {
        signup(socket, data);
    });

    socket.on("login", (data: LoginData) => {
        login(socket, data);
    });

    socket.on("join", async (data: { token: string; id: string }) => {
        // console.log("socket.on join executed");
        if (!isAuthorized(data.token)) {
            socket.emit("join", { success: false, message: "Token not provided" });
            return;
        }
        const user = await userById(data.id);
        if (user) {
            socket.join([data.id, user.username]);
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
            // console.log("socket.on message executed");
            // console.time("socket.on message performance");
            try {
                if (!isAuthorized(data.token)) {
                    socket.emit("message", { success: false, message: "Token not provided" });
                    return;
                }

                const message: Message = {
                    ms: (performance.now() * 1000).toString(),
                    index: 0,
                    sender: data.sender,
                    receiver: data.receiver,
                    content: data.content,
                    seen: false,
                    time: data.time,
                };

                socket.to(data.receiver).emit("message", {
                    success: true,
                    message: message,
                });

                socket.emit("message", { success: true, message: message });

                const [isMessageAdded, roomId] = await addMessageToRoomByParticipants(
                    data.sender,
                    data.receiver,
                    message
                );
                // console.log("socket.on message: added message");

                const [sender, receiver] = await Promise.all([
                    userByName(data.sender),
                    userByName(data.receiver),
                ]);
                // console.log("socket.on message: got sender receiver from db");

                if (!sender || !receiver) {
                    socket.emit("message", { success: false, message: "User not found" });
                    return;
                }

                if (isMessageAdded && roomId) {
                    await addLastMessageToRoom(sender, receiver, message, roomId);
                    // console.log("socket.on message: added last message to userrooms");

                    const [newSender, newReceiver] = await Promise.all([
                        userByName(data.sender),
                        userByName(data.receiver),
                    ]);
                    // console.log("socket.on message: got new receiver, sender ");

                    if (newReceiver && newSender) {
                        socket.to(newReceiver._id.toString()).emit("menu", {
                            user: newReceiver,
                            success: true,
                        });
                        socket.emit("menu", {
                            user: newSender,
                            success: true,
                        });
                    }
                } else {
                    await createRoom(sender, receiver, message, 2);

                    const [newSender, newReceiver] = await Promise.all([
                        userByName(data.sender),
                        userByName(data.receiver),
                    ]);

                    if (newReceiver && newSender) {
                        socket.to(newReceiver._id.toString()).emit("menu", {
                            user: newReceiver,
                            success: true,
                        });
                        socket.emit("menu", {
                            user: newSender,
                            success: true,
                        });
                    }
                }
            } catch (e) {
                console.log("socket.on message", e);
            }

            // console.timeEnd("socket.on message performance");
        }
    );

    socket.on("disconnect", () => {
        console.log("A user disconnected");
        if (room) {
            socket.leave(room);
        }
    });
});
