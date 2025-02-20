import express from "express";
import path from "path";
import cors from "cors";
import boxRoutes from "./routes/boxRoutes.js";  // Import your routes

const app = express();

import mongoose from "mongoose";
import budgetRoutes from "./routes/budgetRoutes.js";

const MONGO_URI = "mongodb://localhost:27017/budgetDatabase"; // Change to your database name

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json
// Use your routes for handling "/api/boxes"
app.use("/api", boxRoutes);
app.use("/api/budget",budgetRoutes)

// Catch-all to send "Hello" (or you can serve the React app later)
app.get("*", (req, res) => {
    console.log("Route not found");
    res.send("Hello");
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
