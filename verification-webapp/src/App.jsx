// src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Verify from './pages/Verify';
import './App.css';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">MyVault-Verify</div>
        <ul className="flex space-x-6">
          <li><a href="/" className="hover:text-blue-200">Home</a></li>
          <li><a href="#guide" className="hover:text-blue-200">Guide</a></li>
          <li><a href="#about" className="hover:text-blue-200">About</a></li>
        </ul>
      </div>
    </nav>
  );
}

function Home() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleVerify = () => {
    if (!url.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    try {
      const urlObj = new URL(url);
      const data = urlObj.searchParams.get('data');
      if (!data) throw new Error();

      // Redirect to /verify with data
      navigate(`/verify?data=${data}`);
    } catch (e) {
      alert('Invalid verification URL. Must contain ?data=...');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <header className="text-center py-16 bg-blue-50">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
          Verify Your Documents Securely
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Scan QR or paste verification URL to view document data.
        </p>
      </header>

      <main className="flex flex-col items-center mt-10 px-4 flex-grow">
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center">
            Paste Verification URL
          </h2>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yoursite.com/verify?data=..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleVerify}
            className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Verify Now
          </button>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Or scan QR code with camera
          </p>
        </div>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl">
          {[
            { step: "1", text: "Scan QR or paste URL" },
            { step: "2", text: "Read encrypted/plain data" },
            { step: "3", text: "Enter passkey if needed" },
            { step: "4", text: "View verified document" },
          ].map((s) => (
            <div key={s.step} className="bg-blue-50 p-6 rounded-xl shadow-sm text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600 mb-2">Step {s.step}</div>
              <p className="text-gray-700">{s.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-blue-600 text-white text-center py-6 mt-16">
        <p>© {new Date().getFullYear()} MyVault-Verify | Secure Document Verification</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;