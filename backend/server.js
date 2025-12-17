require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Web3 = require("web3");
const connectDB = require("./src/utils/database");
const authRoutes = require("./src/routes/authRoutes");
const adminAuth = require("./src/routes/adminAuth");
const blockchainRoutes = require("./src/routes/blockchainRoutes");
const authorityAuth = require("./src/routes/authorityAuth");
const adminDashboard = require("./src/routes/adminDashboard");
const authorityDashboard = require("./src/routes/authorityDashboard");
const HashRegistryABI = require("./artifacts/contracts/HashRegistry.sol/HashRegistry.json").abi;
const { requireAdmin, requireAuthority } = require("./src/middleware/authMiddleware");



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// JSON parse error handler - returns a clear 400 when incoming JSON is malformed
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('Invalid JSON payload received:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  // some body-parser versions throw SyntaxError
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('SyntaxError while parsing JSON:', err.message);
    return res.status(400).json({ success: false, message: 'Malformed JSON' });
  }
  next();
});

// === CONNECT DB ===
connectDB();

// === WEB3 SETUP ===
let web3, account, contract;
try {
  web3 = new Web3(process.env.SEPOLIA_RPC_URL);
  account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  contract = new web3.eth.Contract(HashRegistryABI, process.env.CONTRACT_ADDRESS);

  console.log("Web3 initialized & contract loaded at:", process.env.CONTRACT_ADDRESS);
  console.log("Using account:", account.address);
} catch (err) {
  console.error("Web3 setup failed:", err.message);
  process.exit(1);
}

// === ROUTES ===
app.get("/", (req, res) => {
  res.json({
    message: "MyVault + Blockchain Backend Running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/register, /api/auth/login",
      hash: "POST /hash/sha256",
      store: "POST /store",
      verify: "GET /verify/:hash",
    },
  });
});

// Mount authentication routes
app.use("/api/auth", authRoutes);

// Mount admin routes
app.use("/api/admin", adminAuth);

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

// Authority /login and /logout
app.use("/api/authority", authorityAuth);
//Blockchain routes
app.use("/api/authority", blockchainRoutes);
app.use("/api", blockchainRoutes);

// Mount admin dashboard routes
//app.get("/api/admin/dashboard",requireAdmin,(req,res) => res.json({ message: "Admin Dashboard"}));
//app.get("/api/authority/dashboard", requireAuthority, (req, res) => res.json({ message: "Authority Dashboard" }));

app.use("/api/admin", adminDashboard);
app.use("/api/authority", authorityDashboard);

app.post("/hash/sha256", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "No data provided" });
  const hash = web3.utils.sha3(data);
  res.json({ bytes32: hash });
});


// --- Store hash endpoint ---
app.post("/store", requireAdmin ,async (req, res) => {
  let { hashHex } = req.body;

  if (!hashHex) return res.status(400).json({ error: "No hash provided" });

  hashHex = hashHex.trim();
  if (!hashHex.startsWith('0x')) hashHex = '0x' + hashHex;

  if (!/^0x[0-9a-fA-F]{64}$/.test(hashHex)) {
    return res.status(400).json({ error: "Hash must be 32 bytes (64 hex chars) with 0x prefix" });
  }

  try {
    const tx = await contract.methods
      .storeHash(hashHex)
      .send({ from: account.address, gas: 300000 });

    res.json({
      txHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      from: account.address,
      stored: hashHex
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Verify hash endpoint ---
app.get("/verify/:hash", async (req, res) => {
  try {
    let hash = req.params.hash.trim();
    if (!hash.startsWith('0x')) hash = '0x' + hash;

    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      return res.status(400).json({ error: "Invalid hash format" });
    }

    const exists = await contract.methods.verifyHash(hash).call();
    res.json({
      exists,
      timestamp: exists ? Date.now() : 0,
      iso: exists ? new Date().toISOString() : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// === ERROR & 404 ===
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// === START ===
app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running on http://localhost:${PORT}`);
});