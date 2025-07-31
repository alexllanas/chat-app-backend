import express from "express";
import {getConversations, getMessageHistory} from "../controller/message_controller.js";

const router = express.Router();

router.get("/conversations", getConversations)
router.get("/conversations/:id", getMessageHistory)

export default router;