import {WebSocketServer} from "ws";
import {
    checkForExistingChat,
    saveChat,
    saveMessage,
    updateChat
} from "../service/message_service.js";
import {v4 as uuidv4} from "uuid";
import {registerUser} from "../controller/user_controllers.js";

export function setupWebSockets(server) {
    const wss = new WebSocketServer({server});
    const clients = new Map(); // userId => WebSocket
    console.log("clients: ", clients, "")

    wss.on("connection", function connection(ws) {
        console.log("Client connected to Websocket server");
        let registeredUser = null;

        ws.on("message", onMessageReceived(clients, ws, function callback(userId) {
                registeredUser = userId
            })
        );

        ws.on("close", () => {
            console.log("Client disconnected from Websocket server");
            if (registeredUser && clients.has(registeredUser))
            {
                clients.delete(registeredUser)
                console.log("Deleted client with userId: ", registeredUser, "")
            }
        });
    })
}


function onMessageReceived(clients, ws, callback) {
    return async function incoming(message) {
        try {
            const data =    JSON.parse(message);

            if (data.type === "register" && data.userId) {
                console.log("Registering user with id: ", data.userId, "")
                clients.set(data.userId, ws);
                callback(data.userId)
            } else if (data.type === 'message') {
                console.log("Received message with id: ", data.id, "")
                const client = clients.get(data.recipientId)

                let chatId;
                const createdAt = new Date().toISOString();

                try {
                    chatId = await checkForExistingChat(data.senderId, data.recipientId)
                    const messageId = uuidv4();

                    if (!chatId) {
                        console.log("Chat does not exist, creating new chat with id: ", chatId, "")
                        chatId = uuidv4();

                        await saveChat(
                            chatId,
                            data.senderId,
                            data.recipientId,
                            createdAt,
                            data.content,
                            createdAt
                        )
                        console.log("Saved chat with id: ", chatId, "")
                    } else {
                        console.log("Chat exists, updating last message and createdAt")
                        await updateChat(chatId, data.content, createdAt)
                    }

                    await saveMessage(
                        messageId,
                        chatId,
                        data.senderId,
                        data.recipientId,
                        data.content,
                        createdAt
                    )
                    console.log("Saved message with id: ", messageId, "")

                    if (!client) {
                        console.log("Client not found, skipping message")   // send push notification
                        return;
                    }
                    console.log("Sending message to client with id: ", data.recipientId, "")
                    client.send(JSON.stringify(
                        {
                            id: messageId,
                            chatId: chatId,
                            senderId: data.senderId,
                            recipientId: data.recipientId,
                            content: data.content,
                            createdAt: createdAt,
                            isRead: false,
                        }
                    ))
                    console.log("Sent message to client with id: ", data.recipientId, "")
                } catch (e) {
                    console.error("Error saving message", e);
                }

            }

        } catch (e) {
            console.error("Invalid message", e);
        }
    };
}
