import React from "react";

const StatsDisplay = ({ stats }) => {
    if (!stats) return null;

    const statEntries = Object.entries(stats).filter(([key]) => key !== "undefined");
    const total = statEntries.reduce((sum, [, value]) => sum + value, 0);

    // Define a color palette (using hex values from Tailwind's default colors)
    const colors = [
        "#3B82F6", // blue-500
        "#10B981", // green-500
        "#EF4444", // red-500
        "#F59E0B", // yellow-500
        "#8B5CF6", // purple-500
        "#EC4899"  // pink-500
    ];

    return (
        <div className="space-y-6">
            {/* Stacked Progress Bar */}
            <div className="w-full h-6 rounded-full bg-gray-200 overflow-hidden">
                <div className="flex h-full">
                    {statEntries.map(([key, value], index) => {
                        const width = total > 0 ? (value / total) * 100 : 0;
                        const color = colors[index % colors.length];
                        return (
                            <div
                                key={key}
                                className="h-full transition-all duration-500 ease-in-out"
                                style={{ width: `${width}%`, backgroundColor: color }}
                            ></div>
                        );
                    })}
                </div>
            </div>

            {/* Stats List in Two Columns with Vertical Line Between Columns */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {statEntries.map(([key, value], index) => {
                    const color = colors[index % colors.length];
                    return (
                        <div
                            key={key}
                            className={`flex items-center justify-between ${index % 2 === 0 ? 'pr-4' : ''}`}
                            style={index % 2 === 0 ? { borderRight: '2px solid #ddd' } : {}}
                        >
                            <div className="flex items-center space-x-2">
                                {/* Color indicator */}
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                ></span>
                                <span className="capitalize font-medium text-gray-800">{key}</span>
                            </div>
                            <div className="font-bold text-gray-700">{value}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatsDisplay;
