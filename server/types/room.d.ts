type Room = {
    id: string;
    participants: string[];
    messages: Message[];
    max_users: number;
    message_count: number;
};

type Message = {
    id: string;
    sender: string;
    content: string;
    time: Date;
};
