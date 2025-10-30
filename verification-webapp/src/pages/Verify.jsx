// src/pages/Verify.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';

// Helper: convert Base64-URL back to normal Base64
const fromBase64Url = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
};

export default function Verify() {
  const [searchParams] = useSearchParams();
  const encoded = searchParams.get('data');
  const [state, setState] = useState({ loading: true });
  const [passkey, setPasskey] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (!encoded) {
      setState({ loading: false, error: 'No data in QR code' });
      return;
    }

    let payload;
    try {
      payload = fromBase64Url(decodeURIComponent(encoded));
    } catch (e) {
      setState({ loading: false, error: 'Invalid QR data' });
      return;
    }

    // Try plain JSON
    try {
      const json = JSON.parse(payload);
      setState({ loading: false, data: json, plain: true });
      return;
    } catch {}

    // Encrypted → show passkey input
    setShowInput(true);
    setState({ loading: false, encrypted: true, payload });
  }, [encoded]);

  const decrypt = () => {
    if (!passkey) return alert('Enter passkey');
    if (passkey.length !== 12) return alert('Passkey must be 12 characters');

    try {
      // PAD KEY TO 16 BYTES
      const key = CryptoJS.enc.Utf8.parse(passkey.padEnd(16, '0'));

      const bytes = CryptoJS.AES.decrypt(state.payload, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      const jsonString = bytes.toString(CryptoJS.enc.Utf8);
      if (!jsonString) throw new Error();

      const data = JSON.parse(jsonString);
      setState({ ...state, data, decrypted: true });
      setShowInput(false);
    } catch (e) {
      alert('Wrong passkey');
    }
  };

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Reading QR data...</p>
      </div>
    );
  }

  if (state.plain) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Document Verified</h2>
        {Object.entries(state.data).map(([k, v]) => (
          <p key={k} className="mb-2"><strong>{k}:</strong> {v}</p>
        ))}
        <p className="text-sm text-gray-500 mt-4 italic">Unencrypted – internal use only</p>
      </div>
    );
  }

  if (state.encrypted && showInput) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Encrypted Document</h2>
        <p className="mb-4">Enter the 12-character passkey:</p>
        <input
          type="text"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          maxLength={12}
          placeholder="A1B2C3D4E5F6"
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
        />
        <button
          onClick={decrypt}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Decrypt
        </button>
      </div>
    );
  }

  if (state.decrypted) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Decrypted Successfully</h2>
        {Object.entries(state.data).map(([k, v]) => (
          <p key={k} className="mb-2"><strong>{k}:</strong> {v}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-red-600">
      <p>{state.error}</p>
    </div>
  );
}