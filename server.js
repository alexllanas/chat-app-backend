import express from "express";
import http from "http";
import {WebSocketServer} from "ws";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {v4 as uuidv4} from "uuid";
import {POSTGRES_ERRORS} from "./database/constants.js";

import {client} from "./database/config.js";
import {authenticateToken} from "./middleware/auth.js";

// function insertUser(userId, username, email, hash, createdAt) {
//     const query = `
//         INSERT INTO users (id, email, username, password_hash, created_at)
//         VALUES ($1, $2, $3, $4, $5)
//     `;
//
//     return new Promise((resolve, reject) => {
//         client.query(query, [userId, email, username, hash, createdAt], (err, result) => {
//             if (err) {
//                 if (err.code === POSTGRES_ERRORS.UNIQUE_VIOLATION) {
//                     if (err.constraint === "users_email_key")
//                         return reject({type: "duplicate_email"});
//                     else if (err.constraint === "unique_username") {
//                         return reject({type: "duplicate_username"});
//                     } else {
//                         return reject({type: "duplicate"});
//                     }
//                 }
//                 return reject({type: "server", error: err});
//             }
//             resolve()
//         })
//     })
// }
//
// async function hashPassword(password) {
//     const saltRounds = 10;
//     return await bcrypt.hash(password, saltRounds);
// }
//
//
// function getToken(userId, email) {
//     return jwt.sign({id: userId, email: email}, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRATION,
//     });
// }
//
// client.connect()
//     .then(() => {
//         console.log("Connected to DB");
//     })
//     .catch((err) => {
//         console.log(err);
//     })
//
// const app = express();
// export const server = http.createServer(app);
// const PORT = process.env.PORT || 3000;
//
// app.use(express.json());
//
// app.get("/api/v1", (req, res) => {
//     res.send("Chat App");
// });
//
// app.post("/api/v1/register", async (req, res) => {
//     const {username, email, password} = req.body;
//     if (!username || !email || !password) {
//         res.status(400).json({error: "Missing username, email or password"});
//     }
//
//     const hash = await hashPassword(password);
//     const userId = uuidv4();
//     const createdAt = new Date().toISOString();
//
//     try {
//         await insertUser(userId, username, email, hash, createdAt);
//
//         const token = getToken(userId, email);
//
//         return res.status(201).json({
//             "id": userId,
//             "username": username,
//             "email": email,
//             "access_token": token,
//             "created_at": createdAt,
//         });
//
//     } catch (err) {
//         if (err.type === "duplicate_email") {
//             return res.status(409).json({error: "A user with this email already exists"});
//         } else if (err.type === "duplicate_username") {
//             return res.status(409).json({error: "A user with this username already exists"});
//         } else if (err.type === "duplicate") {
//             return res.status(409).json({error: "This user already exists"});
//         }
//         return res.status(500).json({error: "Internal Server Error"});
//     }
// });
//
// app.post("/api/v1/login", async (req, res) => {
//     const {email, password} = req.body;
//     if (!email || !password) {
//         return res.status(400).json({error: "Missing email or password"});
//     }
//
//     const query = `
//         SELECT id, username, password_hash
//         FROM users
//         WHERE email = $1
//     `
//     const result = await client.query(query, [email])
//     if (result.rowCount === 0) {
//         return res.status(401).json({error: "Invalid email or password"});
//     }
//     const user = result.rows[0];
//
//     const isMatch = await bcrypt.compare(password, user.password_hash);
//
//     if (!isMatch) {
//         return res.status(401).json({error: "Invalid email or password"});
//     }
//
//     const token = getToken(user.id, email);
//
//     res.json({
//         "id": user.id,
//         "username": user.username,
//         "email": email,
//         "access_token": token
//     })
// });
//
// app.get("/api/v1/users",
//     // authenticateToken,       // uncomment to authenticate user request, only removed for testing
// async (req, res) => {
//     const users = await client.query("SELECT id, username, email FROM users");
//     res.json({
//         users: users.rows
//     });
// })

// Websocket
const wss = new WebSocketServer({server});

const clients = new Map(); // userId => WebSocket

wss.on("connection", function connection(ws) {
    console.log("Client connected");

    ws.on("message", function incoming(message) {
        try {
            const data = JSON.parse(message);
            console.log("received: ", data);
            ws.send(`you sent data to the server.`);

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

    ws.send("Connected to WebSocket server");
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});