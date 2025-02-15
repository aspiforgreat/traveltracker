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

    const baseUrl =  "http://localhost:8000";
    const navigate = useNavigate();
    const location = useLocation();
    const parentBox = location.state?.box;
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

    const handleAddBox = async (name, number, subbudgetEnabled) => {
        try {
            const newBox = {
                name,
                number,
                isSubBudgetEnabled: subbudgetEnabled, // Ensure this is passed correctly
                parentId: parentBox?._id || null,
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


    return (
        <Container sx={{ mt: 5 }}>
            {parentBox && (
                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Box>
            )}

            {parentBox && (
                <Typography variant="h5" gutterBottom>
                    Subbudget for {parentBox.name} (Total: {parentBox.number})
                </Typography>
            )}

            <TotalDisplay boxes={parentBox ? [{ name: parentBox.name, number: parentBox.number }] : boxes} />

            <MultiSliderBar boxes={boxes} onAllocationChange={setBoxes} />

            <Typography variant="h6" gutterBottom>
                {parentBox ? "Sub-Boxes" : "Countries"}
            </Typography>

            <Grid container spacing={2} justifyContent="center">
                {boxes.map((box) => (
                    <Grid item xs={12} sm={4} md={3} key={box._id}>
                        <DraggableBox box={box} onDragStart={handleDragStart} onDrop={handleDrop} onClick={handleBoxClick} />
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
