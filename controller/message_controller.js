import {checkForExistingChat, getChats, getMessages} from "../service/message_service.js";

export async function getChatsController(req, res) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(401).json({error: "Unauthorized"});
    }

    try {
        const chats = await getChats(userId);
        return res.json({
            chats: chats
        });
    } catch (e) {
        return res.status(500).json({error: "Internal Server Error"});
    }
}

export async function getMessagesController(req, res) {
    const { chatId } = req.params;
    if (!chatId) {
        return res.status(401).json({error: "Unauthorized"});
    }
    const messages = await getMessages(chatId);
    return res.json({
        messages: messages
    });
}

export async function checkIfChatExistsController(req, res) {
    const { userId, recipientId } = req.query;
    if (!userId || !recipientId) {
        return res.status(401).json({error: "Unauthorized"});
    }
    const chatId = await checkForExistingChat(userId, recipientId);
    if (!chatId) {
        return res.status(404).json({error: "Chat does not exist"});
    }
    return res.json({
        chatId: chatId
    });
}
