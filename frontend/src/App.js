// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SubBudgetScreenWrapper from "./Screens/SubBudgetScreenWrapper";
import DetailPage from "./Screens/DetailPage";
import TripScreen from "./Screens/TripScreen";
import LottieBackground from "./Components/LottieBackground";

const App = () => (
    <>
        <LottieBackground/>
    <Router>
        <Routes>
            <Route path="/" element={<TripScreen/>} />
            <Route path="/subbudget" element={<SubBudgetScreenWrapper />} />
            <Route path="/detail" element={<DetailPage />} />
        </Routes>
    </Router>
    </>
);

export default App;
