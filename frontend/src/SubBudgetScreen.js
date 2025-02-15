import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Container, Grid, Paper, Typography, Modal, TextField } from "@mui/material";
import AddBoxForm from "./AddBoxForm";
import TotalDisplay from "./TotalDisplay";
import MultiSliderBar from "./MultiSliderBar";

const DraggableBox = ({ box, onDragStart, onDrop, onClick }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                padding: 2,
                borderRadius: 2,
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "#fff",
                "&:hover": { backgroundColor: "#f0f0f0" },
            }}
            draggable
            onDragStart={(e) => onDragStart(e, box)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, box)}
            onClick={() => onClick(box)}
        >
            <Typography variant="h6">{box.name}</Typography>
            <Typography variant="subtitle1" color="primary">
                {box.number}
            </Typography>
        </Paper>
    );
};

const SubBudgetScreen = () => {
    const baseUrl = "http://localhost:8000";
    const navigate = useNavigate();
    const location = useLocation();
    const parentBox = location.state?.box;

    // If a parent exists, keep a separate state for it so its total can be updated.
    const [parentData, setParentData] = useState(parentBox);
    const [parentTotal, setParentTotal] = useState(parentBox?.number || 0);

    const [boxes, setBoxes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [draggedBox, setDraggedBox] = useState(null);
    const [transferPopup, setTransferPopup] = useState(null);
    const [transferAmount, setTransferAmount] = useState("");

    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                const response = await axios.get(baseUrl + "/api/boxes", {
                    params: { parentId: parentBox?._id || null },
                });
                console.log("Fetched Boxes:", response.data); // Debugging
                setBoxes(response.data);
            } catch (error) {
                console.error("Error fetching boxes:", error);
                setBoxes([]); // Ensure boxes is always an array
            }
        };

        fetchBoxes();
    }, [parentBox]);

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

    // When a transfer is confirmed, update state and persist changes to backend.
    const handleTransfer = async () => {
        const amount = parseInt(transferAmount);
        if (!isNaN(amount) && transferPopup) {
            const maxTransferAmount = Math.min(transferPopup.from.number, amount);
            // Calculate new allocations
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

            // Persist the changes for both boxes
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

    const handleAddBox = async (name, number, subbudgetEnabled, selectedRegions) => {
        try {
            console.log(selectedRegions);
            const newBox = {
                name,
                number,
                isSubBudgetEnabled: subbudgetEnabled,
                parentId: parentBox?._id || null,
                regionNames: selectedRegions, // Add selected regions here
            };

            const response = await axios.post(baseUrl + "/api/boxes", newBox);
            setBoxes((prevBoxes) => [...prevBoxes, response.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error("Error adding box:", error);
        }
    };

    const handleBoxClick = (box) => {
        if (box.isSubBudgetEnabled) {
            navigate("/subbudget", { state: { box } });
        } else {
            navigate("/detail", { state: { box } });
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





    // Called when the parent's total budget is updated via the TextField.
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

    return (
        <Container sx={{ mt: 5 }}>
            {parentData && (
                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Box>
            )}

            {parentData && (
                <>
                    <Typography variant="h5" gutterBottom>
                        Subbudget for {parentData.name} (Total: {parentData.number})
                    </Typography>

                </>
            )}

            <TotalDisplay
                boxes={
                    parentData
                        ? [{ name: parentData.name, number: parentData.number }]
                        : boxes
                }
            />

            <MultiSliderBar boxes={boxes} onAllocationChange={setBoxes}   onAllocationsCommit={handleSaveAllocations} // Save automatically when user stops sliding
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                {parentData ? "Sub-Boxes" : "Countries"}
            </Typography>

            <Grid container spacing={2} justifyContent="center">
                {boxes.map((box) => (
                    <Grid item xs={12} sm={4} md={3} key={box._id}>
                        <DraggableBox
                            box={box}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onClick={handleBoxClick}
                        />
                    </Grid>
                ))}

                <Grid item xs={12} sm={4} md={3}>
                    <Button
                        variant="contained"
                        sx={{ width: "100%", height: "100%", borderRadius: 2 }}
                        onClick={() => setShowAddModal(true)}
                    >
                        +
                    </Button>
                </Grid>
            </Grid>

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
                        label="Amount"
                        type="number"
                        variant="outlined"
                        sx={{ mt: 2 }}
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                    />
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                        <Button variant="contained" onClick={handleTransfer}>
                            Confirm
                        </Button>
                        <Button variant="outlined" onClick={() => setTransferPopup(null)}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Container>
    );
};

export default SubBudgetScreen;
