import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DetailPage.css";

const DetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const box = location.state?.box; // Get the box data

    return (
        <div className="detail-page">
            <button className="back-button" onClick={() => navigate("/")}>← Back</button>
            <div className="box-info">
                <h2>{box?.name}</h2>
                <p>Budget: {box?.number}</p>
            </div>
        </div>
    );
};

export default DetailPage;
