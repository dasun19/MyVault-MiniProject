// src/pages/StoreHash.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StoreHash() {
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();



  useEffect(() => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    navigate("/admin/login");
    return;
  }

  // Optional: validate token
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") {
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    }
  } catch {
    navigate("/admin/login");
  }
}, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    // Clean & validate
    let cleanHash = hash.trim();
    if (cleanHash.startsWith('0x')) cleanHash = cleanHash.slice(2);
    if (!/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
      setError('Hash must be exactly 64 hex characters (0-9, a-f).');
      setLoading(false);
      return;
    }

    try {
      // Attach admin token if available so only admins can store hashes
      const token = localStorage.getItem('adminToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:3000/store', {
        method: 'POST',
        headers,
        body: JSON.stringify({ hashHex: cleanHash }),
      });

      const data = await response.json();
      if (!response.ok) {
        // show specific messages for auth problems
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized: you must be an admin to store hashes');
        }
        throw new Error(data.error || 'Failed to store');
      }

      console.log('Hash stored successfully on the blockchain');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Store Hash on Blockchain
      </h1>

      {/* === SHOW FORM ONLY IF NOT SUCCESS YET === */}
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              64-character Hash (hex)
            </label>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="6647d197fe60a92605e89170e84e39b193ae4c37a8c051fad44672aa29a2a21c"
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={68}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              Accepts with or without <code>0x</code> prefix
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !hash.trim()}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              loading || !hash.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Storing on Blockchain...
              </span>
            ) : (
              'Store Hash'
            )}
          </button>
        </form>
      ) : (
        /* === SUCCESS PANEL === */
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <h2 className="text-xl font-bold text-green-800 mb-3">
            Hash Stored Successfully!
          </h2>
          <div className="space-y-2 text-sm font-mono text-green-700">
            <p>
              <strong>Hash:</strong>{' '}
              <span className="break-all">{result.stored}</span>
            </p>
            <p>
              <strong>Tx Hash:</strong>{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {result.txHash}
              </a>
            </p>
            <p>
              <strong>Block:</strong> {result.blockNumber}
            </p>
            <p>
              <strong>From:</strong> {result.from}
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setHash('');
                setResult(null);
                setError('');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow"
            >
              Store Another Hash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}