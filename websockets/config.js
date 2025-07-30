import {WebSocketServer} from "ws";

export function setupWebSockets(server) {
    const wss = new WebSocketServer({server});
    const clients = new Map(); // userId => WebSocket

    wss.on("connection", function connection(ws) {
        console.log("Client connected");

        ws.on("message", onMessage(clients, ws));

        ws.send("Connected to WebSocket server");
    });
}


function onMessage(clients, ws) {
    return function incoming(message) {
        try {
            const data = JSON.parse(message);
            console.log("received: ", data);

            if (data.type === "register" && data.user_id) {
                clients.set(data.user_id, ws);
                console.log(`Registered user ${data.user_id}`);
            } else if (data.type === 'message' && data.content && data.sender_id && data.recipient_id) {
                const client = clients.get(data.recipient_id)
                console.log("Client connected", client);
                client.send(JSON.stringify(
                    {
                        id: data.id,
                        senderId: data.sender_id,
                        recipientId: data.recipient_id,
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
