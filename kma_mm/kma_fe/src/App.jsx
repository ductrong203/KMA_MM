// src/App.jsx
import React, { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/login/Login";

const App = () => {
  const [role, setRole] = useState("");

  return (
    <div>
      {!role ? (
        <Login onLogin={(role) => setRole(role)} />
      ) : (
        <Dashboard role={role} />
      )}
    </div>
  );
};

export default App;
