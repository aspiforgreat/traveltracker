import express from "express";
import path from "path";
import cors from "cors";
import boxRoutes from "./routes/boxRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import transportConnectionRoutes from "./routes/transportConnectionRoutes.js";

const app = express();

import mongoose from "mongoose";
import budgetRoutes from "./routes/budgetRoutes.js";
//
const MONGO_URI = "mongodb://mongo:27017/budgetDatabase"; // Change to your database name

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use("/api", boxRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api", tripRoutes);
app.use("/api", statsRoutes);
app.use("/api", transportConnectionRoutes);

// Route to wipe the entire database TODO remove before prod obviously
app.delete("/api/wipeDatabase", async (req, res) => {
    try {
        const collections = await mongoose.connection.db.collections();
        // Iterate through each collection and drop them
        for (let collection of collections) {
            await collection.deleteMany({});
        }
        res.status(200).send("Database wiped successfully.");
    } catch (error) {
        console.error("Error wiping database:", error);
        res.status(500).send("Failed to wipe database.");
    }
});

// Catch-all to send "Hello" (or you can serve the React app later)
app.get("*", (req, res) => {
    console.log("Route not found");
    res.send("Route is not configured yet!");
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});