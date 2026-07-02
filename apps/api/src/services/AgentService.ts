import { z } from "zod";
import { AddNote, DeleteNote, GetNoteById, GetNoteList, UpdateNote } from "./NoteService.js";
import { AddTask, GetTaskList } from "./TaskService.js";
import { SaveAgentLog } from "./AgentLogService.js";

export const AgentActionSchema = z.object({
  actionName: z.enum(["AddTask", "ListTasks", "AddNote", "ListNotes", "GetNote", "UpdateNote", "DeleteNote"]),
  data: z.unknown().optional(),
});

export type AgentActionInput = z.infer<typeof AgentActionSchema>;

export async function RunAgentAction(input: AgentActionInput) {
  const action = AgentActionSchema.parse(input);

  try {
    const result = await RunAgentActionByName(action.actionName, action.data);
    await SaveAgentLog(action.actionName, action.data || {}, result, true);
    return result;
  } catch (error) {
    await SaveAgentLog(action.actionName, action.data || {}, ReadErrorMessage(error), false);
    throw error;
  }
}

async function RunAgentActionByName(actionName: AgentActionInput["actionName"], data: unknown) {
  switch (actionName) {
    case "AddTask":
      return AddTask(data as never);
    case "ListTasks":
      return GetTaskList();
    case "AddNote":
      return AddNote(data as never);
    case "ListNotes":
      return GetNoteList();
    case "GetNote":
      return GetNoteById(ReadId(data));
    case "UpdateNote": {
      const { id, patch } = ReadIdAndPatch(data);
      return UpdateNote(id, patch as never);
    }
    case "DeleteNote":
      return DeleteNote(ReadId(data));
    default:
      throw new Error(`Unsupported agent action: ${actionName}`);
  }
}

function ReadId(data: unknown) {
  const parsed = z.object({ id: z.string().min(1) }).parse(data);
  return parsed.id;
}

function ReadIdAndPatch(data: unknown) {
  return z.object({
    id: z.string().min(1),
    patch: z.record(z.string(), z.unknown()).default({}),
  }).parse(data);
}

function ReadErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown agent error.";
}
