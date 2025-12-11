import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthorityDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("http://localhost:3000/api/authority/dashboard", {
      headers: { Authorization: token }
    })
    .then(response => {
      setData(response.data);
    })
    .catch(error => {
      navigate("/login");
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: "50px" }}>
      <h1>Authority Dashboard</h1>
      <p>Welcome, {data.name}</p>
      <p>Pending Tasks: {data.pendingTasks}</p>
      <p>Completed Tasks: {data.completedTasks}</p>
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}