import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const TripScreen = () => {
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });
    };
    const handleInputChange = (e) => {
        setNewTrip({ ...newTrip, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:8000/api/trips", newTrip);
            setTrips((prevTrips) => [...prevTrips, response.data]);
            setOpenForm(false);
            setNewTrip({ name: "", description: "", startDate: "", endDate: "", budget: "" });
        } catch (error) {
            console.error("Error submitting trip", error);
        }
    };

    return (
        <Box sx={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
            {/* Header and Create Button */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Your Trips
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenForm(true)}>
                    + New Trip
                </Button>
            </Stack>

            {/* Trips Grid */}
            <Grid container spacing={3}>
                {trips.map((trip) => (
                    <Grid item xs={12} sm={6} md={4} key={trip._id}>
                        <Card
                            sx={{
                                borderRadius: "12px",
                                transition: "0.3s",
                                "&:hover": { transform: "scale(1.03)" },
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold">
                                    {trip.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {trip.description}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                                    💰 Budget: ${trip.budget}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate("/subbudget", { state: { trip } })}
                                >
                                    Explore
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Create Trip Dialog */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)}>
                <DialogTitle sx={{ fontWeight: "bold" }}>Create a New Trip</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Trip Name" name="name" value={newTrip.name} onChange={handleInputChange} fullWidth />
                        <TextField label="Description" name="description" value={newTrip.description} onChange={handleInputChange} fullWidth />
                        <TextField
                            label="Start Date"
                            type="date"
                            name="startDate"
                            value={newTrip.startDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            name="endDate"
                            value={newTrip.endDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="Budget"
                            type="number"
                            name="budget"
                            value={newTrip.budget}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setOpenForm(false)} variant="text" color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TripScreen;