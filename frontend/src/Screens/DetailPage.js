import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Typography, Container, Slider, TextField, Modal } from "@mui/material";
import "./DetailPage.css";

const getRandomColor = (existingColors) => {
    const colors = [
        "#ffadad",
        "#ffd6a5",
        "#fdffb6",
        "#caffbf",
        "#9bf6ff",
        "#a0c4ff",
        "#bdb2ff",
        "#ffc6ff",
    ];
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
    const baseUrl = "http://localhost:8000"; // Added baseUrl for persistence
    const maxHandles = 5;

    const [handles, setHandles] = useState(box?.handles || []);
    const [regionNames, setRegionNames] = useState(box?.regionNames || []);
    const [regionColors, setRegionColors] = useState(box?.regionColors || []);
    const [modalOpen, setModalOpen] = useState(false);
    const [defaultRegionName, setDefaultRegionName] = useState("");
    const [newRegionName, setNewRegionName] = useState("");
    const [namingType, setNamingType] = useState("both");

    // If we have region names but no handles, initialize handles and assign colors.
    useEffect(() => {
        if (handles.length === 0 && regionNames.length > 0) {
            const newHandles = regionNames
                .slice(0, regionNames.length - 1)
                .map((_, index) => Math.round(((index + 1) / regionNames.length) * 100));
            setHandles(newHandles);
            setRegionColors(regionNames.map(() => getRandomColor(regionColors)));
        }
    }, [regionNames, handles, regionColors]);

    // Compute region percentages based on slider handles.
    // For example, if handles = [50] then computedRegions = [50, 100-50] = [50,50].
    let computedRegions = [];
    if (handles.length > 0) {
        computedRegions = [
            handles[0],
            ...handles.slice(1).map((h, i) => h - handles[i]),
            100 - handles[handles.length - 1],
        ];
    } else {
        computedRegions = [100];
    }

    // Compute money amounts for each region based on the total budget.
    const computedMoneyRegions = computedRegions.map((perc) =>
        box?.number ? Math.round((perc / 100) * box.number) : 0
    );

    // When the slider changes, update the handles.
    const handleSliderChange = (event, newValue) => {
        if (Array.isArray(newValue)) {
            setHandles([...newValue].sort((a, b) => a - b));
        } else {
            setHandles([...handles, newValue].sort((a, b) => a - b));
        }
    };

    // When a money input changes, update the corresponding handle.
    // For region 0, update first handle; for intermediate regions, update handle[i] = previous handle + percentage equivalent of new money;
    // for the last region, update last handle so that (100 - last handle) equals the percentage for new money.
    const handleMoneyInputChange = (index, newMoney) => {
        if (!box?.number) return;
        const budget = box.number;
        let newHandles = [...handles];

        if (index === 0) {
            // First region: new handle is newMoney converted to percentage.
            newHandles[0] = Math.round((newMoney / budget) * 100);
        } else if (index < handles.length) {
            // Intermediate region: new handle = previous handle + (newMoney / budget * 100).
            newHandles[index] = newHandles[index - 1] + Math.round((newMoney / budget) * 100);
        } else {
            // Last region: update the last handle so that last region = 100 - last handle equals newMoney in percentage.
            newHandles[newHandles.length - 1] = 100 - Math.round((newMoney / budget) * 100);
        }
        setHandles(newHandles);
    };

    // Function to handle region name submission from the modal.
    const handleRegionNameSubmit = () => {
        if (namingType === "both") {
            // Rename the first region and the remaining region as two regions.
            setRegionNames([defaultRegionName, newRegionName]);
            // Set one handle dividing the budget equally.
            setHandles([50]);
            setRegionColors([getRandomColor(regionColors), getRandomColor(regionColors)]);
            setDefaultRegionName("");
            setNewRegionName("");
            setNamingType("new");
            setModalOpen(false);
        } else {
            // Add the new region name.
            setRegionNames([...regionNames, newRegionName]);
            setDefaultRegionName("");
            setNewRegionName("");
            setModalOpen(false);
        }
    };

    const addHandle = () => {
        if (handles.length < maxHandles) {
            let newHandle = handles.length === 0 ? 50 : Math.min(handles[handles.length - 1] + 10, 100);
            if (regionNames.length === 0) {
                setNamingType("both");
                setModalOpen(true);
            } else {
                setHandles([...handles, newHandle].sort((a, b) => a - b));
                setRegionColors([...regionColors, getRandomColor(regionColors)]);
                setNamingType("new");
                setModalOpen(true);
            }
        }
    };

    // --- NEW: Persist changes to the backend with a 1s cooldown ---
    useEffect(() => {
        const timer = setTimeout(() => {
            if (box?._id) {
                const updatedFields = { handles, regionNames, regionColors };
                fetch(`${baseUrl}/api/boxes/${box._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedFields)
                })
                    .then((res) => res.json())
                    .then((data) => console.log("Box updated:", data))
                    .catch((err) => console.error("Error updating box:", err));
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [handles, regionNames, regionColors, box, baseUrl]);
    // --- End of persistence code ---

    return (
        <div className="detail-page">
            <button className="back-button" onClick={() => navigate(-1)}>
                ← Back
            </button>
            <div className="box-info">
                <h2>{box?.name}</h2>
                <p>Budget: {box?.number}</p>
            </div>
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "1200px", mx: "auto" }}>
                    {/* Budget Allocation Title */}
                    <Typography variant="h6" gutterBottom>
                        Budget Allocation
                    </Typography>

                    {/* Budget Bar & Slider */}
                    <Box sx={{ position: "relative", width: "100%", height: "60px", mb: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                width: "100%",
                                height: "50px",
                                borderRadius: "10px",
                                overflow: "hidden",
                            }}
                        >
                            {computedRegions.map((region, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        flex: region,
                                        backgroundColor:
                                            index === computedRegions.length - 1
                                                ? "lightgray"
                                                : regionColors[index] || getRandomColor(regionColors),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#000",
                                        fontWeight: "bold",
                                        padding: "4px",
                                        borderRight: index < computedRegions.length - 1 ? "2px solid white" : "none",
                                    }}
                                >
                                    {regionNames[index] || "Unnamed"}:{" "}
                                    {box?.number ? Math.round((region / 100) * box.number) : 0}
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

                    {/* Add Budget Button */}
                    <Button variant="contained" onClick={addHandle} disabled={handles.length >= maxHandles}>
                        Add Budget
                    </Button>

                    {/* Numeric Input Fields for Each Region */}
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                        {computedMoneyRegions.map((money, index) => (
                            <TextField
                                key={index}
                                type="number"
                                label={regionNames[index] || `Region ${index + 1}`}
                                value={money}
                                onChange={(e) => handleMoneyInputChange(index, Number(e.target.value))}
                                fullWidth
                            />
                        ))}
                    </Box>
                </Box>
            </Container>

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
                        <Button variant="outlined" onClick={() => setModalOpen(false)}>
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
