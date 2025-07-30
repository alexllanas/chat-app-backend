import {WebSocketServer} from "ws";

export function setupWebSockets(server) {
    const wss = new WebSocketServer({server});
    const clients = new Map(); // userId => WebSocket

    wss.on("connection", function connection(ws) {
        console.log("Client connected");

        ws.on("message", onMessage(clients, ws));
        // ws.send("Connected to WebSocket server");
    });
}


function onMessage(clients, ws) {
    return function incoming(message) {
        try {
            const data = JSON.parse(message);
            console.log("received: ", data);

            if (data.type === "register" && data.userId) {
                clients.set(data.userId, ws);
                console.log(`Registered user ${data.userId}`);
            } else if (data.type === 'message' && data.content && data.senderId && data.recipientId) {
                const client = clients.get(data.recipientId)
                client.send(JSON.stringify(
                    {
                        id: data.id,
                        type: 'message',
                        senderId: data.senderId,
                        recipientId: data.recipientId,
                        content: data.content,
                        timestamp: data.timestamp,
                    }
                ))
            }

        } catch (e) {
            console.error("Invalid message", e);
        }
    };
}
