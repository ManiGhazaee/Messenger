type SocketGet = "rooms" | "signup" | "login";

type SignupData = {
    username: string;
    password: string;
    email: string;
};

type SignupEmit = {
    id?: string;
    token?: string;
    success: boolean;
    message: string;
};

type LoginData = {
    username_or_email: string;
    password: string;
};