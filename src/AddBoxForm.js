// AddBoxForm.js
import React, { useState } from "react";
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel } from "@mui/material";

const AddBoxForm = ({ onClose, onSave }) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [subbudgetEnabled, setSubbudgetEnabled] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedNumber = parseInt(number);
        if (name && !isNaN(parsedNumber)) {
            onSave(name, parsedNumber, subbudgetEnabled);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ p: 3, bgcolor: "white", borderRadius: 2, width: 300 }}
        >
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
            <FormControlLabel
                control={
                    <Checkbox
                        checked={subbudgetEnabled}
                        onChange={(e) => setSubbudgetEnabled(e.target.checked)}
                    />
                }
                label="Enable Subbudgets"
                sx={{ mt: 2 }}
            />
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
