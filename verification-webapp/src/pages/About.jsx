// src/pages/About.jsx
import Navbar from '../components/Navbar';

function About() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <header className="text-center py-16 bg-blue-50">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
          About MyVault-Verify
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Secure, tamper-proof document verification using QR codes and cryptography.
        </p>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700">
              MyVault-Verify provides a simpleily accessible and secure way to verify the authenticity of digital documents. Whether it's certificates, contracts, or records — ensure integrity without compromise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">How It Works</h2>
            <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
              <li>Documents are hashed and stored securely (on blockchain).</li>
              <li>A unique QR code is generated with encrypted verification data.</li>
              <li>Anyone can scan the QR or use the link to verify — no login required.</li>
              <li>Local decryption ensures privacy. No data is sent to third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Why Choose Us?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800">🔒 Zero Trust</h3>
                <p className="text-gray-700 mt-1">Verification happens in your browser. We never see your data.</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800">🌐 Offline Capable</h3>
                <p className="text-gray-700 mt-1">Works without internet after initial load.</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800">🛡️ Tamper-Proof</h3>
                <p className="text-gray-700 mt-1">Any change in document breaks the hash.</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800">🌍 Multilingual</h3>
                <p className="text-gray-700 mt-1">Supports English and Sinhala for wider reach.</p>
              </div>
            </div>
          </section>

          <section className="text-center mt-10">
            <p className="text-gray-600">
             
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-blue-600 text-white text-center py-6 mt-auto">
        <p>© {new Date().getFullYear()} MyVault-Verify | Secure Document Verification</p>
      </footer>
    </div>
  );
}

export default About;