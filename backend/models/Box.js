import mongoose from "mongoose";

const BoxSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Box", default: null },
    isSubBudgetEnabled: { type: Boolean, default: false },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Box" }] // New: Store child boxes
});

const Box = mongoose.model("Box", BoxSchema);
export default Box;
