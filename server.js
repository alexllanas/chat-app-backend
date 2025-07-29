import express from "express";
import http from "http";
import {getHomePage, getUsers, login, registerUser} from "./controller/user_controller.js";
import {setupWebSockets} from "./websockets/config.js";
import {authenticateToken} from "./middleware/auth.js";
import {client, connectDb} from "./database/config.js";


const app = express();
export const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/v1", getHomePage);
app.get("/api/v1/users",
    // authenticateToken,       // uncomment to authenticate user request, only removed for testing
    getUsers
)
app.post("/api/v1/register", registerUser);
app.post("/api/v1/login", login);


connectDb()
setupWebSockets(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});