require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connect Kara
mongoose.connect("mongodb://127.0.0.1:27017/chatAppDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Message Schema
const chatSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model("Chat", chatSchema);

// Socket.IO Setup
io.on("connection", (socket) => {
    console.log("🟢 New user connected:", socket.id);

    // Old messages send kar
    Chat.find().then(messages => {
        socket.emit("loadMessages", messages);
    });

    // Chat message receive kela tr DB madhe save kar
    socket.on("chatMessage", async (data) => {
        console.log("📩 Received message:", data);

        const newMessage = new Chat({
            username: data.username,
            message: data.message
        });

        await newMessage.save();

        io.emit("chatMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
