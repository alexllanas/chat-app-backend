import express from "express";
import {
    checkIfChatExistsController,
    getChatsController,
    getMessagesController
} from "../controller/message_controller.js";

const router = express.Router();

router.get("/users/:userId/chats", getChatsController)
router.get("/chats/:chatId/messages", getMessagesController)
router.get("chats/exists", checkIfChatExistsController)

export default router;