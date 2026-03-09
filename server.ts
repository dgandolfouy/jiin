import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("Starting Jinn server...");
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Socket.IO Logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_wishlist", (wishlistId) => {
      socket.join(wishlistId);
      console.log(`User ${socket.id} joined wishlist: ${wishlistId}`);
    });

    socket.on("gift_reserved", (data) => {
      // Broadcast to everyone in the wishlist room EXCEPT the sender
      socket.to(data.wishlistId).emit("gift_reserved_update", data);
    });

    socket.on("gift_received", (data) => {
      socket.to(data.wishlistId).emit("gift_received_update", data);
    });

    socket.on("new_message", (data) => {
      socket.to(data.wishlistId).emit("message_received", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === "production";
  console.log("Environment:", isProd ? "production" : "development");

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
