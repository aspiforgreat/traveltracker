import mongoose from "mongoose";

const BoxSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    isSubBudgetEnabled: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Box", default: null },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Box" }],
    handles: { type: [Number], default: [] },
    regionNames: { type: [String], default: [""] },
    regionColors: { type: [String], default: [] }
});

export default mongoose.model("Box", BoxSchema);
