import express from "express";
import http from "http";
import {WebSocketServer} from "ws";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {v4 as uuidv4} from "uuid";

import { Client } from 'pg'
import {config} from "dotenv";
import {authenticateToken} from "./middleware/auth.js";

config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

function insertUser(userId, email, hash, createdAt) {
  const query = `
        INSERT INTO users (id, email, password_hash, created_at)
        VALUES ($1, $2, $3, $4)
      `;

  client.query(query, [userId, email, hash, createdAt], (err, result) => {
    if (err) {
      console.error("Error executing query", err);
    } else {
      console.log("Query result:", result);
    }
  })
}

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}


function getToken(userId, email) {
  return jwt.sign({id: userId, email: email}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
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

app.post("/api/v1/register", async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) { res.status(400).json({ error: "Missing email or password" }); }

  const hash = await hashPassword(password);
  const userId = uuidv4();
  const createdAt = new Date().toISOString();

  try {
    insertUser(userId, email, hash, createdAt);

    const token = jwt.sign({id: userId, email: email}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    })

    res.status(201).json({
      "id": userId,
      "email": email,
      "access_token": token,
      "created_at": createdAt,
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }

});

app.post("/api/v1/login",async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({error: "Missing email or password"});
  }

  const query = `
    SELECT id, password_hash
    FROM users
    WHERE email = $1
  `
  const result = await client.query(query, [email])
  if (result.rowCount === 0) {
    return res.status(401).json({error: "Invalid email or password"});
  }
  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({error: "Invalid email or password"});
  }

  const token = getToken(email);

  res.json({
    "id": user.id,
    "email": email,
    "access_token": token
  })
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