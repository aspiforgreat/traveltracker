import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Typography, Container, Slider, TextField, Modal } from "@mui/material";
import "./DetailPage.css";

const getRandomColor = (existingColors) => {
    const colors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"];
    let newColor;
    do {
        newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (existingColors.includes(newColor));
    return newColor;
};

const DetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const box = location.state?.box;

    const [handles, setHandles] = useState([]);
    const [regionNames, setRegionNames] = useState([""]);
    const [regionColors, setRegionColors] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [defaultRegionName, setDefaultRegionName] = useState("");
    const [newRegionName, setNewRegionName] = useState("");
    const [namingType, setNamingType] = useState("both");
    const maxHandles = 5;

    const handleSliderChange = (event, newValue) => {
        if (Array.isArray(newValue)) {
            setHandles([...newValue].sort((a, b) => a - b));
        }
    };

    const addHandle = () => {
        if (handles.length < maxHandles) {
            let newHandle = handles.length === 0 ? 50 : Math.min(handles[handles.length - 1] + 10, 100);
            setHandles([...handles, newHandle].sort((a, b) => a - b));
            setRegionColors([...regionColors, getRandomColor(regionColors)]);
            setModalOpen(true);
        }
    };

    const handleRegionNameSubmit = () => {
        if (namingType === "both") {
            setRegionNames([defaultRegionName, newRegionName]);
        } else {
            setRegionNames([...regionNames, newRegionName]);
        }
        setDefaultRegionName("");
        setNewRegionName("");
        setNamingType("new");
        setModalOpen(false);
    };

    let computedRegions = handles.length > 0
        ? [handles[0], ...handles.slice(1).map((h, i) => h - handles[i]), 100 - handles[handles.length - 1]]
        : [100];

    return (
        <div className="detail-page">
            <button className="back-button" onClick={() => navigate("/")}>← Back</button>
            <div className="box-info">
                <h2>{box?.name}</h2>
                <p>Budget: {box?.number}</p>
            </div>

            <Container sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Budget Allocation</Typography>
                <Box sx={{ width: "100%", mt: 2, position: "relative", height: "50px" }}>
                    <Box
                        sx={{
                            display: "flex",
                            width: "100%",
                            height: "50px",
                            borderRadius: "10px",
                            overflow: "hidden"
                        }}>
                        {computedRegions.map((region, index) => (
                            <Box
                                key={index}
                                sx={{
                                    flex: region,
                                    backgroundColor: regionColors[index] || getRandomColor(regionColors), // Always colorful
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#000",
                                    fontWeight: "bold",
                                    padding: "4px",
                                    borderRight: index < computedRegions.length - 1 ? "2px solid white" : "none"
                                }}
                            >
                                {regionNames[index] || "Unnamed"}: {Math.round((region / 100) * (box?.number || 0))}
                            </Box>
                        ))}

                    </Box>
                    <Slider
                        value={handles}
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                        step={1}
                        sx={{
                            position: "absolute",
                            top: 0,
                            width: "100%",
                            height: "100%", // Full height of the box
                            '& .MuiSlider-thumb': {
                                width: 8,  // Slightly wider for better grip
                                height: "50px", // Matches box height
                                backgroundColor: "#ccc", // Light grey color
                                borderRadius: "4px",
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                transform: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            },
                            '& .MuiSlider-track': {
                                display: "none",
                            },
                            '& .MuiSlider-rail': {
                                display: "none",
                            },
                        }}
                    />


                    <Button variant="contained" onClick={addHandle} disabled={handles.length >= maxHandles} sx={{ mt: 2 }}>
                        Add Budget
                    </Button>
                </Box>
            </Container>

            {/* Modal for Naming Regions */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, width: 300, mx: "auto", mt: "20vh" }}>
                    <Typography variant="h6">
                        {namingType === "both" ? "Name Default and New Region" : "Name New Region"}
                    </Typography>
                    {namingType === "both" && (
                        <TextField
                            label="Default Region Name"
                            value={defaultRegionName}
                            onChange={(e) => setDefaultRegionName(e.target.value)}
                            fullWidth
                            sx={{ mt: 2 }}
                        />
                    )}
                    <TextField
                        label="New Region Name"
                        value={newRegionName}
                        onChange={(e) => setNewRegionName(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                        <Button variant="outlined" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleRegionNameSubmit}>Save</Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default DetailPage;
