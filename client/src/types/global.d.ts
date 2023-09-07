type Room = {
    participants: string[];
    messages: Message[];
    max_users: number;
    message_count: number;
};

type Message = {
    status: "WAITING" | "SUCCESS" | "FAILED";
    index: number;
    sender: string;
    receiver: string;
    seen: boolean;
    content: string;
    time: Date;
};

type User = {
    username: string;
    password: string;
    email: string;
    bio: string;
    rooms: UserRoom[];
};

type UserRoom = {
    id: string;
    username: string;
    with: string;
    last_message: Message;
    not_seen_count: number;
    is_muted: boolean;
};

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

type SearchResult = {
    success: boolean;
    message: string;
    users: { username: string; bio: string }[];
};