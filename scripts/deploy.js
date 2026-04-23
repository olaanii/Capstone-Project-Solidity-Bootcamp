const hre = require("hardhat");

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

  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations before verification...");
    await contract.deploymentTransaction().wait(6);

    await hre.run("verify:verify", {
      address,
      constructorArguments: [name, symbol, baseURI, maxSupply, mintPriceWei]
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
