import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box as MuiBox, Button, Slider, Typography, Grid, Container } from "@mui/material";
import "./DetailPage.css";

const DetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const box = location.state?.box; // Get the box data

    // Slider state
    const [handles, setHandles] = useState([]); // positions (0-100)
    const maxHandles = 5;

    const handleSliderChange = (event, newValue) => {
        if (Array.isArray(newValue)) {
            const sorted = [...newValue].sort((a, b) => a - b);
            setHandles(sorted);
        }
    };

    // Add a new handle at a default position: 50 if none exist, or 10% to the right of the last handle (capped at 100)
    const addHandle = () => {
        if (handles.length < maxHandles) {
            let newHandle;
            if (handles.length === 0) {
                newHandle = 50;
            } else {
                newHandle = handles[handles.length - 1] + 10;
                if (newHandle > 100) newHandle = 100;
            }
            const newHandles = [...handles, newHandle].sort((a, b) => a - b);
            setHandles(newHandles);
        }
    };

    // Compute regions:
    // If handles exist, compute region from 0 to first handle, differences between adjacent handles,
    // and add a final "rest" region from the last handle to 100.
    // If no handles, the whole bar (100%) is the rest region.
    let computedRegions = [];
    if (handles.length > 0) {
        computedRegions.push(handles[0]); // Region from 0 to first handle
        for (let i = 1; i < handles.length; i++) {
            computedRegions.push(handles[i] - handles[i - 1]);
        }
        computedRegions.push(100 - handles[handles.length - 1]); // Rest region
    } else {
        computedRegions.push(100);
    }

    return (
        <div className="detail-page">
            {/* Navigation remains unchanged */}
            <button className="back-button" onClick={() => navigate("/")}>
                ← Back
            </button>
            <div className="box-info">
                <h2>{box?.name}</h2>
                <p>Budget: {box?.number}</p>
            </div>

            {/* New Large Slider Section */}
            <Container sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Multi-Handle Slider
                </Typography>
                <MuiBox sx={{ display: "flex", alignItems: "center", width: "100%" }}>
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
                        onClick={addHandle}
                        disabled={handles.length >= maxHandles}
                        sx={{ ml: 2 }}
                    >
                        Add Handle
                    </Button>
                </MuiBox>
                <MuiBox sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                        Regions (Value based on Budget):
                    </Typography>
                    <Grid container spacing={1}>
                        {computedRegions.map((region, index) => {
                            // Calculate actual value based on the box budget
                            const amount = Math.round((region * (box?.number || 0)) / 100);
                            return (
                                <Grid item key={index}>
                                    <Typography variant="body1">
                                        Region {index + 1}: {amount}
                                    </Typography>
                                </Grid>
                            );
                        })}
                    </Grid>
                </MuiBox>
            </Container>
        </div>
    );
};

export default DetailPage;
