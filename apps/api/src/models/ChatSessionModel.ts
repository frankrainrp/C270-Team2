import mongoose, { Schema } from "mongoose";

export type ChatSessionDoc = {
  clientId: string;
  title: string;
  createdAtMs: number;
  updatedAtMs: number;
  createdAt: Date;
  updatedAt: Date;
};

const ChatSessionSchema = new Schema<ChatSessionDoc>(
  {
    clientId: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    createdAtMs: { type: Number, required: true },
    updatedAtMs: { type: Number, required: true },
  },
  { timestamps: true },
);

ChatSessionSchema.index({ updatedAtMs: -1 });
ChatSessionSchema.index({ clientId: 1 }, { unique: true });

export const ChatSessionModel = mongoose.model<ChatSessionDoc>("ChatSession", ChatSessionSchema);
