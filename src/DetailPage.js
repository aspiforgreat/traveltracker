import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Button,
    Slider,
    Typography,
    Grid,
    Container,
    TextField,
    Modal,
} from "@mui/material";
import "./DetailPage.css";

const DetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const box = location.state?.box; // Get the box data

    const [handles, setHandles] = useState([]); // positions (0-100)
    const maxHandles = 5;
    const [regionNames, setRegionNames] = useState([""]); // First region initially unnamed

    // Modal state for naming regions
    const [regionNameModalOpen, setRegionNameModalOpen] = useState(false);
    const [defaultRegionName, setDefaultRegionName] = useState(""); // For first-time naming
    const [newRegionName, setNewRegionName] = useState(""); // For the new region
    const [namingType, setNamingType] = useState("");

    // Function to add a handle
    const addHandle = () => {
        if (handles.length < maxHandles) {
            let newHandle = handles.length === 0 ? 50 : Math.min(handles[handles.length - 1] + 10, 100);
            setHandles([...handles, newHandle].sort((a, b) => a - b));
        }
    };

    // Handle slider movement
    const handleSliderChange = (event, newValue) => {
        if (Array.isArray(newValue)) {
            setHandles([...newValue].sort((a, b) => a - b));
        }
    };

    // Compute region sizes
    let computedRegions = [];
    if (handles.length > 0) {
        computedRegions.push(handles[0]); // First region
        for (let i = 1; i < handles.length; i++) {
            computedRegions.push(handles[i] - handles[i - 1]);
        }
        computedRegions.push(100 - handles[handles.length - 1]); // Remaining region
    } else {
        computedRegions.push(100);
    }

    // Handle button click to add a new region
    const handleAddHandleClick = () => {
        if (!regionNames[0] || regionNames[0].trim() === "") {
            setNamingType("both"); // Name both default and new region
        } else {
            setNamingType("new"); // Name only the new region
        }
        setRegionNameModalOpen(true);
    };

    // Handle submitting the region names
    const handleRegionNameSubmit = () => {
        if (namingType === "both") {
            // Update the default region name and add a new one
            setRegionNames([defaultRegionName, newRegionName]);
            addHandle();
        } else if (namingType === "new") {
            // Only add the new region name
            setRegionNames((prev) => [...prev, newRegionName]);
            addHandle();
        }

        // Reset modal state
        setDefaultRegionName("");
        setNewRegionName("");
        setNamingType("");
        setRegionNameModalOpen(false);
    };

    return (
        <div className="detail-page">
            <button className="back-button" onClick={() => navigate("/")}>
                ← Back
            </button>
            <div className="box-info">
                <h2>{box?.name}</h2>
                <p>Budget: {box?.number}</p>
            </div>

            {/* Slider Section */}
            <Container sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Multi-Handle Slider
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <Slider
                        value={handles}
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                        step={1}
                        disableSwap
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddHandleClick}
                        disabled={handles.length >= maxHandles}
                        sx={{ ml: 2 }}
                    >
                        Add Budget
                    </Button>
                </Box>

                {/* Display Regions */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                        Budget Categories:
                    </Typography>
                    <Grid container spacing={1}>
                        {computedRegions.map((region, index) => {
                            const amount = Math.round((region * (box?.number || 0)) / 100);
                            return (
                                <Grid item key={index}>
                                    <Typography variant="body1">
                                        {index + 1}{" "} :
                                        {regionNames[index] ? ` ${regionNames[index]}` : ""}: {amount}
                                    </Typography>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Container>

            {/* Modal for Naming Regions */}
            <Modal open={regionNameModalOpen} onClose={() => setRegionNameModalOpen(false)}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 3,
                        bgcolor: "white",
                        borderRadius: 2,
                        width: 300,
                        mx: "auto",
                        mt: "20vh",
                    }}
                >
                    <Typography variant="h6">
                        {namingType === "both"
                            ? "Name Default and New Region"
                            : "Name New Region"}
                    </Typography>

                    {namingType === "both" && (
                        <TextField
                            label="Default Region Name"
                            value={defaultRegionName}
                            onChange={(e) => setDefaultRegionName(e.target.value)}
                        />
                    )}

                    <TextField
                        label="New Region Name"
                        value={newRegionName}
                        onChange={(e) => setNewRegionName(e.target.value)}
                    />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setRegionNameModalOpen(false);
                                setDefaultRegionName("");
                                setNewRegionName("");
                                setNamingType("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleRegionNameSubmit}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default DetailPage;
