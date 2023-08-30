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
