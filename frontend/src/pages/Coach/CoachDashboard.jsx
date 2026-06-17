import React from "react";
import { Link } from "react-router-dom";

const CoachDashboard = () => {
  return (
    <div className="pt-16">
      <h1>Coach Dashboard</h1>
      <Link to="/coach/lessons">View my lessons</Link>
    </div>
  );
};

export default CoachDashboard;
