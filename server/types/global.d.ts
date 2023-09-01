type Room = {
    participants: string[];
    messages: Message[];
    max_users: number;
    message_count: number;
};

type Message = {
    ms: string;
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
    with: string;
    last_message: MessageFromServer;
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
