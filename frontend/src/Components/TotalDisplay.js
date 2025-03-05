import React, { useState, useEffect } from "react";
import { Box, Button, Modal, TextField, Typography, Card, CardContent, CardActions } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Pencil icon for edit

// Function to calculate total sum of all box numbers
const calculateTotal = (boxes) => {
    return boxes.reduce((total, box) => total + box.number, 0);
};

const TotalDisplay = ({ boxes, parentTotal, setParentTotal, isHomepage, onRedistribute, arrivalCost }) => {
    const [userTotal, setUserTotal] = useState(parentTotal.number);  // Initialize userTotal with parent's number
    const [showModal, setShowModal] = useState(false);

    const totalBoxSum = calculateTotal(boxes);
    const difference = (isHomepage ? userTotal ?? 0 : parentTotal.number ?? 0) - (totalBoxSum+arrivalCost)
    const differenceString = Math.abs(difference) < 2 ? "" : difference >= 0 ? `+${difference}` : `${difference}`;


    const differenceColor = difference >= 0 ? "green":"red";

    const handleEditClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/budget");
                if (!response.ok) {
                    throw new Error("Error fetching budget");
                }
                const data = await response.json();
                setUserTotal(data.number); // Update the state with the fetched budget number
                setParentTotal({ number: data.number }); // Also update the parent state
            } catch (error) {
                console.error("Error fetching budget:", error);
            }
        };

        fetchBudget();
    }, [setParentTotal]); // Run only once on component mount


    const handleSaveUserTotal = async () => {
        const baseUrl = "http://localhost:8000";
        const inputTotal = parseFloat(userTotal);
        if (!isNaN(inputTotal)) {
            // Update parent total locally
            setParentTotal({ number: inputTotal });

            // Send the API request to update the budget goal
            try {
                const response = await fetch(baseUrl + `/api/budget/`, {
                    method: 'PATCH',  // Use PATCH to update the budget goal
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ number: inputTotal }),  // send the updated total
                });

                if (!response.ok) {
                    throw new Error('Error updating budget');
                }

                // Optionally: show success message or handle response here
                console.log("Budget updated successfully");

            } catch (error) {
                // Handle error (e.g., show error message)
                console.error("Error updating budget:", error);
            }
        }
        setShowModal(false);
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3, mb: 3 }}>

                {/* Budget Goal Card (Left Card with green-blue-teal gradient) */}
                <Card
                    sx={{
                        width: "100%",  // Full width
                        background: 'linear-gradient(135deg, #00b894, #00cec9)',
                        color: 'white',
                        boxShadow: 5, // Shadow for the card
                        borderRadius: 2, // Optional: rounded corners
                    }}
                >
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'light' }}>
                            Budget Goal
                        </Typography>

                        <Typography variant="h5" color="inherit">{parentTotal.number}</Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            variant="outlined"
                            onClick={handleEditClick}
                            startIcon={<EditIcon />}
                            fullWidth
                            sx={{ color: 'white', borderColor: 'white' }} // White text and border for the button
                        >
                            Edit
                        </Button>
                    </CardActions>
                </Card>

                {/* Total Allocated Card (Right Card with orange-reddish gradient) */}
                <Card
                    sx={{
                        width: "100%",  // Full width
                        background: 'linear-gradient(135deg, #f39c12, #e74c3c)',
                        color: 'white',
                        boxShadow: 3, // Shadow for the card
                        borderRadius: 2, // Optional: rounded corners
                    }}
                >
                    <CardContent>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 3,  // Space between columns
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            {/* Total Allocated Column */}
                            <Box sx={{ flex: 1, textAlign: 'left' }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'light'  }}>
                                    Allocated
                                </Typography>
                                <Typography variant="h5" sx={{ color: 'white' }}>
                                    {totalBoxSum}
                                </Typography>
                            </Box>

                            {/* Travel Costs Column */}
                            <Box sx={{ flex: 1, textAlign: 'left' }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'light'  }}>
                                    Travel Costs
                                </Typography>
                                <Typography variant="h5" sx={{ color: 'white' }}>
                                    {`+${arrivalCost}`}
                                </Typography>
                            </Box>

                            {/* Difference Column */}
                            {differenceString !== "" && (
                                <Box sx={{ flex: 1, textAlign: 'right' }}>
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'light'  }}>
                                        Difference
                                    </Typography>
                                    <Typography variant="h5" color={differenceColor} >
                                        {differenceString}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                    <CardActions>
                        <Button variant="outlined" onClick={onRedistribute} fullWidth sx={{ color: 'white', borderColor: 'white' }}>
                            Fit Goal
                        </Button>
                    </CardActions>
                </Card>

            {/* Difference Card
            <Card sx={{ width: 300 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Difference</Typography>
                    <Typography variant="h5" color={differenceColor}>
                        {(isHomepage ? userTotal ?? 0 : parentTotal.number ?? 0) - totalBoxSum}
                    </Typography>
                </CardContent>
            </Card>
            */}

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