import {WebSocketServer} from "ws";

export function setupWebSockets(server) {
    const wss = new WebSocketServer({server});
    const clients = new Map(); // userId => WebSocket

    wss.on("connection", function connection(ws) {
        console.log("Client connected");

        ws.on("message", function incoming(message) {
            try {
                const data = JSON.parse(message);
                console.log("received: ", data);
                ws.send(data.content);

                // if (data.type === "register" && data.userId) {
                //     clients.set(data.userId, ws);
                //     console.log(`Registered user ${data.userId}`);
                // }
                // if (data.type === 'message' && data.message && data.userId && data.toUserId) {
                //     const client = clients.get(data.toUserId)
                //     client.send(JSON.stringify(
                //         {
                //             fromUserId: data.userId,
                //             message: data.message
                //         }
                //     ))
                // }

            } catch (e) {
                console.error("Invalid message", e);
            }
        });

        // ws.send("Connected to WebSocket server");
    });
}