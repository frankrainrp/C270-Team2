import { Router } from "express";
import { GetChatHistory, ReplaceChatHistory } from "../services/ChatHistoryService.js";
import { StreamChat } from "../services/ChatService.js";
import { MakeOk } from "../utils/ApiResponse.js";
import { RunSafe } from "../utils/RunSafe.js";

export const ChatRoutes = Router();

ChatRoutes.get(
  "/history",
  RunSafe(async (req, res) => {
    const history = await GetChatHistory();
    res.json(MakeOk(history));
  }),
);

ChatRoutes.put(
  "/history",
  RunSafe(async (req, res) => {
    const history = await ReplaceChatHistory(req.body || {});
    res.json(MakeOk(history));
  }),
);

ChatRoutes.post(
  "/",
  RunSafe(async (req, res) => {
    await StreamChat(req.body || {}, res);
  }),
);
