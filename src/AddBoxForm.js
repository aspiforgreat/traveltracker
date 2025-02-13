import React, { useState } from "react";
import { Box, Button, TextField, Paper, Typography } from "@mui/material";

const AddBoxForm = ({ onClose, onSave }) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !number) return;
        onSave(name, parseFloat(number));
        setName("");
        setNumber("");
        onClose();
    };

    return (
        <Paper sx={{ p: 4, width: 300, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Add a New Box</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Number"
                    type="number"
                    variant="outlined"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Button variant="outlined" onClick={onClose}>Cancel</Button>
                    <Button variant="contained" type="submit">Save</Button>
                </Box>
            </form>
        </Paper>
    );
};

export default AddBoxForm;
