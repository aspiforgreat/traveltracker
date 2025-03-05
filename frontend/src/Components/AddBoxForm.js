import React, { useState } from "react";
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel, Grid, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const AddBoxForm = ({ onClose, onSave }) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [subbudgetEnabled, setSubbudgetEnabled] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const regionNames = ["accommodation", "food", "transport"];
    const [regionToggles, setRegionToggles] = useState(
        Object.fromEntries(regionNames.map(region => [region, false]))
    );

    const handleToggleChange = (event) => {
        setRegionToggles({ ...regionToggles, [event.target.name]: event.target.checked });
    };

    const handleSubbudgetToggle = (event) => {
        setSubbudgetEnabled(event.target.checked);
        if (event.target.checked) {
            // Clear all selected regions when enabling subbudgets
            setRegionToggles(Object.fromEntries(regionNames.map(region => [region, false])));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedNumber = parseInt(number);
        if (name && !isNaN(parsedNumber)) {
            const selectedRegions = Object.keys(regionToggles).filter((key) => regionToggles[key]);
            onSave(name, parsedNumber, subbudgetEnabled, selectedRegions, startDate, endDate); // Pass dates too
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, bgcolor: "white", borderRadius: 2, width: 500 }}>
            <Typography variant="h6" gutterBottom>
                Add New Box
            </Typography>
            <TextField
                fullWidth
                label="Name"
                variant="outlined"
                sx={{ mt: 2 }}
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <TextField
                fullWidth
                label="Number"
                variant="outlined"
                type="number"
                sx={{ mt: 2 }}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
            />

            {/* Enable Subbudgets Checkbox */}
            <FormControlLabel
                control={<Checkbox checked={subbudgetEnabled} onChange={handleSubbudgetToggle} />}
                label="Enable Subbudgets"
                sx={{ mt: 2 }}
            />

            {/* Region Selection - Disabled when subbudgets are enabled */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Select Regions:
            </Typography>
            {regionNames.map((key) => (
                <FormControlLabel
                    key={key}
                    control={
                        <Checkbox
                            name={key}
                            checked={regionToggles[key]}
                            onChange={handleToggleChange}
                            disabled={subbudgetEnabled} // Disable checkboxes if subbudgets are enabled
                        />
                    }
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                />
            ))}

            {/* Date Pickers for Start and End Dates */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        variant="outlined"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        variant="outlined"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" type="submit">
                    Save
                </Button>
            </Box>
        </Box>
    );
};

export default AddBoxForm;