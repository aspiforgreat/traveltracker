import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    boxes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Box" }], // References all boxes in this trip
    budget: { type: Number, required: true }, // Add budget as a numeric field
    createdAt: { type: Date, default: Date.now }
});

// Indexing for faster trip lookups
TripSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Trip", TripSchema);