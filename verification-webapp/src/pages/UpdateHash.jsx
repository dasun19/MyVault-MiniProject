// src/pages/UpdateHash.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { keccak256, toUtf8Bytes } from 'ethers';

export default function UpdateHash() {
  const [idNumber, setIdNumber] = useState('');
  const [identityId, setIdentityId] = useState('');
  const [newHashHex, setNewHashHex] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Convert ID number to keccak256 hash
  const hashIdNumber = (id) => {
    if (!id) return '';
    return keccak256(toUtf8Bytes(id.trim()));
  };

  // Update identityId whenever idNumber changes
  useEffect(() => {
    setIdentityId(hashIdNumber(idNumber));
  }, [idNumber]);

  // Check authority token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'authority') {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      if (!identityId || !newHashHex.trim()) {
        throw new Error('ID number and new document hash are required');
      }

      let cleanHash = newHashHex.trim();
      if (!cleanHash.startsWith('0x')) cleanHash = '0x' + cleanHash;

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(
        'http://localhost:3000/api/authority/update-hash',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ identityId, newHashHex: cleanHash }),
        }
      );

      const data = await response.json();
      console.log('Result from API:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update hash');
      }

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
        Update Document Hash on Blockchain
      </h1>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Number
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter ID number..."
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={20}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identity Hash
            </label>
            <input
              type="text"
              value={identityId}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Document Hash
            </label>
            <input
              type="text"
              value={newHashHex}
              onChange={(e) => setNewHashHex(e.target.value)}
              placeholder="Enter 0x… new document hash"
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !idNumber.trim() || !newHashHex.trim()}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              loading || !idNumber.trim() || !newHashHex.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
          >
            {loading ? 'Updating on Blockchain...' : 'Update Hash'}
          </button>
        </form>
      ) : (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <h2 className="text-xl font-bold text-green-800 mb-3">
            Hash Updated Successfully!
          </h2>
          <div className="space-y-2 text-sm font-mono text-green-700">
            <p>
              <strong>Identity ID:</strong> <span className="break-all">{result.identityId || "N/A"}</span>
            </p>
            <p>
              <strong>New Document Hash:</strong> <span className="break-all">{result.newHash || "N/A"}</span>
            </p>
            <p>
              <strong>Tx Hash:</strong> <span className="break-all">{result.txHash || "N/A"}</span>
            </p>
            <p>
              <strong>Block:</strong> <span className="break-all">{result.blockNumber ?? "N/A"}</span>
            </p>
            
            {result.message && (
              <p className="text-sm text-yellow-700 mt-2">
                <strong>Message:</strong> {result.message}
              </p>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIdNumber('');
                setNewHashHex('');
                setIdentityId('');
                setResult(null);
                setError('');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow"
            >
              Update Another Hash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
