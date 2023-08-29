import express from "express";
import { Server, Socket } from "socket.io";
import { customCors } from "./middlewares/cors";
import { login, signup } from "./functions/account";

let PORT = 8080;

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

    socket.on("signup", (data: SignupData) => {
        signup(socket, data);
    });

    socket.on("login", (data: LoginData) => {
        login(socket, data);
    });

    let room: string | null = null;

    socket.on("joinRoom", (roomId: string) => {
        socket.join(roomId);
        room = roomId;
        console.log(`User joined room ${roomId}`);
    });

    console.log(room);

    socket.on("privateMessage", (data: Message) => {
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
