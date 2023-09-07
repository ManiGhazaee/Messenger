import mongoose, { Document } from "mongoose";

export interface DRoom extends Document {
    participants: string[];
    messages: Message[];
    max_users: number;
    message_count: number;
}

const roomSchema = new mongoose.Schema<DRoom>({
    participants: {
        type: [String],
    },
    messages: {
        type: [
            {
                index: Number,
                sender: String,
                receiver: String,
                content: String,
                seen: Boolean,
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
