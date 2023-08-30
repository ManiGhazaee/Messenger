type User = {
    username: string;
    password: string;
    email: string;
    bio?: string;
    rooms: UserRoom[];
};

type UserRoom = {
    id: string;
    with: string;
    last_message: Message;
    not_seen_count: number;
    is_muted: boolean;
};
type Room = {
    id: string;
    participants: string[];
    messages: Message[];
    max_users: number;
};

type Message = {
    id: string;
    sender: string;
    content: string;
    time: Date;
};
