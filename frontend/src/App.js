// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SubBudgetScreenWrapper from "./SubBudgetScreenWrapper";
import DetailPage from "./DetailPage";

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<SubBudgetScreenWrapper />} />
            <Route path="/subbudget" element={<SubBudgetScreenWrapper />} />
            <Route path="/detail" element={<DetailPage />} />
        </Routes>
    </Router>
);

export default App;
