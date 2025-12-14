require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
solidity: "0.8.20",
networks: {
  hardhat: {},
  localhost: { url: "http://127.0.0.1:8545" }
}

};

