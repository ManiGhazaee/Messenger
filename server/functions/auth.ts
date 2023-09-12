import jwt from "jsonwebtoken";
require("dotenv").config();

export function auth(token: string) {
    if (!token) {
        return null;
    }

    try {
        const decoded: { username: string; id: string } = JSON.parse(
            JSON.stringify(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!))
        );

        if (typeof decoded === "object" && "username" in decoded && "id" in decoded) {
            return decoded;
        } else {
            throw new Error("Invalid decoded token");
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}
