const { ethers } = require("hardhat");


async function main() {
const [deployer] = await ethers.getSigners();
console.log("Deploying with:", deployer.address);


const HashRegistry = await ethers.getContractFactory("HashRegistry");
const contract = await HashRegistry.deploy();
await contract.waitForDeployment();


const addr = await contract.getAddress();
console.log("HashRegistry deployed to:", addr);
}


main().catch((error) => {
console.error(error);
process.exitCode = 1;
});