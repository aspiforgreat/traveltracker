import React, { useState } from 'react';
import './App.css';

const Box = ({ name, number }) => {
  return (
      <div className="box">
        <div className="box-name">{name}</div>
        <div className="box-number">{number}</div>
      </div>
  );
};

const AddBoxModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  const handleSave = () => {
    // Optionally add validation here
    onSave(name, number);
  };

  return (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Add New Box</h2>
          <div className="form-group">
            <label>Name:</label>
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Number:</label>
            <input
                type="number"
                value={number}
                onChange={e => setNumber(e.target.value)}
            />
          </div>
          <div className="modal-buttons">
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
  );
};

const App = () => {
  const [boxes, setBoxes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const addBox = (name, number) => {
    setBoxes([...boxes, { name, number }]);
    setShowModal(false);
  };

  return (
      <div className="container">
        {boxes.map((box, index) => (
            <Box key={index} name={box.name} number={box.number} />
        ))}

        {/* Add box button */}
        <div className="box add-box" onClick={() => setShowModal(true)}>
          <span>+</span>
        </div>

        {/* Modal */}
        {showModal && (
            <AddBoxModal onSave={addBox} onClose={() => setShowModal(false)} />
        )}
      </div>
  );
};

export default App;
