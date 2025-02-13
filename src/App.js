import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import DetailPage from "./DetailPage";

const Box = ({ name, number, onDragStart, onDrop, onClick }) => {
    return (
        <div
            className="box"
            draggable
            onDragStart={(e) => onDragStart(e, name, number)}
            onDragOver={(e) => e.preventDefault()} // Allows dropping
            onDrop={(e) => onDrop(e, name, number)}
            onClick={() => onClick(name, number)}
        >
            <div className="box-name">{name}</div>
            <div className="box-number">{number}</div>
        </div>
    );
};

const AppContent = () => {
    const [boxes, setBoxes] = useState([
        { name: "Box A", number: 100 },
        { name: "Box B", number: 50 },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBox, setNewBox] = useState({ name: "", number: "" });
    const [draggedBox, setDraggedBox] = useState(null);
    const [transferPopup, setTransferPopup] = useState(null);
    const [transferAmount, setTransferAmount] = useState("");
    const navigate = useNavigate();

    const handleDragStart = (e, name, number) => {
        setDraggedBox({ name, number });
    };

    const handleDrop = (e, targetName, targetNumber) => {
        if (draggedBox && draggedBox.name !== targetName) {
            setTransferPopup({ from: draggedBox, to: { name: targetName, number: targetNumber } });
            setDraggedBox(null);
        }
    };

    const handleTransfer = () => {
        const amount = parseInt(transferAmount);
        if (!isNaN(amount) && transferPopup) {
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) => {
                    if (box.name === transferPopup.from.name) {
                        return { ...box, number: Math.max(0, box.number - amount) }; // Subtract from source
                    }
                    if (box.name === transferPopup.to.name) {
                        return { ...box, number: box.number + amount }; // Add to target
                    }
                    return box;
                })
            );
            setTransferPopup(null);
            setTransferAmount("");
        }
    };

    const handleAddBox = () => {
        if (newBox.name && newBox.number) {
            setBoxes([...boxes, { ...newBox }]);
            setNewBox({ name: "", number: "" });
            setShowAddModal(false);
        }
    };

    return (
        <div className="container">
            {boxes.map((box) => (
                <Box
                    key={box.name}
                    {...box}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    onClick={() => navigate("/detail", { state: { box } })}
                />
            ))}

            {/* Add Box Button */}
            <div className="box add-box" onClick={() => setShowAddModal(true)}>
                <span>+</span>
            </div>

            {/* Add Box Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Box</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={newBox.name}
                            onChange={(e) => setNewBox({ ...newBox, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Number"
                            value={newBox.number}
                            onChange={(e) => setNewBox({ ...newBox, number: parseInt(e.target.value) || "" })}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleAddBox}>Save</button>
                            <button onClick={() => setShowAddModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {transferPopup && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Transfer Amount</h3>
                        <p>
                            <strong>{transferPopup.from.name} ({transferPopup.from.number})</strong> →
                            <strong> {transferPopup.to.name} ({transferPopup.to.number})</strong>
                        </p>
                        <input
                            type="number"
                            placeholder="Amount"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleTransfer}>Confirm</button>
                            <button onClick={() => setTransferPopup(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/detail" element={<DetailPage />} />
        </Routes>
    </Router>
);

export default App;
