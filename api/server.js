import express from "express";
import http from "http";
import {WebSocketServer} from "ws";
import bcrypt from "bcrypt";

import {v4 as uuidv4} from "uuid";

const app = express();
export const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("Chat App");
});

function hashPassword(password) {
  const saltRounds = 10;
  try {
    return bcrypt.hash(password, saltRounds);
  } catch (e) {
    console.error('Error hashing password:', err);
    throw e;
  }
}

app.post("/api/v1/register", (req, res) => {

  const hash = hashPassword(req.password);
  const createdAt = new Date().toISOString();

  res.send({
    "id" : uuidv4(),
    "hash" : hash,
    "createdAt" : createdAt,
  });
});

// Websocket
const wss = new WebSocketServer({ server });

const clients = new Map(); // userId => WebSocket

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", function incoming(message) {
    try {
      const data = JSON.parse(message);
      console.log("received: ", data);
      ws.send(`you sent data to the server.`);

      if (data.type === "register" && data.userId) {
        clients.set(data.userId, ws);
        console.log(`Registered user ${data.userId}`);
      }
      if (data.type === 'message' && data.message && data.userId && data.toUserId) {
        const client = clients.get(data.toUserId)
        client.send(JSON.stringify(
            {
              fromUserId: data.userId,
              message: data.message
            }
        ))
      }

    } catch (e) {
      console.error("Invalid message", e);
    }
  });

  ws.send("Connected to WebSocket server");
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});