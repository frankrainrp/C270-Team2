import { AgentLogModel } from "../models/AgentLogModel.js";

export async function SaveAgentLog(actionName: string, input: unknown, result: unknown, ok: boolean) {
  return AgentLogModel.create({
    actionName,
    input,
    result,
    ok,
  });
}

