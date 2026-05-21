/**
 * @file scripts/deploy.js
 * @description Hardhat deployment script for the `NFTMinting` contract with rarity tiers.
 *              The contract uses a hardcoded Pinata folder base URI for images.
 *
 * @env {string} NFT_NAME - ERC721 name (default: "Capstone NFT").
 * @env {string} NFT_SYMBOL - ERC721 symbol (default: "CNFT").
 * @env {string} MAX_SUPPLY - Maximum mintable supply (default: 1000). Parsed as BigInt.
 *
 * @dev If deploying to Sepolia and `ETHERSCAN_API_KEY` is set, the script will
 *      wait for block confirmations and attempt contract verification.
 */
const hre = require("hardhat");

/**
 * Deploys `NFTMinting` using constructor args derived from environment variables.
 * @returns {Promise<void>}
 */
async function main() {
  const name = process.env.NFT_NAME || "Capstone NFT";
  const symbol = process.env.NFT_SYMBOL || "CNFT";
  const maxSupply = process.env.MAX_SUPPLY ? BigInt(process.env.MAX_SUPPLY) : 1000n;

  const Factory = await hre.ethers.getContractFactory("NFTMinting");
  const contract = await Factory.deploy(
    name, 
    symbol, 
    maxSupply
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`NFTMinting deployed to: ${address}`);
  console.log(`Max Supply: ${maxSupply}`);
  
  // Log the hardcoded prices and limits
  console.log(`Common Price: 100000000000000 wei (0.0001 ETH)`);
  console.log(`Rare Price: 500000000000000 wei (0.0005 ETH)`);
  console.log(`Legendary Price: 2000000000000000 wei (0.002 ETH)`);
  console.log(`Wallet Limits - Common: 5, Rare: 3, Legendary: 1`);
  console.log(`Base URI: https://gateway.pinata.cloud/ipfs/bafybeicm7ebe23oj3kqod272ta3ksloyyk5v2byjrlcgc6gxq27mvpoxgm/`);

  // Optional Etherscan verification on Sepolia.
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations before verification...");
    await contract.deploymentTransaction().wait(6);

    await hre.run("verify:verify", {
      address,
      constructorArguments: [
        name, 
        symbol, 
        maxSupply
      ]
    });
  }
}

// Ensures any deployment errors are surfaced and cause a non-zero exit code.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
