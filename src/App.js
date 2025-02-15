// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SubBudgetScreen from "./SubBudgetScreen"; // updated import name
import DetailPage from "./DetailPage";

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<SubBudgetScreen />} />
            <Route path="/detail" element={<DetailPage />} />
        </Routes>
    </Router>
);

export default App;
