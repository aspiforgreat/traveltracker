import React, { useState, useEffect } from "react";
import { Box, Slider, Typography } from "@mui/material";

// Colors for each segment
const segmentColors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#ff7b9c", "#9d4edd", "#8338ec"];

// Function to calculate text color for contrast
const getTextColor = (bgColor) => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? "#444444" : "#fff"; // Adjust based on brightness
};

const MultiSliderBar = ({ boxes, onAllocationChange, onAllocationsCommit }) => {
    const total = boxes.reduce((sum, box) => sum + box.number, 0);

    // Calculate initial slider positions as cumulative percentages
    const calcInitialSliderValues = () => {
        let cumulative = 0;
        return boxes.slice(0, -1).map((box) => {
            cumulative += box.number;
            return (cumulative / total) * 100;
        });
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
            let percentage = i === 0 ? newValues[0] : i < boxes.length - 1 ? newValues[i] - newValues[i - 1] : 100 - newValues[newValues.length - 1];
            newBoxes.push({ ...boxes[i], number: Math.round((percentage / 100) * total) });
        }
        onAllocationChange(newBoxes);
    };

    // Trigger save when slider stops moving
    const handleSliderCommit = () => {
        if (onAllocationsCommit) onAllocationsCommit();
    };

    const segments = [];
    let prevValue = 0;
    sliderValues.forEach((val) => {
        segments.push(val - prevValue);
        prevValue = val;
    });
    segments.push(100 - prevValue);

    return (
        <Box sx={{ mt: 2, position: "relative", width: "100%", height: "55px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#f0f0f0" }}>
            {/* Segments */}
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
                            padding: "6px",
                            borderRadius: index === 0 ? "12px 0 0 12px" : index === segments.length - 1 ? "0 12px 12px 0" : "0",
                            borderRight: index < segments.length - 1 ? "2px solid white" : "none",
                        }}
                    >
                        <Typography variant="caption" sx={{ color: getTextColor(segmentColors[index % segmentColors.length]), fontWeight: "bold" }}>
                            {boxes[index] ? boxes[index].name : "Remaining"}: {Math.round((seg / 100) * total)}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Sliders (handles move at the same speed as segments) */}
            <Slider
                value={sliderValues}
                onChange={handleSliderChange}
                onChangeCommitted={handleSliderCommit}
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
                        width: 16,
                        height: "100%", // Makes handles as tall as the bar
                        backgroundColor: "#f3f0f0",
                        borderRadius: "4px",
                        boxShadow: "0 3px 6px rgba(100, 149, 237, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": { backgroundColor: "#8c8b8b" },
                        "&::before": {
                            content: '""',
                            width: 4,
                            height: 20,
                            backgroundColor: "#ddd",
                            borderRadius: "2px",
                        }, // Adds an indicator (grip) inside the handle
                    },
                    "& .MuiSlider-track": { display: "none" },
                    "& .MuiSlider-rail": { display: "none" },
                }}
            />
        </Box>
    );
};

export default MultiSliderBar;