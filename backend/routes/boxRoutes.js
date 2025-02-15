import express from "express";
import Box from "../models/Box.js";

const router = express.Router();

// Get all boxes (or filter by parent ID)
router.get("/boxes", async (req, res) => {
    try {
        const parentId = req.query.parentId || null;
        const boxes = await Box.find({ parentId }).populate("children");
        res.json(boxes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new box
router.post("/boxes", async (req, res) => {
    try {
        const { name, number, parentId, isSubBudgetEnabled, regionNames } = req.body; // Include regionNames

        const newBox = new Box({ name, number, parentId, isSubBudgetEnabled, regionNames }); // Add regionNames

        const savedBox = await newBox.save();

        // If it's a child box, add it to the parent's `children` array
        if (parentId) {
            await Box.findByIdAndUpdate(parentId, { $push: { children: savedBox._id } });
        }

        res.status(201).json(savedBox);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Update a box
router.put("/boxes/:id", async (req, res) => {
    try {
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

router.delete("/boxes", async (req, res) => {
    try {
        await Box.deleteMany();
        res.json({ message: "All budgets deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
