// src/components/TransactionsList.jsx
import { useHardhatTransactions } from '../hooks/useHardhatTransactions';
import { shortenAddress, shortenHash } from '../utils';

function TransactionsList() {
  const { txs } = useHardhatTransactions();

  const downloadReport = () => {
    if (txs.length === 0) {
      alert('No transactions to download');
      return;
    }
    
    // Prepare CSV data - without stored hash
    const headers = ['Transaction Hash', 'From', 'To', 'Value (ETH)', 'Status', 'Block', 'Time'];
    const rows = txs.map(tx => [
      tx.hash,
      tx.from,
      tx.to,
      tx.value,
      tx.status,
      tx.block,
      tx.time
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `blockchain_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
        <p className="text-xs text-blue-100 mt-1">Live blockchain activity</p>
      </div>

      {/* LIST */}
      <div className="max-h-96 overflow-y-auto">
        {txs.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">No transactions yet</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tx Hash</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">From → To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txs.map(tx => (
                <tr key={tx.hash} className="hover:bg-gray-50">
                  <td 
                    className="px-4 py-3 font-mono text-xs text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigator.clipboard.writeText(tx.hash)}
                    title="Click to copy"
                  >
                    {shortenHash(tx.hash)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {shortenAddress(tx.from)} → {shortenAddress(tx.to || '(create)')}
                  </td>
                  <td className="px-4 py-3">
                    {tx.storedHash ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Store Hash
                      </span>
                    ) : tx.verifiedHash ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verify Hash
                      </span>
                    ) : tx.to ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Contract Call
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        Contract Deploy
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {tx.time}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                      tx.status === 'success' ? 'bg-green-100 text-green-800' :
                      tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DOWNLOAD BUTTON */}
      {txs.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          <button
            onClick={downloadReport}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Transaction Report (CSV)
          </button>
        </div>
      )}
    </div>
  );
}

export default TransactionsList;