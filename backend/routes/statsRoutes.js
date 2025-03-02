import express from "express";
import Box from "../models/Box.js"; // Assuming Box model is imported

const router = express.Router();

// Helper function to calculate region values
const calculateRegionValues = (regions, handles, number) => {
    let regionValues = {};
    let previousHandle = 0;
    let remainingPercentage = 100;

    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        const currentHandle = handles[i];

        // Calculate the region's percentage range
        const regionPercentage = currentHandle - previousHandle;
        const regionValue = Math.round((regionPercentage / 100) * number);

        // Assign value to the region
        regionValues[region] = regionValue;
        previousHandle = currentHandle;
    }

    // The last region takes the remaining percentage
    regionValues[regions[regions.length - 1]] = Math.round((remainingPercentage / 100) * number);
    return regionValues;
};

// Recursive function to gather the regions for a box and its children
const getBoxRegions = async (boxId) => {
    const box = await Box.findById(boxId)
        .populate('children') // populate the children field
        .exec();

    if (!box) {
        throw new Error("Box not found");
    }

    const regions = box.regionNames;
    const handles = box.handles;
    const number = box.number;

    // Calculate region values for the current box
    const regionValues = calculateRegionValues(regions, handles, number);

    // Prepare the result for the current box
    const result = {
        boxId: box._id,
        regions: regionValues
    };

    // If the box has children, recursively get regions for them
    if (box.children.length > 0) {
        result.children = [];
        for (const childId of box.children) {
            const childRegionData = await getBoxRegions(childId);
            result.children.push(childRegionData);
        }
    }

    return result;
};

// GET the region data for a box and its children recursively
router.get("/regions/:boxId", async (req, res) => {
    const { boxId } = req.params;

    try {
        // Call the function to get region data starting from the given boxId
        const regionData = await getBoxRegions(boxId);
        res.json(regionData); // Send the result as JSON
    } catch (error) {
        console.error('Error fetching region data:', error);
        res.status(500).json({ message: "Error fetching region data", error });
    }
});

export default router;