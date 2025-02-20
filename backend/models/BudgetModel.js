import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
});

const Budget = mongoose.model("Budget", BudgetSchema);

export default Budget;
