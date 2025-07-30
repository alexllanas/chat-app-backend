import express from "express";
import {getConversations} from "../controller/message_controller.js";

const router = express.Router();

router.get("/conversations", getConversations)

export default router;