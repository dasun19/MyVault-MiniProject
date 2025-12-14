import React, { useState, useRef } from 'react';
import forge from 'node-forge';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function VerificationRequest() {
  const [verifier, setVerifier] = useState('');
  const [description, setDescription] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [qrData, setQrData] = useState('');
  const [documentType, setDocumentType] = useState('');
  const qrRef = useRef(null);

  // -------------------------------
  // FIXED: Generate keys compatible with react-native-rsa-native
  // -------------------------------
  const generateKeyPair = () => {
    if (!verifier || !description) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Generate RSA keys
      const keypair = forge.pki.rsa.generateKeyPair({
        bits: 2048,
        e: 0x10001,
      });

      // Convert to PEM format
      const privatePem = forge.pki.privateKeyToPem(keypair.privateKey);
      
      // IMPORTANT: Use SubjectPublicKeyInfo format (PKCS#8), NOT PKCS#1
      // This is what react-native-rsa-native expects
      const publicPem = forge.pki.publicKeyToPem(keypair.publicKey);

      // Store the actual PEM string (not base64 encoded)
      // We'll send the PEM directly in the QR code
      setPrivateKey(privatePem);
      setPublicKey(publicPem);

      // Request payload - send the PEM format directly
      const requestData = JSON.stringify({
        verifier,
        documentType,
        description,
        publicKey: publicPem, // Send PEM directly, not base64 encoded
      });

      setQrData(requestData);
    } catch (err) {
      console.error('Key generation failed:', err);
      alert('Key generation failed: ' + err.message);
    }
  };

  // -------------------------------
  // SAME FUNCTIONALITY YOU HAD BEFORE
  // -------------------------------
  const handleDownloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const canvasSize = 1000;
    const qrSize = 600;
    const padding = (canvasSize - qrSize) / 2;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'black';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Verification Request', canvasSize / 2, 120);

      const qrY = 200;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, padding, qrY, qrSize, qrSize);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification_request_${Date.now()}.png`;
        a.click();
      }, 'image/png');
    };

    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Verification Request',
          text: `Verification Request for ${post}\n\nData: ${qrData}`,
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(qrData);
      alert('QR data copied to clipboard!');
    }
  };

  const handleDownloadPrivateKey = () => {
    const blob = new Blob([privateKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'private_key.txt';
    a.click();
  };

  const handleReset = () => {
    setVerifier('');
    setDescription('');
    setDocumentType('');
    setPublicKey('');
    setPrivateKey('');
    setQrData('');
  };

  // -------------------------------
  // EXACT SAME UI AS YOU PROVIDED
  // -------------------------------
  return (
    <div>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Verification Request</h1>
          <p className="text-gray-600">Create secure verification requests with encrypted responses</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {!qrData ? (
            <>
              <h2 className="text-2xl font-bold text-blue-600 mb-6">Create New Request</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Verifier</label>
                <input
                  type="text"
                  placeholder="Name or Post"
                  value={verifier}
                  onChange={(e) => setVerifier(e.target.value)}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Document Type</label>
                          <select
                              value={documentType}
                              onChange={(e) => setDocumentType(e.target.value)}
                              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                          >
                  <option value="">Select document type...</option>
                  <option value="National Identity Card">National Identity Card</option>
                  <option value="Driving Licence">Driving Licence</option>
                  <option value="G.C.E. A/L Certificate">G.C.E. A/L Certificate</option>
              </select>
              </div>


              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  placeholder="Why is this verification needed? Please provide context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 h-32"
                />
              </div>

              <button
                onClick={generateKeyPair}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg shadow-lg"
              >
                Generate Request QR Code
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-blue-600 mb-6">Request Created Successfully</h2>

              <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Verification Request QR Code</h3>
                <div
                  className="bg-gradient-to-br from-blue-50 to-white p-6 inline-block rounded-xl border-2 border-blue-200"
                  ref={qrRef}
                >
                  <QRCodeSVG value={qrData} size={300} level="H" />
                </div>

                <div className="mt-4 flex gap-3 justify-center">
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                  >
                    <Download size={20} />
                    Download QR
                  </button>
                  <button
                    onClick={handleShareQR}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
                  >
                    <Share2 size={20} />
                    Share
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-200">
                <h3 className="font-semibold text-blue-700 mb-3 text-lg">Request Details:</h3>
                <p className="text-gray-700"><strong>Verifier:</strong> {verifier}</p>
                 <p className="text-gray-700"><strong>Document Type:</strong> {documentType}</p>
                <p className="text-gray-700"><strong>Description:</strong> {description}</p>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-red-700 mb-3 text-lg flex items-center">
                  <span className="text-2xl mr-2"></span>
                  Save Your Private Key for decryption
                </h3>

                <div className="bg-white p-4 rounded border border-red-200 mb-4 max-h-32 overflow-y-auto">
                  <p className="text-xs text-gray-600 font-mono break-all">{privateKey}</p>
                </div>

                <button
                  onClick={handleDownloadPrivateKey}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-lg"
                >
                  💾 Download Private Key
                </button>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition shadow-lg"
              >
                Create New Request
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}