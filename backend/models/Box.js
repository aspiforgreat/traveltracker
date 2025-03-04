import mongoose from "mongoose";

const BoxSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    isSubBudgetEnabled: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Box", default: null },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Box" }],
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    handles: { type: [Number], default: [] },
    regionNames: { type: [String], default: [""] },
    regionColors: { type: [String], default: [] },
    startDate: { type: Date, required: true },  // New startDate field
    endDate: { type: Date, required: true }     // New endDate field
});

// Indexes for performance optimization
BoxSchema.index({ tripId: 1, parentId: 1 }); // Compound index for trip-based queries
BoxSchema.index({ parentId: 1 }); // Separate index for fast parent-child lookups

export default mongoose.model("Box", BoxSchema);