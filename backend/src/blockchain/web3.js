require("dotenv").config();
const Web3 = require("web3");
const HashRegistryABI = require("../../artifacts/contracts/HashRegistry.sol/HashRegistry.json").abi;

// Use your Hardhat local RPC URL
const web3 = new Web3(process.env.HARDHAT_RPC_URL || "http://127.0.0.1:8545");

// Load admin account from private key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Load contract
const contract = new web3.eth.Contract(
  HashRegistryABI,
  process.env.CONTRACT_ADDRESS  // your deployed contract address
);

console.log("Web3 ready, contract at:", contract.options.address);
console.log("Using account:", account.address);

module.exports = { web3, account, contract };
