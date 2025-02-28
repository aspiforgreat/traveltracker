import express from "express";
import Box from "../models/Box.js";
import  Trip from "../models/Trip.js";

const router = express.Router();

// Get all boxes (or filter by trip and/or parent ID)
router.get("/boxes", async (req, res) => {
    try {
        const { tripId, parentId } = req.query;

        if (!tripId) return res.status(400).json({ error: "tripId is required" });

        // If parentId is provided, filter by parentId to get child boxes
        if (parentId) {
            // Fetch child boxes for this parent box
            const boxes = await Box.find({ tripId, parentId }).populate("children");
            return res.json(boxes);
        }

        // If parentId is not provided, fetch boxes associated with the trip
        // This fetches the box IDs from the trip and then resolves them
        const trip = await Trip.findById(tripId).populate("boxes");

        // Check if the trip exists
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }

        // Now fetch the box details for the boxes associated with the trip
        const boxes = trip.boxes;

        // Return the boxes associated with the trip
        res.json(boxes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new box

router.post("/boxes", async (req, res) => {
    try {
        const { name, number, parentId, isSubBudgetEnabled, regionNames, tripId } = req.body;

        if (!tripId) return res.status(400).json({ error: "tripId is required" });

        // If parentId is provided, ensure the parent belongs to the same trip
        if (parentId) {
            const parentBox = await Box.findById(parentId);
            if (!parentBox) return res.status(404).json({ error: "Parent box not found" });
            if (String(parentBox.tripId) !== tripId) {
                return res.status(400).json({ error: "Parent box must belong to the same trip" });
            }
        }

        const newBox = new Box({ name, number, parentId, isSubBudgetEnabled, regionNames, tripId });
        console.log("newBox", newBox);
        const savedBox = await newBox.save();

        // If it's a child box, add it to the parent's `children` array
        if (parentId) {
            await Box.findByIdAndUpdate(parentId, { $push: { children: savedBox._id } });
        }
        console.log("parentId", parentId);
        // If it's a first-level box (no parent), add it to the trip's `boxes` array
        if (!parentId) {
            await Trip.findByIdAndUpdate(tripId, { $push: { boxes: savedBox._id } });
        }

        res.status(201).json(savedBox);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a box
router.put("/boxes/:id", async (req, res) => {
    try {
        const { tripId, parentId } = req.body;

        // Ensure that the parentId (if updated) belongs to the same trip
        if (parentId) {
            const parentBox = await Box.findById(parentId);
            if (!parentBox) return res.status(404).json({ error: "Parent box not found" });
            if (tripId && String(parentBox.tripId) !== tripId) {
                return res.status(400).json({ error: "Parent box must belong to the same trip" });
            }
        }

        const updatedBox = await Box.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBox);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a box and its children
router.delete("/boxes/:id", async (req, res) => {
    try {
        const box = await Box.findById(req.params.id);
        if (!box) return res.status(404).json({ error: "Box not found" });

        // Delete all child boxes recursively
        await Box.deleteMany({ parentId: box._id });

        // Remove reference from parent box
        if (box.parentId) {
            await Box.findByIdAndUpdate(box.parentId, { $pull: { children: box._id } });
        }

        await box.deleteOne();
        res.json({ message: "Box and its subbudgets deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete all boxes for a specific trip
router.delete("/boxes", async (req, res) => {
    try {
        const { tripId } = req.query;
        if (!tripId) return res.status(400).json({ error: "tripId is required" });

        await Box.deleteMany({ tripId });
        res.json({ message: `All boxes for trip ${tripId} deleted` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a box (PATCH version for partial updates)
router.patch("/boxes/:id", async (req, res) => {
    try {
        const updatedBox = await Box.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBox);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;