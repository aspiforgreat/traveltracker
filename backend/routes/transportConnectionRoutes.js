import express from "express";
import mongoose from "mongoose";
import TransportCostConnection from "../models/TransportCostConnection.js"; // Assuming TransportCostConnection.js is in the models folder

const router = express.Router();

// Create or update a transport cost connection based on the toBoxId and fromBox
router.post("/transport-cost-connections/:toBoxId", async (req, res) => {
    try {
        const { number, tripId, fromBox } = req.body;
        const { toBoxId } = req.params; // Get the toBoxId from the URL parameter

        // Try to find an existing connection with the given fromBox and toBox
        const existingConnection = await TransportCostConnection.findOne({ fromBox, toBox: toBoxId });

        if (existingConnection) {
            // If the connection exists, update it
            existingConnection.number = number;
            existingConnection.tripId = tripId;
            existingConnection.fromBox = fromBox;
            existingConnection.toBox = toBoxId;

            const updatedConnection = await existingConnection.save();
            return res.json(updatedConnection);  // Return the updated connection
        } else {
            // If no existing connection, create a new one
            const newConnection = new TransportCostConnection({
                number,
                tripId,
                fromBox,
                toBox: toBoxId,
            });

            const savedConnection = await newConnection.save();
            return res.status(201).json(savedConnection);  // Return the newly created connection
        }
    } catch (err) {
        res.status(400).json({ error: err.message });  // Handle any error
    }
});

// Get all transport cost connections for a specific toBox
router.get("/transport-cost-connections/:toBoxId", async (req, res) => {
    try {
        const toBoxId = req.params.toBoxId;
        const toBoxObjectId = new mongoose.Types.ObjectId(toBoxId);
        if(!toBoxObjectId) {
            return res.status(404).json({ error: "No connection found for the given toBox ID" });
        }
        const connection = await TransportCostConnection.findOne({ toBox: toBoxObjectId });

        if (!connection) {
            console.log("No connection found in database for:", toBoxObjectId);
            return res.status(404).json({ error: "No connection found for the given toBox ID" });
        }
        res.json(connection);
    } catch (err) {
        console.error("Error fetching transport cost connection:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/transport-cost-connections", async (req, res) => {
    try {
        const connections = await TransportCostConnection.find({});
        res.json(connections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a transport cost connection for a specific toBox
// We will update the connection by matching the toBox ID
router.put("/transport-cost-connections/:toBoxId", async (req, res) => {
    try {
        const { number, tripId, fromBox } = req.body;
        const { toBoxId } = req.params;

        const updatedConnection = await TransportCostConnection.findOneAndUpdate(
            { toBox: toBoxId }, // Match by toBox ID
            { number, tripId, fromBox }, // Fields to update
            { new: true }  // Return the updated connection
        );

        if (!updatedConnection) {
            return res.status(404).json({ error: "Connection not found for the given toBox ID" });
        }
        res.json(updatedConnection);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a transport cost connection for a specific toBox
// Delete by the toBox ID
router.delete("/transport-cost-connections/:toBoxId", async (req, res) => {
    try {
        const { toBoxId } = req.params;

        const deletedConnection = await TransportCostConnection.findOneAndDelete({ toBox: toBoxId });

        if (!deletedConnection) {
            return res.status(404).json({ error: "Connection not found for the given toBox ID" });
        }

        res.json({ message: "Connection deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;