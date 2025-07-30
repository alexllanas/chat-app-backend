import {getConversationMetadata} from "../service/message_service.js";

export async function getConversations(req, res) {
    const { userId } = req.userId;

    if (!userId) {
        return res.status(401).json({error: "Unauthorized"});
    }

    try {
        const conversations = await getConversationMetadata(userId);
        return res.json({
            conversations: conversations
        });
    } catch (e) {
        return res.status(500).json({error: "Internal Server Error"});
    }
}