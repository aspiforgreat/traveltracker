// SubBudgetScreen.js
import React, { useState } from "react";
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
    const navigate = useNavigate();
    const location = useLocation();
    // If a parent box is provided, we are in a nested subbudget screen.
    const parentBox = location.state?.box;

    // Use a clean slate for nested subbudgets (start with an empty array)
    // Otherwise, use default boxes.
    const [boxes, setBoxes] = useState(
        parentBox
            ? []
            : [
                { name: "Box A", number: 100, subbudgetEnabled: false },
                { name: "Box B", number: 50, subbudgetEnabled: false },
            ]
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [draggedBox, setDraggedBox] = useState(null);
    const [transferPopup, setTransferPopup] = useState(null);
    const [transferAmount, setTransferAmount] = useState("");

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

    const handleTransfer = () => {
        const amount = parseInt(transferAmount);
        if (!isNaN(amount) && transferPopup) {
            const maxTransferAmount = Math.min(transferPopup.from.number, amount);
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) => {
                    if (box.name === transferPopup.from.name) {
                        return { ...box, number: Math.max(0, box.number - maxTransferAmount) };
                    }
                    if (box.name === transferPopup.to.name) {
                        return { ...box, number: box.number + maxTransferAmount };
                    }
                    return box;
                })
            );
            setTransferPopup(null);
            setTransferAmount("");
        }
    };

    const handleAddBox = (name, number, subbudgetEnabled) => {
        setBoxes([...boxes, { name, number, subbudgetEnabled }]);
        setShowAddModal(false);
    };

    // When a box is clicked, check its subbudget flag.
    const handleBoxClick = (box) => {
        if (box.subbudgetEnabled) {
            // Navigate to a nested SubBudgetScreen with this box as parent.
            navigate("/subbudget", { state: { box } });
        } else {
            // Navigate to the standard DetailPage.
            navigate("/detail", { state: { box } });
        }
    };

    return (
        <Container sx={{ mt: 5 }}>
            {/* Conditional Back Navigation: Only show when in a nested subbudget */}
            {parentBox && (
                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Box>
            )}

            {/* Show parent info if in a nested screen */}
            {parentBox && (
                <Typography variant="h5" gutterBottom>
                    Subbudget for {parentBox.name} (Total: {parentBox.number})
                </Typography>
            )}

            {/* Total Display Component */}
            <TotalDisplay boxes={parentBox ? [{ name: parentBox.name, number: parentBox.number }] : boxes} />

            {/* MultiSliderBar for adjusting allocations */}
            <MultiSliderBar boxes={boxes} onAllocationChange={setBoxes} />

            <Typography variant="h6" gutterBottom>
                {parentBox ? "Sub-Boxes" : "Countries"}
            </Typography>

            {/* Grid of Draggable Boxes */}
            <Grid container spacing={2} justifyContent="center">
                {boxes.map((box) => (
                    <Grid item xs={12} sm={4} md={3} key={box.name}>
                        <DraggableBox box={box} onDragStart={handleDragStart} onDrop={handleDrop} onClick={handleBoxClick} />
                    </Grid>
                ))}

                {/* Add New Box Button */}
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

            {/* Add Box Modal */}
            <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <AddBoxForm onClose={() => setShowAddModal(false)} onSave={handleAddBox} />
                </Box>
            </Modal>

            {/* Transfer Modal */}
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
