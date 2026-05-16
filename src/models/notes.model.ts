import mongoose, { Document, Types } from "mongoose";

export interface INote extends Document {
    title: string;
    content: string;
    owner: Types.ObjectId;
    sharedWith: Types.ObjectId[];
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotesSchema = new mongoose.Schema<INote>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Content is required"],
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sharedWith: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isPinned: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true
    }
)

NotesSchema.index({ title: "text", content: "text" });

export const NoteModel = mongoose.model<INote>("Note", NotesSchema)