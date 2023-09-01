import jwt from "jsonwebtoken";
require("dotenv").config();

export function isAuthorized(token: string) {
    if (!token) {
        return false;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
        if (err) {
            console.log(err);
            return false;
        }
    });
    return true;
}
