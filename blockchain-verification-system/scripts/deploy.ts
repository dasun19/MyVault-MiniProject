
import hre from "hardhat";



async function main(){
    console.log("HRE Ethers:", hre.ethers); // Debug line
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const HashStore = await hre.ethers.getContractFactory("HashStore");
    const hashStore = await HashStore.deploy();

    await hashStore.waitForDeployment();

    console.log("HashStore contract deplyed to: ", hashStore.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})