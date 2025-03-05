import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Card, Container, Grid, Paper, Typography, Modal, TextField } from "@mui/material";
import AddBoxForm from "../Components/AddBoxForm";
import TotalDisplay from "../Components/TotalDisplay";
import ArrivalCostInput from "../Components/ArrivalCostInput";
import MultiSliderBar from "../Components/MultiSliderBar";
import StatsDisplay from "../Components/StatsDisplay";

import "./SubBudgetScreen.css";

import dayjs from "dayjs"; // Ensure you have dayjs installed: npm install dayjs

const DraggableBox = ({ box, onDragStart, onDrop, onClick, onDelete }) => {
    const { name, number, startDate, endDate } = box;

    // Format dates compactly
    const formatDate = (date) => (date ? dayjs(date).format("MMM D") : null);
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    return (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            {/* Main Budget Box */}
            <Card
                elevation={3}
                sx={{
                    flex: 1,
                    padding: 2,
                    borderRadius: 2,
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "80px",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                }}
                draggable
                onDragStart={(e) => onDragStart(e, box)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, box)}
                onClick={() => onClick(box)}
            >
                {/* Left Side: Name + Dates */}
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    {/* Name */}
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {name}
                    </Typography>

                    {/* Display Start and End Date if both exist */}
                    {start && end && (
                        <Typography variant="body1" sx={{ color: "gray", fontWeight: "light" }}>
                            {start} → {end}
                        </Typography>
                    )}
                </Box>


                {/* Right Side: Number */}
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4CAF50" }}>
                    ${number.toLocaleString()}
                </Typography>
            </Card>

            {/* Thinner Delete Bar */}
            <Box
                sx={{
                    ml: 1,
                    width: "15px",
                    height: "60px",
                    borderRadius: 2,
                    backgroundColor: "#f59790",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#d32f2f" },
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(box);
                }}
            />
        </Box>
    );
};

const SubBudgetScreen = () => {
    const baseUrl = "http://localhost:8000";
    const navigate = useNavigate();
    const location = useLocation();
    const  trip = location.state?.trip;
    const parentBox = location.state?.box; // Passed parentBox from previous screen

    const [parentData, setParentData] = useState(parentBox);
    const [parentTotal, setParentTotal] = useState(
        parentBox ? { number: parentBox.number } : { number: trip?.budget ?? 0 }
    );
    const [regionsData, setRegionsData] = useState({});

    // State to store the compiled (aggregated) regions for all boxes when no parentBox exists
    const [compiledRegions, setCompiledRegions] = useState(null);
    const [connections, setConnections] = useState({});

    const [boxes, setBoxes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [draggedBox, setDraggedBox] = useState(null);
    const [transferPopup, setTransferPopup] = useState(null);
    const [transferAmount, setTransferAmount] = useState("");
    const [arrivalCostValues, setArrivalCostValues] = useState({});

    // Handler to update the arrival cost for a specific box
    const handleArrivalCostChange = (boxId, newValue) => {
        setArrivalCostValues((prev) => ({
            ...prev,
            [boxId]: Number(newValue) || 0,
        }));
    };

    // Calculate the total arrival cost
    const totalArrivalCost = Object.values(arrivalCostValues).reduce(
        (acc, curr) => acc + curr,
        0
    );

    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                console.log("parentbox", parentBox);
                if (parentBox) {
                    // If parentBox exists, fetch the child boxes of that parent box
                    const response = await axios.get(baseUrl + "/api/boxes", {
                        params: { parentId: parentBox._id, tripId: trip._id }, // Always pass tripId
                    });
                    console.log("Fetched Boxes for Parent Box:", response.data);
                    setBoxes(response.data);
                } else if (trip) {
                    // If no parentBox, fetch the first-level boxes related to the trip
                    const response = await axios.get(baseUrl + "/api/boxes", {
                        params: { parentId: null, tripId: trip._id }, // Always pass tripId
                    });
                    console.log("Fetched Boxes for Trip:", response.data);
                    setBoxes(response.data);
                }
            } catch (error) {
                console.error("Error fetching boxes:", error);
                setBoxes([]);
            }
        };

        fetchBoxes();

    }, [trip, parentBox]); // Re-run the effect when trip or parentBox changes

    useEffect(() => {

        const fetchAndCompileAllBoxesRegions = async () => {
            try {
                let aggregatedRegions = {};
                let newRegionsData = {}; // Temporary object to store fetched regions before batch updating state

                for (const box of boxes) {
                    try {
                        const regionResponse = await axios.get(`${baseUrl}/api/regions/${box._id}`);

                        // Ensure regionResponse.data exists and contains regions
                        if (!regionResponse.data || typeof regionResponse.data !== "object") {
                            console.error(`Invalid response for box ${box.name}:`, regionResponse.data);
                            continue;
                        }

                        const boxRegions = regionResponse.data || {}; // Default to empty object if undefined
                        console.log(`Fetched regions for box ${box.name}:`, boxRegions);

                        // Aggregate region values across all boxes
                        for (const [regionName, value] of Object.entries(boxRegions)) {
                            if (regionName && value !== undefined) { // Ensure valid region name and value
                                aggregatedRegions[regionName] = (aggregatedRegions[regionName] || 0) + value;
                            }
                        }

                        // Store each box's individual region data temporarily
                        newRegionsData[box._id] = { regions: boxRegions };
                    } catch (error) {
                        console.error(`Error fetching regions for box ${box._id}:`, error);
                    }
                }

                // Batch update state
                setRegionsData(prevData => ({ ...prevData, ...newRegionsData }));
                setCompiledRegions(aggregatedRegions);
                console.log("Compiled all regions:", aggregatedRegions);
            } catch (error) {
                console.error("Error fetching all boxes' region data:", error);
            }
        };


        const fetchAndSumRegions = async () => {
                await fetchAndCompileAllBoxesRegions();
        };

        fetchAndSumRegions();
    }, [parentBox, trip, boxes]); // Re-run when parentBox, trip, or boxes change
    // Re-run when parentBox, trip, or boxes change

    const handleDragStart = (e, box) => {
        setDraggedBox(box);
    };

    const handleDrop = (e, targetBox) => {
        if (draggedBox && draggedBox.name !== targetBox.name) {
            setTransferPopup({
                from: draggedBox,
                to: targetBox,
            });
            setDraggedBox(null);
        }
    };

    const handleTransfer = async () => {
        const amount = parseInt(transferAmount);
        if (!isNaN(amount) && transferPopup) {
            const maxTransferAmount = Math.min(transferPopup.from.number, amount);
            const updatedBoxes = boxes.map((box) => {
                if (box._id === transferPopup.from._id) {
                    return { ...box, number: Math.max(0, box.number - maxTransferAmount) };
                }
                if (box._id === transferPopup.to._id) {
                    return { ...box, number: box.number + maxTransferAmount };
                }
                return box;
            });
            setBoxes(updatedBoxes);

            const fromBox = updatedBoxes.find(box => box._id === transferPopup.from._id);
            const toBox = updatedBoxes.find(box => box._id === transferPopup.to._id);

            try {
                await axios.patch(`${baseUrl}/api/boxes/${fromBox._id}`, { number: fromBox.number });
                await axios.patch(`${baseUrl}/api/boxes/${toBox._id}`, { number: toBox.number });
            } catch (error) {
                console.error("Error saving transfer", error);
            }
            setTransferPopup(null);
            setTransferAmount("");
        }
    };

    const handleAddBox = async (name, number, subbudgetEnabled, selectedRegions, startDate, endDate) => {
        try {
            // Get the tripId from the trip state or from props if it's passed down
            const tripId = trip?._id || null; // Assuming `trip` is passed via props or location state
            console.log("Adding box to trip:", tripId);

            const newBox = {
                name,
                number,
                isSubBudgetEnabled: subbudgetEnabled,
                regionNames: selectedRegions,
                tripId: tripId, // Always include tripId
                startDate, // Add the start date
                endDate,   // Add the end date
            };

            // If there's a parentBox, associate the new box with the parent
            if (parentBox) {
                newBox.parentId = parentBox._id;
            }

            console.log("new box data:", newBox);

            // Make the request to the backend with the new box data
            const response = await axios.post(baseUrl + "/api/boxes", newBox);

            // Update the state to reflect the newly added box
            setBoxes((prevBoxes) => [...prevBoxes, response.data]);

            // Close the modal after successful submission
            setShowAddModal(false);
        } catch (error) {
            console.error("Error adding box:", error);
        }
    };
    const handleBoxClick = (box) => {
        if (box.isSubBudgetEnabled) {
            navigate("/subbudget", { state: { box, trip } });
        } else {
            navigate("/detail", { state: { box, trip } });
        }
    };

    const handleSaveAllocations = async () => {
        try {
            const updatePromises = boxes.map((box) =>
                axios.put(`${baseUrl}/api/boxes/${box._id}`, { number: box.number })
            );
            await Promise.all(updatePromises);
            console.log("Allocations saved successfully.");
        } catch (error) {
            console.error("Error saving allocations", error);
        }
    };

    const handleSaveParentTotal = async () => {
        if (!parentData) return;
        try {
            const response = await axios.patch(`${baseUrl}/api/boxes/${parentData._id}`, { number: parentTotal });
            setParentData(response.data);
            console.log("Parent budget updated successfully.");
        } catch (error) {
            console.error("Error saving parent's total", error);
        }
    };

    const handleDeleteBox = async (box) => {
        try {
            await axios.delete(`${baseUrl}/api/boxes/${box._id}`);
            setBoxes((prevBoxes) => prevBoxes.filter((b) => b._id !== box._id));
            console.log("Box deleted successfully.");
        } catch (error) {
            console.error("Error deleting box", error);
        }
    };

    // --- New: Redistribution logic ---
    const handleRedistribute = async () => {
        // Get the total budget entered by the user
        const totalBudget = parentData ? parentData.number : parentTotal.number;
        if (!totalBudget || boxes.length === 0) return;

        // Calculate the sum of the current allocations
        const currentSum = boxes.reduce((acc, box) => acc + box.number, 0);
        if (currentSum === 0) return; // Prevent division by zero


        // Recalculate each box's number proportionally
        const redistributedBoxes = boxes.map((box) => {
            const newNumber = Math.round((box.number / currentSum) * (totalBudget-totalArrivalCost));
            return { ...box, number: newNumber };
        });
        setBoxes(redistributedBoxes);

        // Optionally, persist the changes to the backend
        try {
            await Promise.all(
                redistributedBoxes.map((box) =>
                    axios.put(`${baseUrl}/api/boxes/${box._id}`, { number: box.number })
                )
            );
            console.log("Redistributed allocations saved.");
        } catch (error) {
            console.error("Error saving redistributed allocations", error);
        }
    };
    // --- End Redistribution logic ---

    return (
        <Container sx={{ mt: 5 }}>
                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Box>


            {parentData && (
                <>
                    <Typography variant="h5" gutterBottom>
                        Subbudget for {parentData.name}
                    </Typography>
                </>
            )}

            <TotalDisplay
                boxes={boxes}
                parentTotal={parentData ? { name: parentData.name, number: parentData.number } : parentTotal}
                setParentTotal={setParentTotal}
                isHomepage={!parentData}
                onRedistribute={handleRedistribute}  // Pass the function as a prop
                arrivalCost={totalArrivalCost}
            />

            <MultiSliderBar boxes={boxes} onAllocationChange={setBoxes} onAllocationsCommit={handleSaveAllocations} />

            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    mt: 4,
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    color: "#050505",  // Vibrant Green (or any color you prefer)
                    textTransform: "uppercase", // Makes it all uppercase
                    letterSpacing: 1.5, // Adds spacing between the letters
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for emphasis
                    background: "linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(255, 87, 34, 1) 100%)", // Gradient background
                    WebkitBackgroundClip: "text",  // Clips the background to the text itself
                }}
            >
                {parentData ? "Stops" : "Stops"}
            </Typography>


            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                {/* First Input Field (Before First Box) */}
                <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", mb: 2,}}>
                    <ArrivalCostInput
                        id={boxes[0 ]?._id  ?? null }// Unique identifier for each input field
                        previousBoxId={null}  // Previous box ID
                        nextBoxId={boxes[0 ]?._id ?? null } // Current box ID (as next box)
                        tripId={trip?._id ?? null}
                        onChange={handleArrivalCostChange}
                        placeholder={"Departure/Round Trip cost"}
                    />
                    {/* Downward Arrow (No Top Line) */}
                    <Box className="arrow-container"> {/* Apply the custom class here */}
                        <Box className="arrow-box" />
                    </Box>
                </Box>

                {boxes.map((box, index) => (
                    <React.Fragment key={box._id}>
                        {index !== 0 && (
                            <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column",paddingTop:"10px", mb: 2 }}>
                                {/* Light Gray Top Line */}
                                <Box sx={{ width: 2, height: 10, backgroundColor: "#ccc", mb: 1, paddingTop:"10px" }} />

                                {/* Input Field */}
                                <ArrivalCostInput
                                    id={box._id}  // Unique identifier for each input field
                                    previousBoxId={boxes[index-1 ]._id }  // Previous box ID
                                    nextBoxId={box._id } // Current box ID (as next box)
                                    tripId={trip?._id ?? null}
                                    onChange={handleArrivalCostChange}
                                />

                                {/* Light Gray Bottom Line with Arrow */}
                                <Box sx={{ width: 2, height: 10, backgroundColor: "#ccc", position: "relative", mt: 1 }}>
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            top: 10,
                                            borderLeft: "6px solid transparent",
                                            borderRight: "6px solid transparent",
                                            borderTop: "8px solid #ccc",
                                            paddingBottom: "8px",
                                        }}
                                    />
                                </Box>
                            </Box>
                        )}

                        <DraggableBox
                            box={box}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onClick={handleBoxClick}
                            onDelete={handleDeleteBox}
                        />
                    </React.Fragment>
                ))}

                <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", mb: 2, paddingTop:"10px"}}>
                {/* Light Gray Top Line */}
                    <Box sx={{ width: 2, height: 10, backgroundColor: "#ccc", mb: 1, paddingTop:"10px" }} />
                    {boxes.length > 0 ? (
                        <ArrivalCostInput
                            id={boxes[boxes.length - 1]._id} // Last box ID
                            previousBoxId={boxes[boxes.length - 1]._id} // Same as last box ID
                            nextBoxId={null} // Next box ID is null
                            tripId={trip?._id ?? null}
                            onChange={handleArrivalCostChange}
                            placeholder={"Return cost"}
                        />
                    ) : null}
                </Box>

                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button
                        variant="contained"
                        sx={{
                            flex: 1, // Matches DraggableBox width behavior
                            borderRadius: 2,
                            height: "40px", // Matches DraggableBox height
                            padding: "20px",
                            fontSize: "24px", // Makes the "+" more prominent
                        }}
                        onClick={() => setShowAddModal(true)}
                    >
                        +
                    </Button>
                </Box>
            </Box>

            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    mt: 4,
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    color: "#050505",  // Vibrant Green (or any color you prefer)
                    textTransform: "uppercase", // Makes it all uppercase
                    letterSpacing: 1.5, // Adds spacing between the letters
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for emphasis
                    background: "linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(255, 87, 34, 1) 100%)", // Gradient background
                    WebkitBackgroundClip: "text",  // Clips the background to the text itself
                }}
            >
                Stats
            </Typography>
            <div className="p-6">
                <StatsDisplay stats={{ ...compiledRegions, "Travel Costs": totalArrivalCost }} />
            </div>
            <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <AddBoxForm onClose={() => setShowAddModal(false)} onSave={handleAddBox} />
                </Box>
            </Modal>

            <Modal open={Boolean(transferPopup)} onClose={() => setTransferPopup(null)}>
                <Box
                    sx={{
                        p: 4,
                        bgcolor: "white",
                        borderRadius: 2,
                        mx: "auto",
                        mt: 10,
                        width: 300,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h6">Transfer Amount</Typography>
                    <Typography>
                        <strong>
                            {transferPopup?.from.name} ({transferPopup?.from.number})
                        </strong>{" "}
                        →{" "}
                        <strong>
                            {transferPopup?.to.name} ({transferPopup?.to.number})
                        </strong>
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Amount"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={handleTransfer}
                        disabled={isNaN(transferAmount) || transferAmount <= 0}
                    >
                        Transfer
                    </Button>
                </Box>
            </Modal>
        </Container>

    );
};

export default SubBudgetScreen;