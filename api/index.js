import express from "express";
import http from "http";

const app = express();
const serverPort = process.env.PORT || 443;
export const server = http.createServer(app);

app.get("/api/v1", (req, res) => {
  res.send("Chat App");
});

app.post("/api/v1/register", (req, res) => {
  // res.send(`${req}`);
  console.log(`${req}`)
});

server.listen(serverPort, () => {
  console.log(`HTTP and WebSocket server listening on port ${serverPort}`);
});