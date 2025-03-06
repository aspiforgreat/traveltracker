import React from "react";
import { Card, CardContent, Box } from "@mui/material";

// Standalone Card Component with White Background and Matching Shadow
const CardWrapper = ({ children, sx, cardsx = {}, ...props }) => {
    return (
        <Box sx={{ ...sx }}>  {/* Outer padding applied here */}
            <Card
                sx={{
                    backgroundColor: '#ffffff', // White background
                    boxShadow: "-12px 12px 12px rgba(0, 128, 128, 0.25)" ,// Teal shadow with some transparency
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
