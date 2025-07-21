// src/components/FormModal.jsx
import React, { useState } from "react";
import "./FormModal.css";

const FormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    timeframe: "",
    age: "",
    learningStyle: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="form-modal">
      <div className="form-modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2 className="form-title">Cosmic Learning Form</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
            />
          </label>
          <label>
            Goal:
            <input
              type="text"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="Your Learning Goal"
            />
          </label>
          <label>
            Age:
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Your Age"
            />
          </label>
          <label>
            Timeframe:
            <select
              name="timeframe"
              value={formData.timeframe}
              onChange={handleChange}
            >
              <option value="">Select Timeframe</option>
              <option value="short-term">Short-term</option>
              <option value="medium-term">Medium-term</option>
              <option value="long-term">Long-term</option>
            </select>
          </label>
          <label>
            Learning Style:
            <select
              name="learningStyle"
              value={formData.learningStyle}
              onChange={handleChange}
            >
              <option value="">Select Learning Style</option>
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="kinesthetic">Kinesthetic</option>
            </select>
          </label>
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
