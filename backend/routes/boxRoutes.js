import express from "express";
import Box from "../models/Box.js";

const router = express.Router();

// Get All Boxes (or filter by parent ID)
router.get("/boxes", async (req, res) => {
    try {
        const parentId = req.query.parentId || null;
        const boxes = await Box.find({ parentId });
        res.json(boxes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a New Box
router.post("/boxes", async (req, res) => {
    try {
        const newBox = new Box(req.body);
        await newBox.save();
        res.status(201).json(newBox);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a Box
router.put("/boxes/:id", async (req, res) => {
    try {
        const updatedBox = await Box.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBox);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a Box
router.delete("/boxes/:id", async (req, res) => {
    try {
        await Box.findByIdAndDelete(req.params.id);
        res.json({ message: "Box deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
