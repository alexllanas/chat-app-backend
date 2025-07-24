import express from "express";
import http from "http";

const app = express();
export const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("Chat App");
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});