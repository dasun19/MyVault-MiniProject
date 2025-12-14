const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requireAuthority } = require("../middleware/authMiddleware");
const { web3, account, contract } = require("../blockchain/web3");


function normalizeHash(hash) {
  if (!hash) return null;
  hash = hash.trim();
  if (!hash.startsWith("0x")) hash = "0x" + hash;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) return null;
  return hash;
}


// --- Store initial hash (first issuance) ---
router.post("/store-initial", requireAuthority, async (req, res) => {
  try {
    let { identityId, hashHex } = req.body;

    identityId = normalizeHash(identityId);
    hashHex = normalizeHash(hashHex);

    if (!identityId || !hashHex) {
      return res.status(400).json({
        success: false,
        error: "Invalid identityId or hash"
      });
    }

    const tx = await contract.methods
      .storeInitialHash(identityId, hashHex)
      .send({ from: account.address, gas: 300000 });

    res.json({
      success: true,
      action: "INITIAL_STORE",
      identityId,
      hash: hashHex,
      txHash: tx.transactionHash,
      blockNumber: tx.blockNumber
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});




// --- Update hash (revoke old, add new) ---
router.post("/update-hash", requireAuthority, async (req, res) => {
  try {
    let { identityId, newHashHex } = req.body;

    identityId = normalizeHash(identityId);
    newHashHex = normalizeHash(newHashHex);

    if (!identityId || !newHashHex) {
      return res.status(400).json({
        success: false,
        error: "Invalid identityId or newHash"
      });
    }

    const tx = await contract.methods
      .updateHash(identityId, newHashHex)
      .send({ from: account.address, gas: 300000 });

    res.json({
      success: true,
      action: "UPDATE_HASH",
      identityId,
      newHash: newHashHex,
      txHash: tx.transactionHash,
      blockNumber: tx.blockNumber
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// --- Verify hash ---
// --- Update hash (revoke old + store new) ---
router.post("/update-hash", requireAuthority, async (req, res) => {
  try {
    let { identityId, newHashHex } = req.body;

    identityId = normalizeHash(identityId);
    newHashHex = normalizeHash(newHashHex);

    if (!identityId || !newHashHex) {
      return res.status(400).json({
        success: false,
        error: "Invalid identityId or newHash"
      });
    }

    const tx = await contract.methods
      .updateHash(identityId, newHashHex)
      .send({ from: account.address, gas: 300000 });

    res.json({
      success: true,
      action: "UPDATE_HASH",
      identityId,
      newHash: newHashHex,
      txHash: tx.transactionHash,
      blockNumber: tx.blockNumber
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Verify hash ---
router.get("/verify/:identityId/:hash", async (req, res) => {
  try {
    let identityId = normalizeHash(req.params.identityId);
    let hash = normalizeHash(req.params.hash);

    if (!identityId || !hash) {
      return res.status(400).json({
        success: false,
        error: "Invalid identityId or hash"
      });
    }

    const valid = await contract.methods.verify(identityId, hash).call();

    res.json({
      success: true,
      valid,
      identityId,
      hash
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;