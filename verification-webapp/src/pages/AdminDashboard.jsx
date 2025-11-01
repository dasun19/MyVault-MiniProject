// src/pages/AdminDashboard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TransactionsList from "../components/TransactionsList";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const goToStoreHash = () => {
    navigate("/admin/dashboard/store");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* TOP: SMALL STORE HASH BUTTON (left-aligned) */}
        <div className="flex justify-start">
          <button
            onClick={goToStoreHash}
            className="bg-white px-6 py-4 rounded-lg shadow hover:shadow-md transition transform hover:-translate-y-0.5 border border-gray-200 text-left w-full sm:w-auto"
          >
            <h3 className="text-lg font-semibold text-gray-800">Store Hash</h3>
            <p className="text-sm text-gray-500 mt-1">Securely store a hash on blockchain</p>
          </button>
        </div>

        {/* BOTTOM: FULL-WIDTH RECENT TRANSACTIONS */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <TransactionsList />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;