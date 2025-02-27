// SubBudgetScreenWrapper.js
import React from "react";
import { useLocation } from "react-router-dom";
import SubBudgetScreen from "./SubBudgetScreen";

// used so we dont share the state between the screens, theyre independent
const SubBudgetScreenWrapper = () => {
    const location = useLocation();
    return <SubBudgetScreen key={location.key} />;
};

export default SubBudgetScreenWrapper;
