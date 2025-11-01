// src/hooks/useHardhatTransactions.js
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Global state
const globalTxs = [];
const listeners = new Set();
const notify = () => {
  requestAnimationFrame(() => {
    listeners.forEach(fn => fn([...globalTxs]));
  });
};

export const useHardhatTransactions = () => {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    listeners.add(setTxs);
    setTxs([...globalTxs]);
    return () => listeners.delete(setTxs);
  }, []);

  return { txs, loading: false };
};

// ONE-TIME LISTENER
if (!globalThis.__HH_INIT__) {
  globalThis.__HH_INIT__ = true;

  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  const addTx = (tx, blockNumber, blockTimestamp) => {
    if (!tx?.hash || !ethers.isHexString(tx.hash, 32)) {
      console.log('Skipping invalid tx:', tx);
      return;
    }
    if (globalTxs.some(t => t.hash === tx.hash)) return;

    console.log('Adding tx:', tx.hash);

    const entry = {
      hash: tx.hash,
      from: tx.from || 'unknown',
      to: tx.to || '(create)',
      value: ethers.formatEther(tx.value || 0),
      status: 'pending',
      block: blockNumber,
      time: new Date(blockTimestamp * 1000).toLocaleTimeString(),
    };

    globalTxs.unshift(entry);
    if (globalTxs.length > 100) globalTxs.pop();
    notify();
  };


  // Helper to decode HashStored event from a receipt
  const decodeHashStored = (receipt, txHash) => {
    if (receipt && receipt.logs) {
      try {
        const iface = new ethers.Interface([
          'event HashStored(string hash)'
        ]);
        for (const log of receipt.logs) {
          const parsed = iface.parseLog(log);
          if (parsed?.name === 'HashStored') {
            const storedHash = parsed.args.hash;
            const idx = globalTxs.findIndex(t => t.hash === txHash);
            if (idx !== -1) {
              globalTxs[idx].storedHash = storedHash;
              notify();
            }
          }
        }
      } catch (e) {
        // Not our event
      }
    }
  };

  const processBlock = async (blockNumber) => {
    try {
      const block = await provider.getBlock(blockNumber, true);
      if (!block?.transactions?.length) return;

      console.log(`Processing block #${blockNumber} with ${block.transactions.length} txs`);

      for (const txHash of block.transactions) {
        // txHash is a string like "0xabc..."
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
          console.log('No tx found for hash:', txHash);
          continue;
        }

        addTx(tx, blockNumber, block.timestamp);

        // Update status
        try {
          const receipt = await provider.getTransactionReceipt(txHash);
          if (receipt) {
            const idx = globalTxs.findIndex(t => t.hash === txHash);
            if (idx !== -1) {
              globalTxs[idx].status = receipt.status === 1 ? 'success' : 'failed';
              notify();
            }
          }
        } catch (e) {
          // pending
        }
      }
    } catch (e) {
      console.error('Block error:', e);
    }
  };

  // Load past blocks
  provider.getBlockNumber()
    .then(async (latest) => {
      console.log(`Loading ${latest} blocks...`);
      for (let i = 1; i <= latest; i++) {
        await processBlock(i);
      }
      provider.on('block', processBlock);
      console.log('Listener ready');
    })
    .catch(console.error);
}