/**
 * @file scripts/deploy.js
 * @description Hardhat deployment script for the `NFTMinting` contract.
 *              Values can be configured via environment variables, making it easy
 *              to deploy to multiple networks with different mint settings.
 *
 * @env {string} NFT_NAME - ERC721 name (default: "Capstone NFT").
 * @env {string} NFT_SYMBOL - ERC721 symbol (default: "CNFT").
 * @env {string} BASE_URI - Metadata base URI (default: "ipfs://your-metadata-base/").
 * @env {string} MAX_SUPPLY - Maximum mintable supply (default: 1000). Parsed as BigInt.
 * @env {string} MINT_PRICE_WEI - Mint price in wei (default: 0.01 ETH). Parsed as BigInt.
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
  const baseURI = process.env.BASE_URI || "ipfs://your-metadata-base/";
  const maxSupply = process.env.MAX_SUPPLY ? BigInt(process.env.MAX_SUPPLY) : 1000n;
  const mintPriceWei = process.env.MINT_PRICE_WEI ? BigInt(process.env.MINT_PRICE_WEI) : hre.ethers.parseEther("0.01");

  const Factory = await hre.ethers.getContractFactory("NFTMinting");
  const contract = await Factory.deploy(name, symbol, baseURI, maxSupply, mintPriceWei);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`NFTMinting deployed to: ${address}`);

  // Optional Etherscan verification on Sepolia.
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations before verification...");
    await contract.deploymentTransaction().wait(6);

    await hre.run("verify:verify", {
      address,
      constructorArguments: [name, symbol, baseURI, maxSupply, mintPriceWei]
    });
  }
}

// Ensures any deployment errors are surfaced and cause a non-zero exit code.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
