import React, { useState } from "react";
import "./App.css";

const Box = ({ name, number, onDragStart, onDrop, onDragOver }) => {
    return (
        <div
            className="box"
            draggable
            onDragStart={() => onDragStart(name, number)}
            onDrop={() => onDrop(name, number)}
            onDragOver={(e) => e.preventDefault()} // Allows dropping
        >
            <div className="box-name">{name}</div>
            <div className="box-number">{number}</div>
        </div>
    );
};

const TransferModal = ({ fromBox, toBox, onClose, onTransfer }) => {
    const [transferAmount, setTransferAmount] = useState("");

    const handleTransfer = () => {
        const amount = parseFloat(transferAmount);
        if (!isNaN(amount) && amount > 0 && amount <= fromBox.number) {
            onTransfer(amount);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Transfer Amount</h2>
                <p>
                    Moving from <b>{fromBox.name}</b> ({fromBox.number}) to{" "}
                    <b>{toBox.name}</b> ({toBox.number})
                </p>
                <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Enter amount"
                />
                <div className="modal-buttons">
                    <button onClick={handleTransfer}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

const AddBoxModal = ({ onClose, onSave }) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");

    const handleSave = () => {
        if (name && !isNaN(number) && number !== "") {
            onSave(name, parseFloat(number));
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Add New Box</h2>
                <input
                    type="text"
                    placeholder="Box Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Starting Number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                />
                <div className="modal-buttons">
                    <button onClick={handleSave}>Add</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [boxes, setBoxes] = useState([
        { name: "Box A", number: 100 },
        { name: "Box B", number: 50 },
    ]);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [draggedBox, setDraggedBox] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    const handleDragStart = (name, number) => {
        setDraggedBox({ name, number });
    };

    const handleDrop = (name, number) => {
        if (draggedBox && draggedBox.name !== name) {
            setDropTarget({ name, number });
            setShowTransferModal(true);
        }
    };

    const handleTransfer = (amount) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.name === draggedBox.name) return { ...box, number: box.number - amount };
                if (box.name === dropTarget.name) return { ...box, number: box.number + amount };
                return box;
            })
        );
        setShowTransferModal(false);
    };

    const handleAddBox = (name, number) => {
        setBoxes([...boxes, { name, number }]);
        setShowAddModal(false);
    };

    return (
        <div className="container">
            {boxes.map((box) => (
                <Box key={box.name} {...box} onDragStart={handleDragStart} onDrop={handleDrop} />
            ))}

            {/* Add Box Button */}
            <div className="box add-box" onClick={() => setShowAddModal(true)}>
                <span>+</span>
            </div>

            {showTransferModal && draggedBox && dropTarget && (
                <TransferModal
                    fromBox={draggedBox}
                    toBox={dropTarget}
                    onTransfer={handleTransfer}
                    onClose={() => setShowTransferModal(false)}
                />
            )}

            {showAddModal && <AddBoxModal onSave={handleAddBox} onClose={() => setShowAddModal(false)} />}
        </div>
    );
};

export default App;
