import express from "express";
import { Server, Socket } from "socket.io";
import { customCors } from "./middlewares/cors";
import { getRoom, roomIdWith, login, publicProfile, signup, user } from "./functions/account";
import mongoose from "mongoose";
import { isAuthorized } from "./functions/auth";
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
let rooms: Room[] = [];
let users: User[] = [];

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

    socket.on("menu", (data: { token: string; id: string }) => {
        console.log(data);
        if (isAuthorized(data.token)) {
            user(socket, data.id);
        } else {
            socket.emit("menu", { success: false, message: "Token not provided" });
        }
    });

    socket.on("profile", async (data: { token: string; id: string; username: string }) => {
        if (isAuthorized(data.token)) {
            const user = await publicProfile(data.username);
            if (user) {
                const roomId = roomIdWith(data.id, user);
                if (roomId) {
                    const messages = await getRoom(roomId, 40);
                    if (messages) {
                        socket.emit("profile", {
                            success: true,
                            message: "Messages found",
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

    socket.on("signup", (data: SignupData) => {
        console.log(data);
        signup(socket, data);
    });

    socket.on("login", (data: LoginData) => {
        console.log(data);
        login(socket, data);
    });

    let room: string | null = null;

    socket.on("joinRoom", (roomId: string) => {
        socket.join(roomId);
        room = roomId;
        console.log(`User joined room ${roomId}`);
    });

    console.log(room);

    socket.on("message", (data: Message) => {
        if (room) {
            io.to(room).emit("privateMessage", data);
            console.log(data);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
        if (room) {
            socket.leave(room);
        }
    });
});
