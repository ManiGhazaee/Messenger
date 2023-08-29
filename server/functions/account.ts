import { Socket } from "socket.io";
import Filter from "bad-words";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { existsEmail, existsUsername } from "../utils/general";
import UserModel from "../models/user";
require("dotenv").config();

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

export async function user(socket: Socket, id: string) {
    const user = await UserModel.findById(id);

    if (!user) {
        socket.emit("menu", { success: false, message: "User not found" });
        return;
    }

    socket.emit("menu", { user, success: true, message: "User found" });
}
