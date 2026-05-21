/**
 * @file test/NFTMinting.js
 * @description Hardhat test suite for the `NFTMinting` contract.
 *
 * The tests cover:
 * - Constructor parameter validation via custom errors
 * - Minting success path and token metadata
 * - Supply cap enforcement
 * - Mint price / msg.value correctness
 * - Owner-only administrative functions (base URI, mint price, pause, withdraw)
 * - Pausable behavior
 * - Withdrawals draining ETH to the owner
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Integration-style tests using a fresh deployment per test via `deployFixture()`.
 */
describe("NFTMinting", function () {
  const NAME = "FLUXX NFT";
  const SYMBOL = "FLX";
  const BASE_URI = "ipfs://base/";
  const MAX_SUPPLY = 2;
  const MINT_PRICE = ethers.parseEther("0.01");

  /**
   * Deploys a new `NFTMinting` contract instance and returns useful signers.
   * @returns {Promise<{contract: any, owner: any, user: any, other: any}>}
   */
  async function deployFixture() {
    const [owner, user, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("NFTMinting");
    const contract = await Factory.deploy(NAME, SYMBOL, BASE_URI, MAX_SUPPLY, MINT_PRICE);
    await contract.waitForDeployment();

    return { contract, owner, user, other };
  }

  // Constructor validation: insecure parameters should revert with the proper custom errors.
  it("reverts deployment with insecure constructor parameters", async function () {
    const Factory = await ethers.getContractFactory("NFTMinting");

    await expect(Factory.deploy(NAME, SYMBOL, BASE_URI, 0n, MINT_PRICE)).to.be.revertedWithCustomError(
      Factory,
      "MaxSupplyMustBeGreaterThanZero"
    );
    await expect(Factory.deploy(NAME, SYMBOL, "", MAX_SUPPLY, MINT_PRICE)).to.be.revertedWithCustomError(
      Factory,
      "EmptyBaseURI"
    );
    await expect(Factory.deploy(NAME, SYMBOL, BASE_URI, MAX_SUPPLY, 0n)).to.be.revertedWithCustomError(
      Factory,
      "MintPriceMustBeGreaterThanZero"
    );
  });

  // Happy path: minting increments supply, mints to the caller, and tokenURI follows base URI convention.
  it("mints successfully and assigns token metadata", async function () {
    const { contract, user } = await deployFixture();

    await expect(contract.connect(user).mint({ value: MINT_PRICE }))
      .to.emit(contract, "Minted")
      .withArgs(user.address, 1n);

    expect(await contract.ownerOf(1n)).to.equal(user.address);
    expect(await contract.tokenURI(1n)).to.equal(`${BASE_URI}1`);
    expect(await contract.totalSupply()).to.equal(1n);
  });

  // Supply cap enforcement: the third mint attempt should revert when `maxSupply` has been reached.
  it("reverts when max supply is reached", async function () {
    const { contract, user, other } = await deployFixture();

    await contract.connect(user).mint({ value: MINT_PRICE });
    await contract.connect(other).mint({ value: MINT_PRICE });

    await expect(contract.connect(user).mint({ value: MINT_PRICE })).to.be.revertedWithCustomError(
      contract,
      "MaxSupplyReached"
    );
  });

  // Payments enforcement: mint must be called with exact ETH equal to the configured mint price.
  it("reverts when ETH sent is not equal to mint price", async function () {
    const { contract, user } = await deployFixture();

    await expect(contract.connect(user).mint({ value: ethers.parseEther("0.001") })).to.be.revertedWithCustomError(
      contract,
      "IncorrectMintPrice"
    );
    await expect(contract.connect(user).mint({ value: ethers.parseEther("0.02") })).to.be.revertedWithCustomError(
      contract,
      "IncorrectMintPrice"
    );
  });

  // Owner-only admin functions: invalid values should revert with the contract's custom errors,
  // and callers must be restricted by Ownable.
  it("reverts when owner sets invalid base URI or mint price", async function () {
    const { contract, owner } = await deployFixture();

    await expect(contract.connect(owner).setBaseURI("")).to.be.revertedWithCustomError(contract, "EmptyBaseURI");
    await expect(contract.connect(owner).setMintPrice(0n)).to.be.revertedWithCustomError(
      contract,
      "MintPriceMustBeGreaterThanZero"
    );
  });

  // Access control: non-owners should be unable to call admin functions.
  it("allows only owner to call admin functions", async function () {
    const { contract, user } = await deployFixture();

    await expect(contract.connect(user).setBaseURI("ipfs://updated/")).to.be.revertedWithCustomError(
      contract,
      "OwnableUnauthorizedAccount"
    );

    await expect(contract.connect(user).setMintPrice(1n)).to.be.revertedWithCustomError(
      contract,
      "OwnableUnauthorizedAccount"
    );

    await expect(contract.connect(user).pause()).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    await expect(contract.connect(user).unpause()).to.be.revertedWithCustomError(
      contract,
      "OwnableUnauthorizedAccount"
    );

    await expect(contract.connect(user).withdraw()).to.be.revertedWithCustomError(
      contract,
      "OwnableUnauthorizedAccount"
    );
  });

  // Funds flow: after a mint, `withdraw()` should transfer the contract ETH balance to the owner.
  it("withdraws contract balance to owner", async function () {
    const { contract, owner, user } = await deployFixture();

    await contract.connect(user).mint({ value: MINT_PRICE });

    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    const tx = await contract.connect(owner).withdraw();
    const receipt = await tx.wait();

    const gasCost = receipt.gasUsed * receipt.gasPrice;
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

    expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + MINT_PRICE - gasCost);
    expect(await ethers.provider.getBalance(await contract.getAddress())).to.equal(0n);
  });

  // Pausable behavior: minting should revert while paused, and succeed again after unpausing.
  it("prevents minting when paused and allows again when unpaused", async function () {
    const { contract, owner, user } = await deployFixture();

    await contract.connect(owner).pause();
    await expect(contract.connect(user).mint({ value: MINT_PRICE })).to.be.revertedWithCustomError(
      contract,
      "EnforcedPause"
    );

    await contract.connect(owner).unpause();

    await expect(contract.connect(user).mint({ value: MINT_PRICE }))
      .to.emit(contract, "Minted")
      .withArgs(user.address, 1n);
  });
});
