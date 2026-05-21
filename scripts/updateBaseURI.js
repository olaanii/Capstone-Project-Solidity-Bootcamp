const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = "0x03182DC1E0C56b466b349a38b88C533332f9e0F3";
  // Using public Pinata gateway (no authentication required)
  const newBaseURI = "https://gateway.pinata.cloud/ipfs/bafybeih2vx3l7gyk7srrkdlvhyidbzqovklkizyzv3wubf3c43dgjmkfvu/";
  
  console.log("Updating base URI for NFT contract...");
  console.log("Contract:", contractAddress);
  console.log("New base URI:", newBaseURI);

  const [deployer] = await ethers.getSigners();
  const NFTMinting = await ethers.getContractAt("NFTMinting", contractAddress, deployer);

  const tx = await NFTMinting.setBaseURI(newBaseURI);
  console.log("Transaction submitted:", tx.hash);

  await tx.wait();
  console.log("Base URI updated successfully!");
  console.log("Transaction confirmed:", tx.hash);
  console.log("\nNFT images will now load from:", newBaseURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
