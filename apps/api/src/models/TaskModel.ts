import mongoose, { Schema } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "med" | "high";

export type TaskDoc = {
  ownerId: string;
  clientId: string;
  taskName: string;
  weight: number | null;
  dueDate: string;
  dueTime: string;
  description: string;
  isGroupWork: boolean;
  source: string;
  completed: boolean;
  status: TaskStatus;
  tags: string[];
  priority: TaskPriority;
  notes: string;
  noteId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const TaskSchema = new Schema<TaskDoc>(
  {
    ownerId: { type: String, required: true, index: true },
    clientId: { type: String, required: true },
    taskName: { type: String, required: true, trim: true },
    weight: { type: Number, default: null },
    dueDate: { type: String, default: "" },
    dueTime: { type: String, default: "" },
    description: { type: String, default: "" },
    isGroupWork: { type: Boolean, default: false },
    source: { type: String, default: "agent-api" },
    completed: { type: Boolean, default: false },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    tags: { type: [String], default: [] },
    priority: { type: String, enum: ["low", "med", "high"], default: "med" },
    notes: { type: String, default: "" },
    noteId: { type: String, default: null },
  },
  { timestamps: true },
);

TaskSchema.index({ ownerId: 1, dueDate: 1, status: 1 });
TaskSchema.index({ taskName: "text", description: "text", notes: "text" });
TaskSchema.index({ ownerId: 1, clientId: 1 }, { unique: true });

export const TaskModel = mongoose.model<TaskDoc>("Task", TaskSchema);
