// src/utils.js
export const shortenAddress = (addr) => {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const shortenHash = (hash) =>
  hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : '—';