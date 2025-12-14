// src/pages/Verify.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import forge from 'node-forge';
import { keccak256, toUtf8Bytes } from 'ethers';
import { useRef } from 'react';



let idNumber;

const deriveIdentityId = (idNumber) => {
  return keccak256(toUtf8Bytes(idNumber.trim()));
};


// 1. Base64-URL → normal Base64 (same as mobile)
const fromBase64Url = (str) => {
  str = decodeURIComponent(str);
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return str;
};

// 2. RSA Decryption using node-forge PKCS#1 v1.5
const decryptWithRSA_PKCS1 = (encryptedBase64, privateKeyPem) => {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.decode64(encryptedBase64);
    const decrypted = privateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5');
    return decrypted;
  } catch (err) {
    console.error('PKCS#1 Decrypt Error:', err);
    throw new Error('Decryption failed. Check your private key.');
  }
};

// 3. Main Component
export default function Verify() {
  const [searchParams] = useSearchParams();
  const encoded = searchParams.get('data');
  const verificationStarted = useRef(false);

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

  const [privateKey, setPrivateKey] = useState('');

  // 4. Initial decode (plain or encrypted with RSA)
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
      if ('licenseNumber' in json){
      idNumber = json.licenseNumber;
      } else {
         idNumber = json.idNumber;
      }
      console.log(json.licenseNumber);
      setUi({ loading: false, plain: true, data: json });
      return;
    } catch {
      // not plain → encrypted with RSA
    }

    // Encrypted with RSA
    setUi({
      loading: false,
      encrypted: true,
      payload,
    });
  }, [encoded]);



  // 5. RSA Decrypt handler
  const decrypt = async () => {
    if (!privateKey) return alert('Enter your private key');

    setUi((s) => ({ ...s, decrypting: true }));

    try {
      const decryptedJson = decryptWithRSA_PKCS1(ui.payload, privateKey);
      const data = JSON.parse(decryptedJson);

      setUi((prev) => ({
        ...prev,
        data,
        decrypted: true,
        encrypted: false,
        decrypting: false,
        isValid: null,
        verificationError: null,
      }));
    } catch (err) {
      console.error('Decryption error:', err);
      alert('Wrong private key or invalid data – try again');
      setUi((s) => ({ ...s, decrypting: false }));
    }
  };

  // 6. Blockchain verification
 const verifyHashOnChain = async (identityId, hash) => {
  try {
    const cleanHash = hash.startsWith('0x') ? hash : '0x' + hash;

    const resp = await fetch(
      `http://localhost:3000/api/verify/${identityId}/${cleanHash}`
    );
    console.log(cleanHash)

    const result = await resp.json();

    if (resp.ok) {
      console.log("Identity_Num: ",identityId);
      console.log("Hash: ", hash);
      return { isValid: result.valid, error: null };
    } else {
      return { isValid: false, error: result.error };
    }
  } catch {
    return { isValid: false, error: 'Blockchain service unavailable' };
  }
};


  useEffect(() => {
  if (!ui.data) return;
  if (verificationStarted.current) return;

  verificationStarted.current = true;

  const run = async () => {
    try {
      console.log('Starting blockchain verification');

      setUi((s) => ({
        ...s,
        verifying: true,
        verificationError: null,
      }));

      const identitySource = 'licenseNumber' in ui.data
          ? ui.data.licenseNumber
          : ui.data.idNumber;

      const identityId = deriveIdentityId(identitySource);
      
      const hash = ui.data.hash;

      console.log('identityId:', identityId);
      console.log('hash:', hash);

      const { isValid, error } = await verifyHashOnChain(identityId, hash);

      console.log('Verification result:', isValid, error);

      setUi((s) => ({
        ...s,
        verifying: false,
        isValid,
        verificationError: error,
      }));
    } catch (err) {
      console.error('Verification crashed:', err);
      setUi((s) => ({
        ...s,
        verifying: false,
        isValid: false,
        verificationError: 'Verification failed',
      }));
    }
  };

  run();
}, [ui.data]);



  // 7. UI Rendering - Loading State
  if (ui.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4" />
        <p className="text-gray-600">Reading QR data…</p>
      </div>
    );
  }

  // 8. Error State
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

  // 9. Encrypted State - RSA Decryption UI
  if (ui.encrypted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Encrypted Document</h2>
        <p className="text-gray-600 mb-6">This document is encrypted. Enter your RSA private key to decrypt:</p>
        
        <textarea
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="-----BEGIN RSA PRIVATE KEY-----
Paste your RSA private key here...
-----END RSA PRIVATE KEY-----"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 font-mono text-sm h-48 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        
        <button
          onClick={decrypt}
          disabled={ui.decrypting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-70 font-medium transition-all shadow-lg"
        >
          {ui.decrypting ? 'Decrypting…' : 'Decrypt'}
        </button>
      </div>
    );
  }

  // 10. Decrypted/Plain State - Document Display
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
      
      // Add logo if available
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
      doc.save(`myvault-verified-${Date.now()}.pdf`);
    };

    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {'licenseNumber' in data ? 'Driving License' : 'National Identity Card'}
        </h2>

        {/* Blockchain Verification Status */}
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
              <span>Verifying on blockchain…</span>
            </div>
          ) : ui.isValid ? (
            <> Verified Document</>
          ) : (
            <> Unverified Document</>
          )}
        </div>

        {ui.verificationError && (
          <p className="text-center text-orange-600 text-sm mb-4">
            Warning: {ui.verificationError}
          </p>
        )}

        {/* Document Details */}
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

       {/* Action Buttons */}
<div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
  {ui.decrypted && (
    <button
      onClick={downloadPDF}
      disabled={ui.isValid === null}
      className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
        ui.isValid === null
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
      }`}
    >
      {ui.isValid === null ? 'Verifying...' : 'Download PDF'}
    </button>
  )}
  
   <a href="/"
    className={`${ui.decrypted ? 'flex-1' : 'w-full'} py-3 px-6 bg-gray-600 text-white text-center rounded-xl font-bold hover:bg-gray-700 shadow-lg`}
  >
    Verify Another
  </a>
</div>
      </div>
    );
  }

  return null;
}