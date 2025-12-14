import { useState } from "react";
import { 
  FileText, 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  LogOut,
  Database,
  Bell,
  BarChart3,
  Lock,
  FileCheck
} from "lucide-react";
import TransactionsList from "../components/TransactionsList";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import StoreHash from "./StoreHash";
import axios from "axios";
import UpdateHash from "./UpdateHash";

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

   useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  

const handleLogout = async () => {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      const response = await axios.post(
        "http://localhost:3000/api/authority/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Backend logout successful:", response.data.message);
      }
    }
    
  } catch (err) {
    console.error("Backend logout failed", err);
  } finally {
    localStorage.removeItem("token");
    navigate("/login");
  }
};


  const goToStoreHash = () => {
    navigate("/authority/dashboard/store");
    console.log("Navigating to store hash...");
  };

  const menuItems = [
    { id: "dashboard", icon: Activity, label: "Dashboard", action: () => setActiveSection("dashboard") },
    { id: "store-hash", icon: Database, label: "Store Hash", action: () => setActiveSection("store-hash") },
    { id: "update-hash", icon: Database, label: "Update Hash", action: () => setActiveSection("update-hash") },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 to-indigo-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-indigo-500">
          <div className="flex items-center space-x-3">
            <Lock className="w-8 h-8" />
            {isSidebarOpen && <h2 className="text-xl font-bold">Authority</h2>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-indigo-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Authority Dashboard</h1>
          </div>

          
        </header>

        {/* DASHBOARD CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
           {activeSection === "dashboard" ? (
          <>
          {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* ... your stats cards ... */}
          </div>
      
          {/* Recent Transactions */}
          <div>
            <TransactionsList /> 
          </div>
           </>
          ) : activeSection === "store-hash" ? (
             <StoreHash />
          ) : activeSection === "update-hash" ? (
          <div>
            <UpdateHash/>
          </div>
            ) : activeSection === "analytics" ? (
          <div>Analytics Page (Coming Soon)</div>
            ) : (
              <div>Other sections coming soon...</div>
         )}
          </main>
      
      </div>
    </div>
  );
};

export default AuthorityDashboard;