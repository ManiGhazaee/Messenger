import mongoose, { Document } from "mongoose";

export interface DRoom extends Document {
    id: string;
    participants: string[];
    messages: {
        id: string;
        sender: string;
        content: string;
        time: Date;
    }[];
    max_users: number;
    message_count: number;
}

const roomSchema = new mongoose.Schema<DRoom>({
    id: {
        type: String,
    },
    participants: {
        type: [String],
    },
    messages: {
        type: [
            {
                id: String,
                sender: String,
                content: String,
                time: Date,
            },
        ],
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
