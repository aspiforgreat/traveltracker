import express from "express";
import Budget from "../models/BudgetModel.js"; // Assuming a new model for budget totals

const router = express.Router();

// GET the budget total
router.get("/", async (req, res) => {
    try {
        let budget = await Budget.findOne(); // Get the first document, assuming only one budget
        if (!budget) {
            // If no budget exists, create one with a default value (e.g., number = 0)
            budget = new Budget({ number: 0 });
            await budget.save(); // Save the new budget to the database
        }
        res.json(budget); // Return the budget
    } catch (error) {
        res.status(500).json({ message: "Error fetching budget", error });
    }
});

// UPDATE the budget total
router.patch("/", async (req, res) => {
    try {
        const { number } = req.body;
        let budget = await Budget.findOne(); // Find the first budget document

        if (!budget) {
            // If no budget exists, create one
            budget = new Budget({ number });
            await budget.save();
        } else {
            // If a budget exists, update it
            budget.number = number;
            await budget.save();
        }

        res.json(budget); // Return the updated budget
    } catch (error) {
        res.status(500).json({ message: "Error updating budget", error });
    }
});

export default router;
