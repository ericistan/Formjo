import React from "react";
import { Link } from "react-router-dom";

const CoachDashboard = () => {
  return (
    <div>
      <h1>Coach Dashboard</h1>
      <Link to="/coach/lessons">View my lessons</Link>
    </div>
  );
};

export default CoachDashboard;
