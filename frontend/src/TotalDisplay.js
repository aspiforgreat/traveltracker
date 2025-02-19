import React, { useState } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Pencil icon for edit

// Function to calculate total sum of all box numbers
const calculateTotal = (boxes) => {
    return boxes.reduce((total, box) => total + box.number, 0);
};

const TotalDisplay = ({ boxes, parentTotal, setParentTotal, isHomepage }) => {
    const [userTotal, setUserTotal] = useState(parentTotal.number);  // Initialize userTotal with parent's number
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
            setParentTotal({ name: parentTotal.name, number: inputTotal }); // Update parentTotal with new number
        }
        setShowModal(false);
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>

            {/* Budget Goal Section */}
            <Box>
                <Typography variant="h6">Budget Goal: </Typography>

                {isHomepage ? (
                    <Button
                        variant="outlined"
                        onClick={handleEditClick}
                        startIcon={<EditIcon />} // Pencil icon for edit
                    >
                        {parentTotal?.number} {/* Ensure parentTotal has 'name' and 'number' */}
                    </Button>
                ) : (
                    <Typography variant="h5" color="primary">
                        {parentTotal?.number} {/* Display as Typography for sub-budgets */}
                    </Typography>
                )}
            </Box>

            {/* Total Sum of Boxes */}
            <Box>
                <Typography variant="h6">Total Allocated: </Typography>
                <Typography variant="h5" color="primary">{totalBoxSum}</Typography>
            </Box>
            <Box>
                <Typography variant="h6">Difference: </Typography>
                <Typography variant="h5" color="primary">{(parentTotal?.number ?? 0) - totalBoxSum}</Typography>
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
                        <Typography variant="h6">Edit Budget Goal</Typography>
                        <TextField
                            fullWidth
                            label="Enter New Budget Goal"
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
