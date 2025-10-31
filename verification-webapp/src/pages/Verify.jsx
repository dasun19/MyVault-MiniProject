// src/pages/Verify.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';

// 1. Base64-URL → normal Base64 (same as mobile)
const fromBase64Url = (str) => {
  str = decodeURIComponent(str);
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return str;
};

// 2. Main Component
export default function Verify() {
  const [searchParams] = useSearchParams();
  const encoded = searchParams.get('data');

  const [ui, setUi] = useState({
    loading: true,
    error: null,
    plain: false,
    encrypted: false,
    decrypted: false,
    data: null,
    payload: null,
    decrypting: false,
    verifying: false,
    isValid: null, // null = not checked, true/false
    verificationError: null,
  });

  const [passkey, setPasskey] = useState('');

  // 3. Initial decode (plain or encrypted)
  useEffect(() => {
    if (!encoded) {
      setUi({ loading: false, error: 'No data in QR code' });
      return;
    }

    let payload;
    try {
      payload = fromBase64Url(encoded);
    } catch {
      setUi({ loading: false, error: 'Invalid QR data (bad encoding)' });
      return;
    }

    // Try plain JSON
    try {
      const json = JSON.parse(atob(payload));
      setUi({ loading: false, plain: true, data: json });
      return;
    } catch {
      // not plain → encrypted
    }

    // Encrypted
    setUi({
      loading: false,
      encrypted: true,
      payload,
    });
  }, [encoded]);

  // 4. Decrypt handler
  const decrypt = async () => {
    if (!passkey) return alert('Enter the 12-character passkey');
    if (passkey.length !== 12) return alert('Passkey must be exactly 12 characters');

    setUi((s) => ({ ...s, decrypting: true }));

    try {
      const key = CryptoJS.enc.Utf8.parse(passkey.padEnd(16, '0'));
      const bytes = CryptoJS.AES.decrypt(ui.payload, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      const jsonString = bytes.toString(CryptoJS.enc.Utf8);
      if (!jsonString) throw new Error('Empty payload');

      const data = JSON.parse(jsonString);
      console.log('Decrypted data:', data);

      setUi((prev) => ({
        ...prev,
        data,
        decrypted: true,
        encrypted: false,
        decrypting: false,
        isValid: null, // ✅ ensures effect runs
        verificationError: null,
      }));
    } catch {
      alert('Wrong passkey – try again');
      setUi((s) => ({ ...s, decrypting: false }));
    }
  };

  // 5. Blockchain verification function
const verifyHashOnChain = async (hash) => {
  try {
    // Ensure hash has 0x prefix and is 64 hex chars
    let cleanHash = hash.trim();
    if (!cleanHash.startsWith('0x')) cleanHash = '0x' + cleanHash;
    if (!/^0x[0-9a-fA-F]{64}$/.test(cleanHash)) {
      return { isValid: false, error: 'Invalid hash format' };
    }

    console.log('Verifying hash:', cleanHash);
    const resp = await fetch(`http://localhost:3000/verify/${encodeURIComponent(cleanHash)}`);
    const result = await resp.json();
    console.log('Verification result:', result);

    if (resp.ok) {
      return { isValid: !!result.exists, error: null };
    } else {
      return { isValid: false, error: result.error || 'Verification failed' };
    }
  } catch (e) {
    console.error('Verification error:', e);
    return { isValid: false, error: 'Blockchain service unavailable' };
  }
};

  // ✅ 6. Fixed verification useEffect
  useEffect(() => {
    console.log('Verification useEffect triggered:', ui.data, ui.isValid);

    // FIXED CONDITION 👇
    if (!ui.data || ui.isValid != null) return;

    const run = async () => {
      try {
        const hash = ui.data.hash;
        console.log('Running verifyHashOnChain with:', hash);

        setUi((s) => ({ ...s, verifying: true, verificationError: null }));
        const { isValid, error } = await verifyHashOnChain(hash);
        setUi((s) => ({
          ...s,
          verifying: false,
          isValid,
          verificationError: error,
        }));
      } catch (err) {
        console.error('Verification failed:', err);
        setUi((s) => ({
          ...s,
          verifying: false,
          verificationError: err.message,
        }));
      }
    };

    run();
  }, [ui.data, ui.isValid]);

  // 7. UI Rendering
  if (ui.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4" />
        <p className="text-gray-600">Reading QR data…</p>
      </div>
    );
  }

  if (ui.error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg text-center">
        <p className="text-red-600 font-semibold">{ui.error}</p>
        <a href="/" className="mt-4 inline-block text-blue-600 underline">
          ← Back to home
        </a>
      </div>
    );
  }

  if (ui.encrypted) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Encrypted Document</h2>
        <p className="mb-4">Enter the 12-character passkey:</p>

        <input
          type="text"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value.toUpperCase())}
          maxLength={12}
          placeholder="A1B2C3D4E5F6"
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 text-center font-mono tracking-widest text-lg"
          autoFocus
        />

        <button
          onClick={decrypt}
          disabled={ui.decrypting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-70 font-medium"
        >
          {ui.decrypting ? 'Decrypting…' : 'Decrypt'}
        </button>
      </div>
    );
  }

  if (ui.plain || ui.decrypted) {
    const data = ui.data;
    const labels = {
      fullName: 'Full Name',
      dateOfBirth: 'Date of Birth',
      idNumber: 'ID Number',
      issuedDate: 'Issued Date',
      licenseNumber: 'License Number',
      dateOfIssue: 'Date of Issue',
      dateOfExpiry: 'Date of Expiry',
      address: 'Address',
      bloodGroup: 'Blood Group',
      vehicleClasses: 'Vehicle Classes',
    };

    const downloadPDF = async () => {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      try {
        const logoResp = await fetch('/logo.png');
        const logoBlob = await logoResp.blob();
        const logoImg = URL.createObjectURL(logoBlob);
        doc.addImage(logoImg, 'PNG', 15, 15, 25, 25);
        URL.revokeObjectURL(logoImg);
      } catch {}

      doc.setFontSize(15);
      doc.setFont(undefined, 'bold');
      doc.text('MyVault-Verify', 50, 28, { align: 'left' });

      const validityY = 70;
      doc.setFontSize(16);
      doc.setDrawColor(ui.isValid ? 34 : 220, ui.isValid ? 197 : 53, ui.isValid ? 94 : 20);
      doc.setFillColor(ui.isValid ? 236 : 254, ui.isValid ? 252 : 242, ui.isValid ? 231 : 226);
      doc.roundedRect(20, validityY - 5, 170, 20, 3, 3, 'FD');
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(ui.isValid ? 'Verified Document' : 'Unverified Document', 105, validityY + 8, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`${'licenseNumber' in data ? 'DRIVING LICENSE' : 'National Identity CARD'}`, 30, validityY + 45);

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      let yPos = validityY + 65;
      Object.entries(data)
        .filter(([k]) => k !== 'hash')
        .forEach(([key, val]) => {
          const displayVal = Array.isArray(val) ? val.join(', ') : val;
          doc.text(labels[key], 30, yPos, { maxWidth: 70 });
          doc.text(':', 70, yPos);
          doc.text(String(displayVal), 100, yPos, { maxWidth: 80 });
          yPos += 8;
          if (yPos > 260) {
            doc.addPage();
            yPos = 30;
          }
        });

      doc.setFontSize(10);
      doc.setDrawColor(200);
      doc.line(20, 285, 190, 285);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 30, 292);
      doc.save(`myvalt-verified-${Date.now()}.pdf`);
    };

    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {'licenseNumber' in data ? 'Driving License' : 'National Identity Card'}
        </h2>

        <div
          className={`p-5 rounded-xl mb-6 text-center border-2 font-bold text-lg transition-all ${
            ui.verifying
              ? 'border-gray-300 bg-gray-50'
              : ui.isValid
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-red-500 bg-red-50 text-red-700'
          }`}
        >
          {ui.verifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600 mr-2" />
              <span>Verifying…</span>
            </div>
          ) : ui.isValid ? (
            <>Verified Document</>
          ) : (
            <>Unverified Document</>
          )}
        </div>

        {ui.verificationError && (
          <p className="text-center text-orange-600 text-sm mb-4">
            Warning: {ui.verificationError}
          </p>
        )}

        <div className="space-y-4">
          {Object.entries(data)
            .filter(([key]) => key !== 'hash')
            .map(([key, value]) => {
              const displayValue = Array.isArray(value) ? value.join(', ') : value || '—';
              return (
                <div
                  key={key}
                  className="grid grid-cols-[1fr_auto_2.5fr] items-center border-b border-gray-200 pb-3 px-2"
                >
                  <span className="font-medium text-gray-700 text-left">{labels[key] || key}</span>
                  <span className="text-gray-500 text-center pr-4 pl-20">:</span>
                  <span className="text-gray-900 font-mono text-left break-words pl-20">{displayValue}</span>
                </div>
              );
            })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
          <button
            onClick={downloadPDF}
            disabled={ui.isValid === null}
            className={`flex-1 py-3 px-6 rounded-xl font-bold  transition-all ${
              ui.isValid === null
                ? 'bg-blue-600 text-blue-700 cursor-not-allowed'
                : ui.isValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {ui.isValid === null ? 'Verifying...' : 'Download PDF'}
          </button>
          <a
            href="/"
            className="flex-1 py-3 px-6 bg-blue-600 text-white text-center rounded-xl font-bold hover:bg-blue-700 shadow-lg"
          >
            Verify Another
          </a>
        </div>
      </div>
    );
  }

  return null;
}
