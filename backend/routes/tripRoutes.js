import express from "express";
import Trip from "../models/Trip.js"; // Assuming Trip.js is in the models folder

const router = express.Router();

// Create a new trip
router.post("/trips", async (req, res) => {
    try {
        const { name, description, startDate, endDate, budget } = req.body; // Now include budget

        const newTrip = new Trip({
            name,
            description,
            startDate,
            endDate,
            budget // Include budget in the trip creation
        });

        const savedTrip = await newTrip.save();
        res.status(201).json(savedTrip);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all trips
router.get("/trips", async (req, res) => {
    try {
        const trips = await Trip.find();
        res.json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single trip by ID
router.get("/trips/:id", async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ error: "Trip not found" });
        res.json(trip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a trip by ID
router.put("/trips/:id", async (req, res) => {
    try {
        const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTrip) return res.status(404).json({ error: "Trip not found" });
        res.json(updatedTrip);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a trip by ID
router.delete("/trips/:id", async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ error: "Trip not found" });

        await trip.deleteOne();
        res.json({ message: "Trip deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;