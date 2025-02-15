import mongoose from "mongoose";

const BoxSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    isSubBudgetEnabled: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Box", default: null },
});

export default mongoose.model("Box", BoxSchema);
