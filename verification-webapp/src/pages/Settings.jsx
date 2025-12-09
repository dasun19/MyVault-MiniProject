// src/pages/Settings.jsx
import Navbar from '../components/Navbar';

function Settings() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

    
        <h3>
          Settings Coming Soon...
        </h3>
        

      <footer className="bg-blue-600 text-white text-center py-6 mt-auto">
        <p>© {new Date().getFullYear()} MyVault-Verify | Secure Document Verification</p>
      </footer>
    </div>
  );
}

export default Settings;