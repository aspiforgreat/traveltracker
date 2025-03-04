import React from "react";
import * as Progress from "@radix-ui/react-progress";

const StatsDisplay = ({ stats }) => {
    if (!stats) return null;

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {Object.entries(stats).map(([key, value]) => {
                let name = key;
                if (name === "undefined") {
                    name = "Miscellaneous";
                }

                return (
                    <div key={name} className="p-4 rounded-2xl shadow-md bg-white text-center">
                        <h3 className="text-lg font-semibold capitalize">{name}</h3>
                        <p className="text-xl font-bold text-blue-600">{value}</p>
                        <Progress.Root
                            className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2"
                            style={{ transform: "translateZ(0)" }}
                            value={(value / total) * 100}
                        >
                            <Progress.Indicator
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${(value / total) * 100}%` }}
                            />
                        </Progress.Root>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsDisplay;