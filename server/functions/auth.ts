import jwt from "jsonwebtoken";
require("dotenv").config();

export function isAuthorized(token: string) {
    console.log(token);
    if (!token) {
        return false;
    }

    console.log(process.env.ACCESS_TOKEN_SECRET);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
        if (err) {
            console.log(err);
            console.log("err");
            return false;
        }
    });
    return true;
}
