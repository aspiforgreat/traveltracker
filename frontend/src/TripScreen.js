import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
const TripScreen = () => {
    // States for managing trips, form, and open/close dialogs
    const [trips, setTrips] = useState([]);
    const navigate = useNavigate();
    const [openForm, setOpenForm] = useState(false);
    const [newTrip, setNewTrip] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        budget: "",
    });

    // Fetch trips on component mount
    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/trips");
                setTrips(response.data);
            } catch (error) {
                console.error("There was an error fetching trips!", error);
            }
        };
        fetchTrips();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        setNewTrip({ ...newTrip, [e.target.name]: e.target.value });
    };

    // Handle form submission (create new trip)
    const handleSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:8000/api/trips", newTrip);

            // Add the newly created trip to the trips state
            setTrips((prevTrips) => [...prevTrips, response.data]);

            setOpenForm(false); // Close form dialog after submission
            setNewTrip({ name: "", description: "", startDate: "", endDate: "", budget: "" }); // Reset form fields
        } catch (error) {
            console.error("Error submitting trip", error);
        }
    };

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Button to open the form */}
            <Button variant="contained" color="primary" onClick={() => setOpenForm(true)}>
                Create Trip
            </Button>

            {/* Trips List */}
            {/* Trips List */}
            <List sx={{ marginTop: "20px" }}>
                {trips.map((trip) => (
                    <ListItem button key={trip._id}>
                        <ListItemText primary={trip.name} />
                        {/* Button to redirect to trip details */}
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                // Log the tripId and tripName to the console before navigating
                                console.log("Navigating to subbudget with:", {
                                    tripId: trip._id,
                                    tripName: trip.name
                                });
                                navigate("/subbudget", { state: { trip: trip} });
                            }}
                        >
                            View Details
                        </Button>
                    </ListItem>
                ))}
            </List>

            {/* Dialog for creating a new trip */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)}>
                <DialogTitle>Create a New Trip</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Trip Name"
                        fullWidth
                        margin="normal"
                        name="name"
                        value={newTrip.name}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        margin="normal"
                        name="description"
                        value={newTrip.description}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Start Date"
                        type="date"
                        fullWidth
                        margin="normal"
                        name="startDate"
                        value={newTrip.startDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        fullWidth
                        margin="normal"
                        name="endDate"
                        value={newTrip.endDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Budget"
                        type="number"
                        fullWidth
                        margin="normal"
                        name="budget"
                        value={newTrip.budget}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForm(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TripScreen;