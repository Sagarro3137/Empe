const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ CORS setup to allow Hostinger frontend
const io = new Server(server, {
  cors: {
    origin: "https://cricketlivelinevip271.shop",
    methods: ["GET", "POST"]
  }
});

// ✅ When client connects
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // 🔁 Receive offer from broadcaster
  socket.on("offer", (offer) => {
    console.log("Offer received");
    socket.broadcast.emit("offer", offer);
  });

  // 🔁 Receive answer from listener
  socket.on("answer", (answer) => {
    console.log("Answer received");
    socket.broadcast.emit("answer", answer);
  });

  // 🔁 Exchange ICE candidates
  socket.on("candidate", (candidate) => {
    console.log("ICE candidate");
    socket.broadcast.emit("candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
