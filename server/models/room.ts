import mongoose, { Document } from "mongoose";

export interface DRoom extends Document {
    participants: string[];
    messages: Message[];
    max_users: number;
    message_count: number;
}

export const reply = {
    index: Number,
    sender: String,
    receiver: String,
    content: String,
    time: Date,
};

export const message = {
    index: Number,
    reply: reply,
    sender: String,
    receiver: String,
    seen: Boolean,
    content: String,
    time: Date,
};

const roomSchema = new mongoose.Schema<DRoom>({
    participants: {
        type: [String],
    },
    messages: {
        type: [message],
    },
    max_users: {
        type: Number,
        default: 2,
    },
    message_count: {
        type: Number,
        default: 1,
    },
});

const RoomModel = mongoose.model<DRoom>("Room", roomSchema);

export default RoomModel;
