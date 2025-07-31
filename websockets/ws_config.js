import {WebSocketServer} from "ws";
import {
    checkForExistingConversation,
    saveConversation,
    saveMessage,
    updateConversation
} from "../service/message_service.js";
import {v4 as uuidv4} from "uuid";

export function setupWebSockets(server) {
    const wss = new WebSocketServer({server});
    const clients = new Map(); // userId => WebSocket

    wss.on("connection", function connection(ws) {
        console.log("Client connected to Websocket server");
        ws.on("message", onMessageReceived(clients, ws));
    });
}


function onMessageReceived(clients, ws) {
    return async function incoming(message) {
        try {
            const data = JSON.parse(message);

            if (data.type === "register" && data.userId) {
                console.log("Registering user with id: ", data.userId, "")
                clients.set(data.userId, ws);
            } else if (data.type === 'message') {
                const client = clients.get(data.recipientId)

                let conversationId;
                const createdAt = new Date().toISOString();

                try {
                    conversationId = await checkForExistingConversation(data.senderId, data.recipientId)
                    const messageId = uuidv4();

                    if (!conversationId) {
                        console.log("Conversation does not exist, creating new conversation with id: ", conversationId, "")
                        conversationId = uuidv4();

                        await saveConversation(
                            conversationId,
                            data.senderId,
                            data.recipientId,
                            createdAt,
                            data.content,
                            createdAt
                        )
                    } else {
                        console.log("Conversation exists, updating last message and createdAt")
                        await updateConversation(conversationId, data.content, createdAt)
                    }

                    console.log("Saving message with id: ", messageId, "")
                    await saveMessage(
                        messageId,
                        conversationId,
                        data.senderId,
                        data.recipientId,
                        data.content,
                        createdAt
                    )
                } catch (e) {
                    console.error("Error checking for existing conversation", e);
                }

                console.log("Forwarding message to client with id: ", data.recipientId, "")
                client.send(JSON.stringify(
                    {
                        id: messageId,
                        type: 'message',
                        conversationId: conversationId,
                        senderId: data.senderId,
                        recipientId: data.recipientId,
                        content: data.content,
                        createdAt: createdAt,
                        isRead: false,
                    }
                ))
            }

        } catch (e) {
            console.error("Invalid message", e);
        }
    };
}
