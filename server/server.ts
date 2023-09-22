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
    setNotSeenForUsers,
} from "./functions/account";
import mongoose from "mongoose";
import { auth } from "./functions/auth";
import RoomModel, { message } from "./models/room";
import UserModel from "./models/user";
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

    socket.on("search", async (data: { token: string; search: string }) => {
        try {
            const token = auth(data.token);
            if (token === null) {
                return;
            }

            const users = await search(data.search, 20);
            if (users) {
                socket.emit("search", { success: true, message: "Users found", users: users });
            }
        } catch (e) {
            console.log("search error", e);
        }
    });

    socket.on("menu", async (data: { token: string }) => {
        try {
            const token = auth(data.token);
            if (token === null) {
                socket.emit("menu", { success: false, message: "Token not provided" });
                return;
            }

            const { id } = token;

            const user = await userById(id);
            if (user) {
                socket.emit("menu", { user, success: true, message: "User found" });
            } else {
                socket.emit("menu", { success: false, message: "User not found" });
            }
        } catch (e) {
            console.log("menu error", e);
        }
    });

    socket.on("profile", async (data: { token: string; username: string }) => {
        try {
            const token = auth(data.token);
            if (token === null) {
                return;
            }

            const { id } = token;

            const user = await userByName(data.username);
            if (!user) {
                socket.emit("profile", { success: false, message: "User not found" });
                return;
            }

            const roomId = roomIdWith(id, user);
            if (!roomId) {
                socket.emit("profile", {
                    success: true,
                    message: "No messages",
                    username: user.username,
                    bio: user.bio,
                });
                return;
            }

            const messages = await getRoom(roomId, 60);
            if (messages && messages.length !== 0) {
                const newMessagesMarker: number | null = findNewMessagesIndexMarker(messages, user.username);

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
                socket.emit("profile", { success: false, message: "No Messages Found" });
            }
        } catch (e) {
            console.log("profile error", e);
        }
    });

    socket.on("seen", async (data: { token: string; message: Message; index: number; is_last: boolean }) => {
        try {
            const token = auth(data.token);
            if (token === null) {
                return;
            }

            data.message.seen = true;

            socket.to(data.message.sender).emit("seen", { message: data.message });

            await RoomModel.findOneAndUpdate(
                { participants: { $all: [message.sender, message.receiver] } },
                { $set: { "messages.$[elem].seen": true } },
                {
                    arrayFilters: [{ "elem.index": data.index }],
                }
            );

            const [sender, receiver] = await Promise.all([
                userByName(data.message.sender),
                userByName(data.message.receiver),
            ]);
            if (!sender || !receiver) {
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
                await addLastMessageToRoom(sender, receiver, data.message, roomId);
            }

            await setNotSeenForUsers(data.message.sender, data.message.receiver);
        } catch (e) {
            console.log("seen error", e);
        }
    });

    socket.on("signup", (data: SignupData) => {
        signup(socket, data);
    });

    socket.on("login", (data: LoginData) => {
        login(socket, data);
    });

    socket.on("join", async (data: { token: string }) => {
        try {
            const token = auth(data.token);
            if (token === null) {
                return;
            }

            const { id } = token;

            const user = await userById(id);
            if (user) {
                socket.join([id, user.username]);
            }
        } catch (e) {
            console.log("join error", e);
        }
    });

    socket.on(
        "message",
        async (data: {
            token: string;
            index: number;
            sender: string;
            receiver: string;
            content: string;
            time: Date;
            reply?: MessageReply;
        }) => {
            try {
                const token = auth(data.token);
                if (token === null) {
                    return;
                }

                const message: Message = {
                    index: data.index,
                    sender: data.sender,
                    receiver: data.receiver,
                    content: data.content,
                    seen: false,
                    time: data.time,
                };

                if (data.reply) {
                    message.reply = data.reply;
                }

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

                const [sender, receiver] = await Promise.all([userByName(data.sender), userByName(data.receiver)]);

                if (!sender || !receiver) {
                    socket.emit("message", { success: false, message: "User not found" });
                    return;
                }

                if (isMessageAdded && roomId) {
                    await addLastMessageToRoom(sender, receiver, message, roomId);

                    await setNotSeenForUsers(data.sender, data.receiver);
                } else {
                    await createRoom(sender, receiver, message, 2);

                    await setNotSeenForUsers(data.sender, data.receiver);

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
                console.log("message error", e);
            }
        }
    );

    socket.on("deleteMessage", async (data: { message: Message; token: string; id: string }) => {
        const token = auth(data.token);
        if (token === null) {
            return;
        }

        socket.to(data.message.receiver).emit("deleteMessage", { message: data.message });
        socket.to(data.message.sender).emit("deleteMessage", { message: data.message });

        try {
            await RoomModel.findOneAndUpdate(
                {
                    participants: { $all: [data.message.sender, data.message.receiver] },
                },
                { $pull: { messages: { index: data.message.index } } }
            );
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("clearHistory", async (data: { token: string; id: string; sender: string; receiver: string }) => {
        const token = auth(data.token);
        if (token === null) {
            return;
        }

        const room = await RoomModel.findOneAndUpdate(
            {
                participants: { $all: [data.sender, data.receiver] },
            },
            {
                $set: {
                    messages: [],
                },
            },
            { new: true }
        );

        if (!room) return;

        const roomId = room._id.toString();
        const [newSender, newReceiver] = await Promise.all([
            UserModel.findOneAndUpdate(
                { username: data.sender },
                {
                    $set: {
                        "rooms.$[elem].not_seen_count": 0,
                        "rooms.$[elem].last_message.index": 0,
                        "rooms.$[elem].last_message.seen": false,
                        "rooms.$[elem].last_message.content": "",
                        "rooms.$[elem].last_message.time": new Date(),
                    },
                },
                {
                    arrayFilters: [{ "elem.id": roomId }],
                    new: true,
                }
            ),
            UserModel.findOneAndUpdate(
                { username: data.receiver },
                {
                    $set: {
                        "rooms.$[elem].not_seen_count": 0,
                        "rooms.$[elem].last_message.index": 0,
                        "rooms.$[elem].last_message.seen": false,
                        "rooms.$[elem].last_message.content": "",
                        "rooms.$[elem].last_message.time": new Date(),
                    },
                },
                {
                    arrayFilters: [{ "elem.id": roomId }],
                    new: true,
                }
            ),
        ]);

        if (!newReceiver || !newSender) return;

        socket.emit("menu", { user: newSender, success: true, message: "User found" });

        socket.to(newReceiver.username).emit("menu", { user: newReceiver, success: true, message: "User found" });

        socket.emit("profile", {
            success: true,
            message: "Messages found",
            new_messages_marker: null,
            username: newReceiver.username,
            bio: newReceiver.bio,
            room_id: roomId,
            messages: [],
        });
    });

    socket.on("deleteChat", async (data: { token: string; id: string; sender: string; receiver: string }) => {
        const token = auth(data.token);
        if (token === null) {
            return;
        }

        try {
            const room = await RoomModel.findOneAndDelete({
                participants: { $all: [data.sender, data.receiver] },
            });

            if (!room) return;

            const roomId = room._id.toString();
            const [newSender, newReceiver] = await Promise.all([
                UserModel.findOneAndUpdate(
                    { username: data.sender },
                    {
                        $pull: { rooms: { id: roomId } },
                    },
                    {
                        new: true,
                    }
                ),
                UserModel.findOneAndUpdate(
                    { username: data.receiver },
                    {
                        $pull: { rooms: { id: roomId } },
                    },
                    {
                        new: true,
                    }
                ),
            ]);

            if (!newReceiver || !newSender) return;

            socket.emit("menu", { user: newSender, success: true, message: "User found" });

            socket.to(newReceiver.username).emit("menu", { user: newReceiver, success: true, message: "User found" });

            socket.emit("profile", {
                success: true,
                message: "Messages found",
                new_messages_marker: null,
                username: newReceiver.username,
                bio: newReceiver.bio,
                room_id: roomId,
                messages: [],
            });
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("typing", (data: { status: "START" | "END"; sender: string; receiver: string }) => {
        socket.to(data.receiver).emit("typing", { status: data.status, sender: data.sender, receiver: data.receiver });
    });

    socket.on("onlineUsers", async (data: { [key: string]: boolean }) => {
        let userRoomLength;
        for (const key in data) {
            userRoomLength = (await io.in(key).fetchSockets()).length;
            if (userRoomLength !== 0) {
                data[key] = true;
            }
        }

        socket.emit("onlineUsers", data);
    });

    socket.on(
        "loadPrevMessages",
        async (data: { sender: string; receiver: string; last_index: number; amount: number }) => {
            try {
                const room = await RoomModel.findOne({
                    participants: { $all: [data.sender, data.receiver] },
                });

                if (!room || !room.messages) return;

                for (let i = 0; i < room.messages.length; i++) {
                    if (room.messages[i].index === data.last_index) {
                        const newPrevMessages = room.messages.slice(
                            i + 1,
                            Math.min(i + 1 + data.amount, room.messages.length)
                        ).reverse();

                        socket.emit("loadPrevMessages", { messages: newPrevMessages });

                        break;
                    }
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
