import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

const ArrivalCostInput = ({ id, previousBoxId, nextBoxId, tripId, onChange, placeholder = "Arrival cost" }) => {
    const [value, setValue] = useState("");
    const baseUrl = "https://traveltrackerapi.onrender.com";

    useEffect(() => {
        // Fetch initial value when the component mounts
        const fetchInitialValue = async (id) => {
            try {
                console.log("fetching initial value for", nextBoxId, previousBoxId, placeholder);
                const response = await fetch(`${baseUrl}/api/transport-cost-connections/${previousBoxId}/${nextBoxId}`);
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setValue(data.number);
                // Notify the parent of the initial value
                if (onChange) onChange(nextBoxId, data.number);
            } catch (error) {
                console.error("Error fetching initial value:", error);
            }
        };
        fetchInitialValue(nextBoxId);
    }, [nextBoxId]);

    useEffect(() => {

    }, [onChange]);

    useEffect(() => {
        const postValue = async (previousBoxId, nextBoxId, value) => {
            try {
                const response = await fetch(`${baseUrl}/api/transport-cost-connections/${nextBoxId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        number: value,
                        fromBox: previousBoxId,
                        toBox: nextBoxId,
                        tripId: tripId,
                    }),
                });

                if (!response.ok) throw new Error("Failed to post value");

                await response.json();
            } catch (error) {
                console.error("Error posting value:", error);
            }
        };
        // Delay posting the value after the user stops typing
        const delayDebounce = setTimeout(() => {
            if (value !== "") {
                postValue(previousBoxId, nextBoxId, value);
            }
        }, 1000);

        return () => clearTimeout(delayDebounce);
    }, [value, previousBoxId, nextBoxId, tripId]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setValue(newVal);
        // Notify the parent of the updated value
        if (onChange) onChange(nextBoxId, newVal);
    };

    return (
        <TextField
            type="number"
            variant="outlined"
            size="small"
            placeholder={placeholder}
            sx={{
                width: 200,
                height: 20,
                textAlign: "center",
                backgroundColor: "white",
                borderRadius: 1,
                "& fieldset": { border: "none" },
                "& input": {
                    textAlign: "center",
                    fontSize: "16px",
                    padding: "1px 0",
                    MozAppearance: "textfield",
                    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                        WebkitAppearance: "none",
                        margin: 0,
                    },
                },
            }}
            value={value}
            onChange={handleChange}
        />
    );
};

export default ArrivalCostInput;
