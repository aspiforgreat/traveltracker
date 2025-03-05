import mongoose from "mongoose";

// Define the schema for the TransportCostConnection
const TransportCostConnectionSchema = new mongoose.Schema({
    number: { type: Number, required: true }, // The transport cost amount
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true, index: true }, // Reference to the Trip
    fromBox: { type: mongoose.Schema.Types.ObjectId, ref: "Box", required: false }, // Reference to the 'from' box
    toBox: { type: mongoose.Schema.Types.ObjectId, ref: "Box", required: false }, // Reference to the 'to' box
});

// Indexes for performance optimization
TransportCostConnectionSchema.index({ tripId: 1, toBox: 1 }); // Compound index for fast trip-based and box-based queries

// Create and export the model based on the schema
export default mongoose.model("TransportCostConnection", TransportCostConnectionSchema);