// src/pages/Guide.jsx
import { useState } from 'react';
import Navbar from '../components/Navbar'; // We'll extract Navbar to reuse

function Guide() {
  const [isSinhala, setIsSinhala] = useState(false);

  const toggleLanguage = () => setIsSinhala(!isSinhala);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <header className="text-center py-16 bg-blue-50">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
          {isSinhala ? 'මාර්ගෝපදේශය' : 'User Guide'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {isSinhala
            ? 'ඔබේ ලේඛන ආරක්ෂිතව සත්‍යාපනය කරන්නේ කෙසේද?'
            : 'How to securely verify your documents'}
        </p>
      </header>

      {/* Language Toggle */}
      <div className="flex justify-center mt-6 mb-8 ml-175">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <span>{isSinhala ? 'English':'🇱🇰 සිංහල'  }</span>
          <span className="text-xs">↔</span>
        </button>
      </div>

      <main className="flex-grow max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
          {isSinhala ? (
            <>
              <h2 className="text-2xl font-bold text-blue-600 mb-6">පියවරෙන් පියවර මාර්ගෝපදේශය</h2>

              <ol className="space-y-6 text-lg text-gray-700">
                <li>
                  <strong>1. QR කේතය ස්කෑන් කරන්න හෝ URL ඇතුලත් කරන්න</strong>
                  <p className="mt-2">
                    ඔබේ ලේඛනයේ QR කේතය කැමරාවෙන් ස්කෑන් කරන්න හෝ <code className="bg-gray-100 px-2 py-1 rounded">https://myvault-verify.vercel.app/verify?data=...</code> වැනි URL එක පිටපත් කරන්න.
                  </p>
                </li>
                <li>
                  <strong>2. ලේඛන දත්ත කියවන්න</strong>
                  <p className="mt-2">
                    පද්ධතිය ලේඛනයේ හෑෂ් අගය සත්‍යාපනය කරනු ඇත.
                  </p>
                </li>
                <li>
                  <strong>3. අවශ්‍ය නම් පාස්කී ඇතුලත් කරන්න</strong>
                  <p className="mt-2">
                    ලේඛනය සංකේතනය කර ඇත්නම්, එය විකේතනය කිරීමට පාස්කී එක ඇතුලත් කරන්න.
                  </p>
                </li>
                <li>
                  <strong>4. සත්‍යාපිත ලේඛනය බලන්න</strong>
                  <p className="mt-2">
                    ඔබේ ලේඛනයේ අන්තර්ගතය ආරක්ෂිතව පෙන්වනු ඇත. හෑෂ් ගැලපීමෙන් සත්‍යතාව තහවුරු වේ.
                  </p>
                </li>
              </ol>

              <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">ආරක්ෂාව ගැන සටහන</h3>
                <p className="text-gray-700">
                  කිසිදු දත්තය බ්‍රව්සරයෙන් පිටතට යවනු නොලැබේ. සියලුම සත්‍යාපන ක්‍රියාවලිය ඔබේ උපාංගය තුළ සිදු වේ.
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-blue-600 mb-6">Step-by-Step Guide</h2>

              <ol className="space-y-6 text-lg text-gray-700">
                <li>
                  <strong>1. Scan QR Code or Paste URL</strong>
                  <p className="mt-2">
                    Use your camera to scan the QR code on your document, or copy-paste the verification link like <code className="bg-gray-100 px-2 py-1 rounded">https://myvault-verify.vercel.app/verify?data=...</code>.
                  </p>
                </li>
                <li>
                  <strong>2. Read Document Data</strong>
                  <p className="mt-2">
                    The system will read the hash and verify it with the blockchain.
                  </p>
                </li>
                <li>
                  <strong>3. Enter Passkey (if required)</strong>
                  <p className="mt-2">
                    If the document is encrypted, enter the passkey to decrypt and view it.
                  </p>
                </li>
                <li>
                  <strong>4. View Verified Document</strong>
                  <p className="mt-2">
                    Your document content will be displayed securely. Hash matching confirms authenticity.
                  </p>
                </li>
              </ol>

              <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Security Note</h3>
                <p className="text-gray-700">
                  No data leaves your browser. All verification happens locally on your device.
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-blue-600 text-white text-center py-6 mt-auto">
        <p>© {new Date().getFullYear()} MyVault-Verify | Secure Document Verification</p>
      </footer>
    </div>
  );
}

export default Guide;