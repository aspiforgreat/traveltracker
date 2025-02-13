import React, { useState } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

// Function to calculate total sum of all box numbers
const calculateTotal = (boxes) => {
    return boxes.reduce((total, box) => total + box.number, 0);
};

const TotalDisplay = ({ boxes }) => {
    const [userTotal, setUserTotal] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const totalBoxSum = calculateTotal(boxes);
    const difference = userTotal - totalBoxSum;
    const differenceColor = difference >= 0 ? "green" : "red";

    const handleEditClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSaveUserTotal = () => {
        const inputTotal = parseFloat(userTotal);
        if (!isNaN(inputTotal)) {
            setUserTotal(inputTotal);
        }
        setShowModal(false);
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            {/* User Total Button */}
            <Box>
                <Typography variant="h6"> Total Budget: </Typography>
                <Button onClick={handleEditClick} sx={{ fontSize: "1.5rem", textTransform: "none" }}>
                    {userTotal}
                </Button>
            </Box>

            {/* Total Sum of Boxes */}
            <Box>
                <Typography variant="h6">Total allocated: </Typography>
                <Typography variant="h5" color="primary">{totalBoxSum}</Typography>
            </Box>

            {/* Difference */}
            <Box>
                <Typography variant="h6">Difference: </Typography>
                <Typography variant="h5" color={differenceColor}>
                    {difference}
                </Typography>
            </Box>

            {/* Modal for Editing User Total */}
            <Modal open={showModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            bgcolor: "white",
                            borderRadius: 2,
                            width: 300,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6">Edit User Total</Typography>
                        <TextField
                            fullWidth
                            label="Enter New Total"
                            type="number"
                            value={userTotal}
                            onChange={(e) => setUserTotal(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Button onClick={handleCloseModal} variant="outlined">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveUserTotal} variant="contained">
                                Save
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default TotalDisplay;
