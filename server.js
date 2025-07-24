import express from "express";
import http from "http";
import {WebSocketServer} from "ws";
import bcrypt from "bcrypt";

import {v4 as uuidv4} from "uuid";

import { Client } from 'pg'
import {config} from "dotenv";

config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

function insertUser(email, password) {
  const insertQuery = `
        INSERT INTO users (id, email, password, created_at)
        VALUES (gen_random_uuid(), $1, $2, NOW())
      `;

  client.query(insertQuery, [email, password], (err, result) => {
    if (err) {
      console.error("Error executing query", err);
    } else {
      console.log("Query result:", result);
    }
  })
}

client.connect()
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log(err);
    })

const app = express();
export const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("Chat App");
});

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

app.post("/api/v1/register", async (req, res) => {

  const hash = await hashPassword(req.body.password);

  insertUser(req.body.email, hash);

  const result = await client.query("SELECT * FROM users")

  res.send({
    "id": result.rows[0].id,
    "hash": result.rows[0].password,
    "createdAt": result.rows[0].created_at,
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