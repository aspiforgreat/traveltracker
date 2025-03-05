import express from "express";
import Box from "../models/Box.js"; // Assuming Box model is imported

const router = express.Router();

// Helper function to calculate region values
const calculateRegionValues = (regions, handles, number) => {
    let regionValues = {};
    let previousHandle = 0;
    let totalPercentage = 0; // Track the total percentage covered by the regions

    for (let i = 0; i < regions.length - 1; i++) {
        const region = regions[i];
        const currentHandle = handles[i];

        // Calculate the region's percentage range
        const regionPercentage = currentHandle - previousHandle;
        const regionValue = Math.round((regionPercentage / 100) * number);

        // Assign value to the region
        regionValues[region] = regionValue;

        totalPercentage += regionPercentage; // Add to the total percentage
        previousHandle = currentHandle;
    }

    // Calculate the remaining percentage for the last region
    const remainingPercentage = 100 - totalPercentage;

    // The last region takes the remaining percentage
    regionValues[regions[regions.length - 1]] = Math.round((remainingPercentage / 100) * number);

    return regionValues;
};

// Recursive function to gather the regions for a box and its children
const getBoxRegions = async (boxId) => {
    if (!boxId) {
        throw new Error("Invalid box ID");
    }

    // Fetch the box and populate immediate children
    const box = await Box.findById(boxId)
        .populate('children')
        .exec();
    //console.log("querying: ", box)
    if (!box) {
        throw new Error("Box not found");
    }

    // Calculate region values for the current box
    const regionValues = calculateRegionValues(box.regionNames, box.handles, box.number);

    const result = {
        boxId: box._id,
        regions: regionValues
    };

    // Use Promise.all to handle recursive calls concurrently
    if (box.children && box.children.length > 0) {
        result.children = await Promise.all(
            box.children.map(child => getBoxRegions(child._id))
        );
       // console.log("querying child: ", box.name,"| returned this: ", result)
    }
    return result;
};

// Helper function to merge two region objects by summing their values
const mergeRegionObjects = (obj1, obj2) => {
    const merged = { ...obj1 };
    for (const key in obj2) {
        merged[key] = (merged[key] || 0) + obj2[key];
    }
    return merged;
};

// Recursively traverse the region tree and compile all region values into one aggregated object
const gatherAllRegions = (node) => {
    let compiled = { ...node.regions };

    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            const childRegions = gatherAllRegions(child);
            compiled = mergeRegionObjects(compiled, childRegions);
        }
    }
    return compiled;
};

// GET the region data for a box and its children recursively
router.get("/regions/:boxId", async (req, res) => {
    const { boxId } = req.params;

    try {
        // Call the function to get region data starting from the given boxId
        const regionData = await getBoxRegions(boxId);
        const compiledRegions = gatherAllRegions(regionData);
        res.json(compiledRegions); // Send the result as JSON
        console.log(compiledRegions)
    } catch (error) {
        console.error('Error fetching region data:', error);
        res.status(500).json({ message: "Error fetching region data", error });
    }
});

export default router;