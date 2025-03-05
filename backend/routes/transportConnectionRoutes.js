import express from "express";
import mongoose from "mongoose";
import TransportCostConnection from "../models/TransportCostConnection.js"; // Assuming TransportCostConnection.js is in the models folder

const router = express.Router();

// Create or update a transport cost connection based on the toBoxId and fromBox
router.post("/transport-cost-connections/:toBoxId?", async (req, res) => {
    try {
        const { number, tripId, fromBox } = req.body;
        let { toBoxId } = req.params; // Get the toBoxId from the URL parameter

        // If toBoxId is null or "null", use fromBox instead
        if (!toBoxId || toBoxId === "null") {
            toBoxId = null;
        }

        // Determine query condition based on available IDs
        const query = toBoxId ? { fromBox, toBox: toBoxId } : { fromBox };

        // Try to find an existing connection
        let existingConnection = await TransportCostConnection.findOne(query);

        if (existingConnection) {
            // Update existing connection
            existingConnection.number = number;
            existingConnection.tripId = tripId;
            existingConnection.fromBox = fromBox;
            existingConnection.toBox = toBoxId;

            const updatedConnection = await existingConnection.save();
            return res.json(updatedConnection); // Return the updated connection
        } else {
            // Create a new connection
            const newConnection = new TransportCostConnection({
                number,
                tripId,
                fromBox,
                toBox: toBoxId,
            });

            const savedConnection = await newConnection.save();
            return res.status(201).json(savedConnection); // Return the newly created connection
        }
    } catch (err) {
        res.status(400).json({ error: err.message }); // Handle any errors
    }
});


// Get all transport cost connections for a specific toBox
router.get("/transport-cost-connections/:fromBoxId?/:toBoxId?", async (req, res) => {
    try {
        let { fromBoxId, toBoxId } = req.params;

        // If both are null or undefined, return an error
        if ((!fromBoxId || fromBoxId === "null" || fromBoxId === "undefined") &&
            (!toBoxId || toBoxId === "null" || toBoxId === "undefined")) {
            return res.status(400).json({ error: "Either fromBoxId or toBoxId must be provided." });
        }

        let query = {};

        if (toBoxId && toBoxId !== "null" && toBoxId !== "undefined") {
            if (!mongoose.Types.ObjectId.isValid(toBoxId)) {
                return res.status(400).json({ error: "Invalid toBoxId" });
            }
            query.toBox = new mongoose.Types.ObjectId(toBoxId);
        } else if (fromBoxId && fromBoxId !== "null" && fromBoxId !== "undefined") {
            if (!mongoose.Types.ObjectId.isValid(fromBoxId)) {
                return res.status(400).json({ error: "Invalid fromBoxId" });
            }
            query.fromBox = new mongoose.Types.ObjectId(fromBoxId);
        }

        const connection = await TransportCostConnection.findOne(query);

        if (!connection) {
            console.log("No connection found in database for:", query);
            return res.status(404).json({ error: "No connection found for the given IDs" });
        }

        res.json(connection);
    } catch (err) {
        console.error("Error fetching transport cost connection:", err);
        res.status(500).json({ error: err.message });
    }
});



router.get("/transport-cost-connections-all", async (req, res) => {
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