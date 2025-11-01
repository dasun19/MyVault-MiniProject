// src/App.jsx
import { useState, useRef, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import Verify from './pages/Verify';
import StoreHash from './pages/StoreHash';
import jsQR from 'jsqr';
import './App.css';
import DropdownMenu from './components/DropdownMenu';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* LEFT GROUP: Logo + Desktop Links */}
          <div className="flex items-center">

            {/* LOGO – 5rem from left */}
            <div className="ml-20">
              <div className="text-xl font-bold whitespace-nowrap">
                MyVault-Verify
              </div>
            </div>


            {/* DESKTOP NAV LINKS */}
            <ul className="hidden md:flex space-x-8 ml-20">
              <li><a href="/" className="hover:text-blue-200 transition">Home</a></li>
              <li><a href="#guide" className="hover:text-blue-200 transition">Guide</a></li>
              <li><a href="#about" className="hover:text-blue-200 transition">About</a></li>
            </ul>
          </div>

          {/* ---- NEW: DropdownMenu (visible only on ≥md) ---- */}
            <div className="hidden md:block ml-6 mr-20">
              <DropdownMenu />
            </div>

          {/* MOBILE HAMBURGER */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-blue-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isOpen && (
          <div className="md:hidden bg-blue-700 rounded-b-lg">
            <ul className="px-4 py-3 space-y-2">
              <li><a href="/" className="block py-2 hover:text-blue-200">Home</a></li>
              <li><a href="#guide" className="block py-2 hover:text-blue-200">Guide</a></li>
              <li><a href="#about" className="block py-2 hover:text-blue-200">About</a></li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}


  // QR SCANNER COMPONENT (Camera + Upload) 

function QRScanner({ onDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  // ---------- DEBUG ----------
  const log = (...args) => console.log('[QRScanner]', ...args);

  // Start Camera
  const startCamera = async () => {
    log('startCamera() called');
    setError(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      log('Camera stream obtained');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        log('Video element assigned stream and play() called');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow permission.');
      setScanning(false);
      log('Camera failed:', err.message);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    log('stopCamera() called');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      log('Camera tracks stopped');
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      log('Animation frame cancelled');
    }
  };

  // QR Detection Loop – runs only when scanning is true
  useEffect(() => {
    if (!scanning) {
      log('Scanning stopped – no tick loop');
      return;
    }

    const tick = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          log('QR DETECTED:', code.data);
          stopCamera();
          onDetected(code.data);
          return;
        } else {
          log('No QR in frame');
        }
      } else {
        log('Video not ready (readyState:', video.readyState, ')');
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    log('Starting tick loop via useEffect');
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [scanning, onDetected]);

  // Handle Image Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    log('File selected:', file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          setError('Canvas not ready.');
          return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          log('QR from IMAGE:', code.data);
          onDetected(code.data);
        } else {
          setError('No QR code found in the image.');
          log('No QR in image');
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      log('Component unmounting – stopping camera');
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-blue-600 mb-4 text-center">
        Scan QR Code
      </h3>

      <div className="flex gap-3 justify-center mb-4">
        <button
          onClick={scanning ? stopCamera : startCamera}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            scanning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {scanning ? 'Stop Camera' : 'Open Camera'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Upload Image
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {scanning && (
        <div className="mt-4 flex justify-center">
          <div className="relative rounded-lg overflow-hidden shadow-md">
            <video
              ref={videoRef}
              className="max-w-full h-auto"
              playsInline
              autoPlay
              muted
            />
            <div className="absolute inset-0 border-4 border-green-400 pointer-events-none animate-pulse"></div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {error && (
        <p className="mt-4 text-center text-red-600 font-medium text-sm">{error}</p>
      )}
    </div>
  );
}


  // HOME PAGE

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
      navigate(`/verify?data=${data}`);
    } catch {
      alert('Invalid verification URL. Must contain ?data=...');
    }
  };

  const handleQRDetected = (rawUrl) => {
    console.log('[Home] QR Detected →', rawUrl);
    try {
      const urlObj = new URL(rawUrl);
      const data = urlObj.searchParams.get('data');
      if (!data) throw new Error();
      navigate(`/verify?data=${data}`);
    } catch {
      alert('QR code does not contain a valid verification link.');
    }
  };

  const scrollToScanner = () => {
    document
      .getElementById('qr-scanner-section')
      ?.scrollIntoView({ behavior: 'smooth' });
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
            Enter Verification URL
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

          {/* <p className="text-sm text-gray-500 mt-4 text-center">
            <span
              onClick={scrollToScanner}
              className="text-blue-600 cursor-pointer hover:underline font-medium"
            >
              Or scan QR code with camera
            </span>
          </p> */}
        </div>

        <section id="qr-scanner-section" className="mt-12 w-full max-w-lg">
          <QRScanner onDetected={handleQRDetected} />
        </section>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl w-full px-4">
          {[
            { step: '1', text: 'Scan QR or paste URL' },
            { step: '2', text: 'Read encrypted/plain data' },
            { step: '3', text: 'Enter passkey if needed' },
            { step: '4', text: 'View verified document' },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-blue-50 p-6 rounded-xl shadow-sm text-center border border-blue-100"
            >
              <div className="text-2xl font-bold text-blue-600 mb-2">
                Step {s.step}
              </div>
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


  // APP ROUTER
 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/admin/dashboard/store" element={<StoreHash />} />
        <Route path="/DropdownMenu" element={<DropdownMenu/>}/>
        <Route path="/admin/login" element={<AdminLogin/>}/>
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;