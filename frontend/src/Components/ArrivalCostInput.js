import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

const ArrivalCostInput = ({ id, previousBoxId, nextBoxId, tripId }) => {
    const [value, setValue] = useState("");
    const baseUrl = "http://localhost:8000";

    useEffect(() => {
        // Fetch initial value when the component mounts
        const fetchInitialValue = async (id) => {
            try {
                const response = await fetch(baseUrl+ `/api/transport-cost-connections/${nextBoxId}`);
                console.log("response", response.data)
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setValue(data.number);
                return data.number; // Assuming "number" holds the arrival cost value
            } catch (error) {
                console.error("Error fetching initial value:", error);
                return "";
            }
        };
        fetchInitialValue(nextBoxId);
    }, [nextBoxId]);

    useEffect(() => {
        const postValue = async (previousBoxId, nextBoxId, value) => {
            try {
                const response = await fetch(baseUrl+ `/api/transport-cost-connections/${nextBoxId}`, {
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

                const data = await response.json();
                return data;
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
    }, [value]);

    const handleChange = (e) => {
        setValue(e.target.value);
    };

    return (
        <TextField
            type="number"
            variant="outlined"
            size="small"
            placeholder="Arrival cost"
            sx={{
                width: 80,
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