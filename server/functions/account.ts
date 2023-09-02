import { Socket } from "socket.io";
import Filter from "bad-words";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { existsEmail, existsUsername } from "../utils/general";
import UserModel, { DUser } from "../models/user";
import RoomModel, { DRoom } from "../models/room";
import mongoose from "mongoose";
require("dotenv").config();

export type DUserDoc = mongoose.Document<unknown, {}, DUser> &
    DUser & {
        _id: mongoose.Types.ObjectId;
    };

export async function signup(socket: Socket, data: SignupData) {
    try {
        const { username, email, password } = data;

        if (!username || !email || !password) {
            socket.emit("signup", {
                success: false,
                message: "Missing required fields.",
            });
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/;

        if (!emailRegex.test(email)) {
            socket.emit("signup", {
                success: false,
                message: "Email is not valid.",
            });
            return;
        }
        if (!passwordRegex.test(password)) {
            socket.emit("signup", {
                success: false,
                message:
                    "Password is not valid. Password must contain at least one letter (uppercase or lowercase) and one digit, and must be at least 8 characters in length.",
            });
            return;
        }
        if (!usernameRegex.test(username)) {
            socket.emit("signup", {
                success: false,
                message:
                    "Username must be between 3 to 15 characters and can only contain letters, numbers, hyphens, and underscores.",
            });
            return;
        }

        const filter = new Filter();

        if (filter.isProfane(username)) {
            socket.emit("signup", {
                success: false,
                message: "Username contains inappropriate language.",
            });
            return;
        }

        if (await existsUsername(username)) {
            socket.emit("signup", {
                success: false,
                message: "Username already exists.",
            });
            return;
        } else if (await existsEmail(email)) {
            socket.emit("signup", {
                success: false,
                message: "Email already exists.",
            });
            return;
        }

        const hashedPas = await bcrypt.hash(password, 10);

        const user = {
            username: username,
            email: email,
            password: hashedPas,
        };

        const userModel = new UserModel(user);
        await userModel.save();

        const userFromDb = await UserModel.findOne({
            username: username,
            email: email,
            password: hashedPas,
        });

        const id = userFromDb ? userFromDb.id.toString() : "none";

        const token = jwt.sign(user.username, process.env.ACCESS_TOKEN_SECRET!);

        console.log("User '", user.username, "' signed up at ", new Date());
        socket.emit("signup", {
            token: token,
            id: id,
            username: user.username,
            success: true,
            message: "Account created successfully",
        });
    } catch (e) {
        console.log(e);
        socket.emit("signup", {
            success: false,
            message: "Error creating account",
        });
    }
}

export async function login(socket: Socket, data: LoginData) {
    const { username_or_email, password } = data;

    if (!username_or_email || !password) {
        socket.emit("login", {
            success: false,
            message: "Missing required fields",
        });
        return;
    }

    try {
        const user = await UserModel.findOne({
            $or: [{ username: username_or_email }, { email: username_or_email }],
        });

        if (user == null) {
            socket.emit("login", {
                success: false,
                message: "Username or Email doesn't exists",
            });
            return;
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(user.username, process.env.ACCESS_TOKEN_SECRET!);

            console.log("User '", user.username, "' logged in at ", new Date());
            socket.emit("login", {
                token: token,
                id: user.id,
                username: user.username,
                success: true,
                message: "Logged in successfully",
            });
        } else {
            console.log(
                "User '",
                user.username,
                "' failed login (incorrect password) at ",
                new Date()
            );
            socket.emit("login", { success: false, message: "Password incorrect" });
        }
    } catch (e) {
        console.log(e);
        socket.emit("login", { success: false, message: "Error" });
    }
}

export async function userById(id: string) {
    try {
        const user = await UserModel.findById(id);

        if (!user) {
            return false;
        }

        return user;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export async function userByName(username: string) {
    try {
        const user = await UserModel.findOne({
            username: username,
        });

        if (!user) {
            return false;
        }

        return user;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export function roomIdWith(
    id: string,
    user: mongoose.Document<unknown, {}, DUser> & DUser & { _id: mongoose.Types.ObjectId }
) {
    if (user.rooms.length === 0) return false;

    for (let i = 0; i < user.rooms.length; i++) {
        if (user.rooms[i].with === id) {
            return user.rooms[i].id;
        }
    }
    return false;
}

export async function getRoom(id: string, limit: number) {
    try {
        const room = await RoomModel.findById(id);

        if (!room) {
            return false;
        }

        return room.messages.slice(0, Math.min(limit, room.messages.length));
    } catch (e) {
        console.log(e);
        return false;
    }
}

export async function search(
    username: string,
    limit: number
): Promise<false | { username: string; bio: string }[]> {
    try {
        const users = await UserModel.find({ username: { $regex: username, $options: "i" } })
            .limit(limit)
            .exec();

        if (!users) {
            return false;
        }

        const parsed: { username: string; bio: string }[] = users.map((elem) => {
            return {
                username: elem.username,
                bio: elem.bio,
            };
        });

        return parsed;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export async function createRoom(
    sender: DUserDoc,
    receiver: DUserDoc,
    message: Message,
    maxUsers: number
) {
    try {
        const newRoom = new RoomModel({
            participants: [sender.username, receiver.username],
            messages: [
                {
                    ms: message.ms,
                    sender: message.sender,
                    receiver: message.receiver,
                    content: message.content,
                    seen: false,
                    time: message.time,
                },
            ],
            max_users: maxUsers,
            message_count: 1,
        });

        await newRoom.save();

        sender.rooms.push({
            id: newRoom._id.toString(),
            username: receiver.username,
            with: receiver._id.toString(),
            last_message: message,
            not_seen_count: 1,
            is_muted: false,
        });

        receiver.rooms.push({
            id: newRoom._id.toString(),
            username: sender.username,
            with: sender._id.toString(),
            last_message: message,
            not_seen_count: 1,
            is_muted: false,
        });

        await sender.save();
        await receiver.save();
    } catch (e) {
        console.log(e);
    }
}

export async function addMessageToRoom(message: Message, roomId: string) {
    const room = await RoomModel.findById(roomId);

    if (room) {
        room.messages.unshift(message);
        await room.save();
    }
}

export async function addLastMessageToRoom(
    sender: DUserDoc,
    receiver: DUserDoc,
    message: Message,
    roomId: string
) {
    try {
        for (let i = 0; i < receiver.rooms.length; i++) {
            if ("id" in receiver.rooms[i] && receiver.rooms[i].id === roomId) {
                if ("last_message" in receiver.rooms[i]) {
                    receiver.rooms[i].last_message = message;
                }
            }
        }
        for (let i = 0; i < sender.rooms.length; i++) {
            if ("id" in sender.rooms[i] && sender.rooms[i].id === roomId) {
                if ("last_message" in sender.rooms[i]) {
                    sender.rooms[i].last_message = message;
                }
            }
        }
        await sender.save();
        await receiver.save();
    } catch (e) {
        console.log(e);
    }
}