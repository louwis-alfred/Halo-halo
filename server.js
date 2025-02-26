import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import videoCampaignRouter from "./routes/videoCampaignRoute.js";
import investmentRouter from "./routes/investmentRouter.js";
import sellerRouter from "./routes/sellerRoute.js";
import otpRouter from './routes/otpRoute.js';
import tradeRoutes from './routes/tradeRoutes.js';
import { Server } from "socket.io";
import http from "http";

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/videoCampaign", videoCampaignRouter);
app.use("/api/investment", investmentRouter);
app.use("/api/seller", sellerRouter);
app.use('/api/otp', otpRouter);
app.use("/api/trades", tradeRoutes);
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.set("io", io);

server.listen(port, () => console.log("Server started on PORT: ", port));