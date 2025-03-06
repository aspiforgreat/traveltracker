import React from "react";
import { Card, CardContent, Box } from "@mui/material";

// Standalone Card Component with White Background and Matching Shadow
const CardWrapper = ({ children, sx, cardsx = {}, ...props }) => {
    return (
        <Box sx={{ ...sx }}>  {/* Outer padding applied here */}
            <Card
                sx={{
                    backgroundColor: 'white',
                    boxShadow: "0px 8px 24px rgba(100, 149, 237, 0.25)", // Darker blue-gray shadow
                    borderRadius: 3, // Smooth rounded corners
                    padding: 2,
                    ...cardsx // Allow custom styles to be passed
                }}
                {...props}
            >
                <CardContent>
                    {children}  {/* Content goes here */}
                </CardContent>
            </Card>
        </Box>
    );
};

export default CardWrapper;
