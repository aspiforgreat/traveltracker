import React, { useState, useEffect } from "react";
import { Box, Slider, Typography } from "@mui/material";

// Colors for each segment (adjust or add more as needed)
const segmentColors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"];

const MultiSliderBar = ({ boxes, onAllocationChange, onAllocationsCommit }) => {
    const total = boxes.reduce((sum, box) => sum + box.number, 0);
    const numHandles = boxes.length - 1;

    // Calculate initial slider positions as cumulative percentages
    const calcInitialSliderValues = () => {
        let cumulative = 0;
        const values = [];
        boxes.slice(0, -1).forEach((box) => {
            cumulative += box.number;
            values.push((cumulative / total) * 100);
        });
        return values;
    };

    const [sliderValues, setSliderValues] = useState(calcInitialSliderValues());

    useEffect(() => {
        setSliderValues(calcInitialSliderValues());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boxes]);

    const handleSliderChange = (event, newValues) => {
        setSliderValues(newValues);
        const newBoxes = [];
        let prev = 0;
        for (let i = 0; i < boxes.length; i++) {
            let percentage;
            if (i === 0) {
                percentage = newValues[0];
            } else if (i < boxes.length - 1) {
                percentage = newValues[i] - newValues[i - 1];
            } else {
                percentage = 100 - newValues[newValues.length - 1];
            }
            const newNumber = Math.round((percentage / 100) * total);
            newBoxes.push({ ...boxes[i], number: newNumber });
        }
        onAllocationChange(newBoxes);
    };

    // Trigger save when slider stops moving
    const handleSliderCommit = () => {
        if (onAllocationsCommit) {
            onAllocationsCommit();
        }
    };

    const segments = [];
    let prevValue = 0;
    sliderValues.forEach((val) => {
        segments.push(val - prevValue);
        prevValue = val;
    });
    segments.push(100 - prevValue);

    return (
        <Box sx={{ mt: 2, position: "relative", width: "100%", height: "50px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#eee" }}>
            <Box sx={{ display: "flex", height: "100%" }}>
                {segments.map((seg, index) => (
                    <Box
                        key={index}
                        sx={{
                            flex: seg,
                            backgroundColor: segmentColors[index % segmentColors.length],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRight: index < segments.length - 1 ? "2px solid white" : "none",
                        }}
                    >
                        <Typography variant="caption" sx={{ color: "#000", fontWeight: "bold" }}>
                            {boxes[index] ? boxes[index].name : "Remaining"}: {Math.round((seg / 100) * total)}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Slider */}
            <Slider
                value={sliderValues}
                onChange={handleSliderChange}
                onChangeCommitted={handleSliderCommit} // Save after release
                step={1}
                min={0}
                max={100}
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    "& .MuiSlider-thumb": {
                        width: 8,
                        height: "50px",
                        backgroundColor: "#ccc",
                        borderRadius: "4px",
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        transform: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    },
                    "& .MuiSlider-track": { display: "none" },
                    "& .MuiSlider-rail": { display: "none" },
                }}
            />
        </Box>
    );
};

export default MultiSliderBar;
