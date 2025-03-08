import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/mapAnimation.json"; // Import Lottie JSON

const LottieBackground = () => {
    return (
        <Lottie
            animationData={animationData}
            loop={false}
            speed={0.01}  // Slow down the animation (default is 1, lower is slower)
            style={{
                position: "absolute",  // Keeps it in place
                top: "50%",            // Center it vertically
                left: "50%",           // Center it horizontally
                width: "200vw",        // Extend beyond viewport to ensure coverage
                height: "200vh",       // Extend beyond viewport to ensure coverage
                zIndex: -1,            // Keeps it behind all content
                opacity: 0.1,          // Adjust transparency
                transform: "translate(-50%, -50%) rotate(90deg)", // Center & rotate
                transformOrigin: "center",
                pointerEvents: "none", // Prevents blocking scroll or clicks
            }}
        />
    );
};

export default LottieBackground;