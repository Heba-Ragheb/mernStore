import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import userRouter from "./routes/user.js";
import googleAuthRouter from "./routes/passport.js";
import productRoutes from "./routes/product.js";
import categoryRoutes from "./routes/category.js";
import orderRouter from "./routes/order.js";
import offerRouter from "./routes/offers.js";

import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./controller/passport.js"; // Configure passport strategies
import cors from "cors";
import paymentRouter from "./routes/paymob.js";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "mysecret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/user", userRouter);
app.use("/api/googleAuth", googleAuthRouter);
app.use("/api/products", productRoutes);
app.use("/api/categorys", categoryRoutes);
app.use("/api/order", orderRouter);
app.use("/api/offer", offerRouter);
app.use("/api/payment", paymentRouter);
// Connect to MongoDB and start server
mongoose.connect(process.env.DB_URL, { dbName: process.env.DB_NAME })
  .then(() => {
    const port = process.env.PORT; // Back4App provides PORT=8080
    if (!port) {
      console.error("❌ PORT is not defined in environment variables");
      process.exit(1);
    }
    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log("✅ Database connected");
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
  });
