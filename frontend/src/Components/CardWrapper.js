import React from "react";
import { Card, CardContent, Box } from "@mui/material";

// Standalone Card Component with White Background and Shadow
const CardWrapper = ({ children, sx, cardsx = {}, ...props }) => {
    return (
        <Box sx={{ ...sx }}>  {/* Outer padding applied here */}
            <Card
                sx={{
                    backgroundColor: 'white',    // White background
                    boxShadow: 6,                // Subtle shadow for depth
                    borderRadius: 2,             // Rounded corners
                    padding: 2,
                    ...cardsx// Inner padding for Card// Allow custom styles to be passed
                }}
                {...props} // Allow other props to be passed (like variant, etc.)
            >
                <CardContent>
                    {children}  {/* Content goes here */}
                </CardContent>
            </Card>
        </Box>
    );
};

export default CardWrapper;
