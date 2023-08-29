import mongoose, { Document } from "mongoose";

interface DUser extends Document {
    username: string;
    password: string;
    email: string;
    bio?: string;
    rooms: UserRoom[];
}

const userSchema = new mongoose.Schema<DUser>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: "",
    },
    rooms: {
        type: [
            {
                id: String,
                last_message: {
                    id: String,
                    sender: String,
                    content: String,
                    time: Date,
                },
                not_seen_count: Number,
                is_muted: Boolean,
            },
        ],
        default: [],
    },
});

const UserModel = mongoose.model<DUser>("User", userSchema);

export default UserModel;
