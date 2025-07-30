import express from "express";
import http from "http";
import {setupWebSockets} from "./websockets/ws_config.js";
import {authenticateToken} from "./middleware/auth.js";
import {client, connectDb} from "./database/db_config.js";
import userRoutes from "./route/user_routes.js";
import messageRoutes from "./route/message_routes.js";


const app = express();
export const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1", userRoutes, messageRoutes);

connectDb()
setupWebSockets(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});