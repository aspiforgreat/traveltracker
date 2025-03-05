import express from "express";
import Box from "../models/Box.js";
import Trip from "../models/Trip.js";

const router = express.Router();

// Get all boxes (or filter by trip and/or parent ID)
router.get("/boxes", async (req, res) => {
    try {
        const { tripId, parentId } = req.query;

        // If neither tripId nor parentId is provided, fetch all boxes sorted by startDate
        if (!tripId && !parentId) {
            const allBoxes = await Box.find().sort({ startDate: 1 });
            return res.json(allBoxes);
        }

        if (!tripId) return res.status(400).json({ error: "tripId is required" });

        // If parentId is provided, filter by parentId to get child boxes
        if (parentId) {
            // Fetch child boxes for this parent box and sort them by startDate
            const boxes = await Box.find({ tripId, parentId }).populate("children").sort({ startDate: 1 });
            return res.json(boxes);
        }

        // If parentId is not provided, fetch boxes associated with the trip
        const trip = await Trip.findById(tripId).populate("boxes");

        // Check if the trip exists
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }

        // Sort the boxes by startDate (ascending order)
        const sortedBoxes = trip.boxes.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        // Return the sorted boxes associated with the trip
        res.json(sortedBoxes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new box
router.post("/boxes", async (req, res) => {
    try {
        const { name, number, parentId, isSubBudgetEnabled, regionNames, tripId, startDate, endDate } = req.body;

        if (!tripId) return res.status(400).json({ error: "tripId is required" });

        // If parentId is provided, ensure the parent belongs to the same trip
        if (parentId) {
            const parentBox = await Box.findById(parentId);
            if (!parentBox) return res.status(404).json({ error: "Parent box not found" });
            if (String(parentBox.tripId) !== tripId) {
                return res.status(400).json({ error: "Parent box must belong to the same trip" });
            }
        }

        const newBox = new Box({
            name,
            number,
            parentId,
            isSubBudgetEnabled,
            regionNames,
            tripId,
            startDate,  // Add startDate
            endDate     // Add endDate
        });

        const savedBox = await newBox.save();

        // If it's a child box, add it to the parent's `children` array
        if (parentId) {
            await Box.findByIdAndUpdate(parentId, { $push: { children: savedBox._id } });
        }

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
        const { tripId, parentId, startDate, endDate } = req.body;

        // Ensure that the parentId (if updated) belongs to the same trip
        if (parentId) {
            const parentBox = await Box.findById(parentId);
            if (!parentBox) return res.status(404).json({ error: "Parent box not found" });
            if (tripId && String(parentBox.tripId) !== tripId) {
                return res.status(400).json({ error: "Parent box must belong to the same trip" });
            }
        }

        const updatedBox = await Box.findByIdAndUpdate(req.params.id, { startDate, endDate, ...req.body }, { new: true });
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