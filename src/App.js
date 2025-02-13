import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Box, Button, Container, Grid, Paper, Typography, Modal, TextField } from "@mui/material";
import DetailPage from "./DetailPage";
import AddBoxForm from "./AddBoxForm";

const DraggableBox = ({ name, number, onDragStart, onDrop, onClick }) => {
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
            onDragStart={(e) => onDragStart(e, name, number)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, name, number)}
            onClick={() => onClick(name, number)}
        >
            <Typography variant="h6">{name}</Typography>
            <Typography variant="subtitle1" color="primary">{number}</Typography>
        </Paper>
    );
};

const AppContent = () => {
    const [boxes, setBoxes] = useState([
        { name: "Box A", number: 100 },
        { name: "Box B", number: 50 },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [draggedBox, setDraggedBox] = useState(null);
    const [transferPopup, setTransferPopup] = useState(null);
    const [transferAmount, setTransferAmount] = useState("");
    const navigate = useNavigate();

    const handleDragStart = (e, name, number) => {
        setDraggedBox({ name, number });
    };

    const handleDrop = (e, targetName, targetNumber) => {
        if (draggedBox && draggedBox.name !== targetName) {
            setTransferPopup({ from: draggedBox, to: { name: targetName, number: targetNumber } });
            setDraggedBox(null);
        }
    };

    const handleTransfer = () => {
        const amount = parseInt(transferAmount);
        if (!isNaN(amount) && transferPopup) {
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) => {
                    if (box.name === transferPopup.from.name) {
                        return { ...box, number: Math.max(0, box.number - amount) };
                    }
                    if (box.name === transferPopup.to.name) {
                        return { ...box, number: box.number + amount };
                    }
                    return box;
                })
            );
            setTransferPopup(null);
            setTransferAmount("");
        }
    };

    const handleAddBox = (name, number) => {
        setBoxes([...boxes, { name, number }]);
        setShowAddModal(false);
    };

    return (
        <Container sx={{ mt: 5 }}>
            <Grid container spacing={2} justifyContent="center">
                {boxes.map((box) => (
                    <Grid item xs={12} sm={4} md={3} key={box.name}>
                        <DraggableBox
                            {...box}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onClick={() => navigate("/detail", { state: { box } })}
                        />
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
                <Box sx={{ p: 4, bgcolor: "white", borderRadius: 2, mx: "auto", mt: 10, width: 300, textAlign: "center" }}>
                    <Typography variant="h6">Transfer Amount</Typography>
                    <Typography>
                        <strong>{transferPopup?.from.name} ({transferPopup?.from.number})</strong> →
                        <strong> {transferPopup?.to.name} ({transferPopup?.to.number})</strong>
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
                        <Button variant="contained" onClick={handleTransfer}>Confirm</Button>
                        <Button variant="outlined" onClick={() => setTransferPopup(null)}>Cancel</Button>
                    </Box>
                </Box>
            </Modal>
        </Container>
    );
};

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/detail" element={<DetailPage />} />
        </Routes>
    </Router>
);

export default App;
