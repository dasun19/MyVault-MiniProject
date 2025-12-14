import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Download,
  Search,
  X,
  AlertCircle
} from "lucide-react";
import axios from 'axios';


const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("authority");
  const [authorityUsers, setAuthorityUsers] = useState([]);
  const [vaultUsers, setVaultUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "authority"
  });

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

 const fetchUsers = async () => {
  setLoading(true);
  setError(null);
  try {
    // Fetch Authority Users
    const authResponse = await axios.get("http://localhost:3000/api/admin/users");
    setAuthorityUsers(Array.isArray(authResponse.data) ? authResponse.data : []);

    // Fetch MyVault Users
    const myvaultResponse = await axios.get("http://localhost:3000/api/admin/users-myvault");
    setVaultUsers(Array.isArray(myvaultResponse.data) ? myvaultResponse.data : []);
    
  } catch (error) {
    console.error("Error fetching users:", error);
    setError(error.response?.data?.message || error.message || "Failed to fetch users");
    setAuthorityUsers([]);
    setVaultUsers([]);
  } finally {
    setLoading(false);
  }
};

  

  // Update Authority User
  const handleUpdateUser = async (e) => {
  e.preventDefault();
  setError(null);
  try {
    await axios.put(
      `http://localhost:3000/api/admin/users/${selectedUser._id}`, 
      formData
    );
    
    await fetchUsers();
    setShowEditModal(false);
    setSelectedUser(null);
    alert("Authority user updated successfully!");
  } catch (error) {
    console.error("Error updating user:", error);
    setError(error.response?.data?.message || error.message || "Failed to update user");
  }
};

  const handleDeleteUser = async (userId, userType) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;
  
  setError(null);
  try {
    const endpoint = userType === "authority" 
      ? `http://localhost:3000/api/admin/users/${userId}`
      : `http://localhost:3000/api/admin/delete/${userId}`;
      
    await axios.delete(endpoint);
    
    await fetchUsers();
    alert("User deleted successfully!");
  } catch (error) {
    console.error("Error deleting user:", error);
    setError(error.response?.data?.message || error.message || "Failed to delete user");
  }
};

 
 // Download CSV Report
const downloadCSV = (userType) => {
  const users = userType === "authority" ? authorityUsers : vaultUsers;
  if (!Array.isArray(users) || users.length === 0) {
    alert("No users to download");
    return;
  }
  
  let headers, csvContent;
  
  if (userType === "authority") {
    // Authority users CSV
    headers = ["Username", "Role", "Created Date"];
    csvContent = [
      headers.join(","),
      ...users.map(user => [
        user.username || "",
        user.role || "user",
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""
      ].join(","))
    ].join("\n");
  } else {
    // MyVault users CSV
    headers = ["Full Name", "ID Number", "Email", "Phone Number", "Email Verified", "Phone Verified", "Account Status", "Created Date"];
    csvContent = [
      headers.join(","),
      ...users.map(user => [
        user.fullName || "",
        user.idNumber || "",
        user.email || "",
        user.phoneNumber || "",
        user.isEmailVerified ? "Yes" : "No",
        user.isPhoneVerified ? "Yes" : "No",
        user.accountStatus || "",
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""
      ].join(","))
    ].join("\n");
  }

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${userType}_users_report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      role: user.role
    });
    setShowEditModal(true);
  };

  // Filter users based on search - with safety check
  
const filteredUsers = (users) => {
  if (!Array.isArray(users)) return [];
  
  if (activeTab === "authority") {
    // Search authority users by username
    return users.filter(user => 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } else {
    // Search MyVault users by fullName, email, or phone
    return users.filter(user => 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm) ||
      user.idNumber?.includes(searchTerm)
    );
  }
};

  const currentUsers = activeTab === "authority" ? authorityUsers : vaultUsers;
  const displayUsers = filteredUsers(currentUsers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600 mt-1">Manage Authority and MyVault users</p>
        </div>
      </div>

      {/* Dashboard Stats */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-200">
  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white max-w-80" >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-indigo-100 text-m font-medium">Authorities</p>
        <h3 className="text-3xl font-bold mt-2">{authorityUsers.length}</h3>
      </div>
     
    </div>
  </div>

  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white max-w-80">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-purple-100 text-m font-medium">MyVault Users</p>
        <h3 className="text-3xl font-bold mt-2">{vaultUsers.length}</h3>
      </div>
     
    </div>
  </div>
</div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => fetchUsers()} 
                className="text-sm text-red-600 underline hover:text-red-800 mt-2"
              >
                Try again
              </button>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("authority")}
            className={`pb-3 px-2 font-medium transition ${
              activeTab === "authority"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Authorities ({authorityUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("myvault")}
            className={`pb-3 px-2 font-medium transition ${
              activeTab === "myvault"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            MyVault Users ({vaultUsers.length})
          </button>
        </div>

        <div className="flex space-x-3 mb-3">
          {/* {activeTab === "authority" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Authority User</span>
            </button>
          )} */}
          <button
            onClick={() => downloadCSV(activeTab)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-5 h-5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Users Table */}
      {/* Users Table */}
{!loading && (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {activeTab === "authority" ? (
            <>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </>
          ) : (
            <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIC Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {displayUsers.length > 0 ? (
          displayUsers.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              {activeTab === "authority" ? (
                <>
                  {/* Authority User Row */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {user.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteUser(user._id, activeTab)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  {/* MyVault User Row */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        
                        <div className="text-sm font-medium text-gray-900">{user.idNumber || "N/A"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.fullName || "N/A"}</div>
                    
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {user.isEmailVerified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-orange-600">⚠ Not Verified</span>
                      )}
                    </div>
                    
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phoneNumber || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {user.isPhoneVerified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-orange-600">⚠ Not Verified</span>
                      )}
                    </div>
                
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button onClick={() => handleDeleteUser(user._id, activeTab)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={activeTab === "authority" ? "4" : "6"} className="px-6 py-12 text-center text-gray-500">
              {searchTerm ? "No users found matching your search" : "No users found"}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}

     

     {/* Edit Modal */}
{showEditModal && (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Edit Authority</h3>
        <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleUpdateUser} className="space-y-4">
        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Leave blank to keep current password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to keep the current password
          </p>
        </div>

        {/* Role Display (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
            Authority
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Role cannot be changed
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button 
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Update User
          </button>
          <button 
            type="button"
            onClick={() => setShowEditModal(false)} 
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default UserManagement;