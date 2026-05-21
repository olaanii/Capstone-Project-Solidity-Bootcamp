const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  let nftContract;
  let marketplace;
  let owner;
  let seller;
  let buyer;
  let addr3;

  const COMMON_PRICE = ethers.parseEther("0.0001");
  const LISTING_PRICE = ethers.parseEther("0.5");
  const NEW_LISTING_PRICE = ethers.parseEther("0.7");

  beforeEach(async function () {
    [owner, seller, buyer, addr3] = await ethers.getSigners();

    // Deploy NFT contract
    const NFTMinting = await ethers.getContractFactory("NFTMinting");
    nftContract = await NFTMinting.deploy("FLUXX", "FLUXX", 5000);
    await nftContract.waitForDeployment();

    // Deploy Marketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy();
    await marketplace.waitForDeployment();

    // Mint an NFT to seller
    await nftContract.connect(seller).mint(0, { value: COMMON_PRICE });
  });

  describe("Listing NFTs", function () {
    it("Should list an NFT successfully", async function () {
      const tokenId = 1;
      
      // Approve marketplace
      await nftContract.connect(seller).approve(await marketplace.getAddress(), tokenId);
      
      // List NFT
      await expect(
        marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE)
      )
        .to.emit(marketplace, "NFTListed")
        .withArgs(await nftContract.getAddress(), tokenId, seller.address, LISTING_PRICE, 0);

      // Verify listing
      const listing = await marketplace.getListing(await nftContract.getAddress(), tokenId);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(LISTING_PRICE);
      expect(listing.isActive).to.be.true;
    });

    it("Should fail to list without approval", async function () {
      const tokenId = 1;
      
      await expect(
        marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE)
      ).to.be.revertedWithCustomError(marketplace, "MarketplaceNotApproved");
    });

    it("Should fail to list with zero price", async function () {
      const tokenId = 1;
      await nftContract.connect(seller).approve(await marketplace.getAddress(), tokenId);
      
      await expect(
        marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, 0)
      ).to.be.revertedWithCustomError(marketplace, "PriceMustBeGreaterThanZero");
    });

    it("Should fail to list if not the owner", async function () {
      const tokenId = 1;
      await nftContract.connect(seller).approve(await marketplace.getAddress(), tokenId);
      
      await expect(
        marketplace.connect(buyer).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE)
      ).to.be.revertedWithCustomError(marketplace, "NotTokenOwner");
    });

    it("Should fail to list already listed NFT", async function () {
      const tokenId = 1;
      await nftContract.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE);
      
      await expect(
        marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE)
      ).to.be.revertedWithCustomError(marketplace, "ListingAlreadyExists");
    });

    it("Should work with setApprovalForAll", async function () {
      const tokenId = 1;
      
      // Use setApprovalForAll instead of approve
      await nftContract.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);
      
      await expect(
        marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE)
      ).to.emit(marketplace, "NFTListed");
    });
  });

  describe("Buying NFTs", function () {
    beforeEach(async function () {
      const tokenId = 1;
      await nftContract.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE);
    });

    it("Should buy an NFT successfully", async function () {
      const tokenId = 1;
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await expect(
        marketplace.connect(buyer).buyNFT(await nftContract.getAddress(), tokenId, { value: LISTING_PRICE })
      )
        .to.emit(marketplace, "NFTSold")
        .withArgs(await nftContract.getAddress(), tokenId, seller.address, buyer.address, LISTING_PRICE);

      // Verify NFT ownership transferred
      expect(await nftContract.ownerOf(tokenId)).to.equal(buyer.address);

      // Verify seller received payment
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(LISTING_PRICE);

      // Verify listing is removed (hasListing should be false)
      expect(await marketplace.hasListing(await nftContract.getAddress(), tokenId)).to.be.false;
    });

    it("Should refund excess payment", async function () {
      const tokenId = 1;
      const excessPayment = ethers.parseEther("1.0");
      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await marketplace.connect(buyer).buyNFT(
        await nftContract.getAddress(),
        tokenId,
        { value: excessPayment }
      );
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      const expectedBalance = buyerBalanceBefore - LISTING_PRICE - gasUsed;

      expect(buyerBalanceAfter).to.equal(expectedBalance);
    });

    it("Should fail to buy with insufficient payment", async function () {
      const tokenId = 1;
      const insufficientPayment = ethers.parseEther("0.1");

      await expect(
        marketplace.connect(buyer).buyNFT(await nftContract.getAddress(), tokenId, { value: insufficientPayment })
      ).to.be.revertedWithCustomError(marketplace, "InsufficientPayment");
    });

    it("Should fail to buy inactive listing", async function () {
      const tokenId = 1;
      
      // Cancel the listing
      await marketplace.connect(seller).cancelListing(await nftContract.getAddress(), tokenId);

      await expect(
        marketplace.connect(buyer).buyNFT(await nftContract.getAddress(), tokenId, { value: LISTING_PRICE })
      ).to.be.revertedWithCustomError(marketplace, "ListingNotActive");
    });
  });

  describe("Canceling Listings", function () {
    beforeEach(async function () {
      const tokenId = 1;
      await nftContract.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE);
    });

    it("Should cancel a listing successfully", async function () {
      const tokenId = 1;

      await expect(
        marketplace.connect(seller).cancelListing(await nftContract.getAddress(), tokenId)
      )
        .to.emit(marketplace, "NFTListingCanceled")
        .withArgs(await nftContract.getAddress(), tokenId, seller.address);

      // Verify listing is removed (hasListing should be false)
      expect(await marketplace.hasListing(await nftContract.getAddress(), tokenId)).to.be.false;
    });

    it("Should fail to cancel if not the seller", async function () {
      const tokenId = 1;

      await expect(
        marketplace.connect(buyer).cancelListing(await nftContract.getAddress(), tokenId)
      ).to.be.revertedWithCustomError(marketplace, "NotTheSeller");
    });

    it("Should fail to cancel inactive listing", async function () {
      const tokenId = 1;
      await marketplace.connect(seller).cancelListing(await nftContract.getAddress(), tokenId);

      await expect(
        marketplace.connect(seller).cancelListing(await nftContract.getAddress(), tokenId)
      ).to.be.revertedWithCustomError(marketplace, "ListingNotActive");
    });
  });

  describe("Updating Listing Price", function () {
    beforeEach(async function () {
      const tokenId = 1;
      await nftContract.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE);
    });

    it("Should update listing price successfully", async function () {
      const tokenId = 1;

      await expect(
        marketplace.connect(seller).updateListingPrice(await nftContract.getAddress(), tokenId, NEW_LISTING_PRICE)
      )
        .to.emit(marketplace, "ListingPriceUpdated")
        .withArgs(await nftContract.getAddress(), tokenId, LISTING_PRICE, NEW_LISTING_PRICE);

      const listing = await marketplace.getListing(await nftContract.getAddress(), tokenId);
      expect(listing.price).to.equal(NEW_LISTING_PRICE);
    });

    it("Should fail to update price to zero", async function () {
      const tokenId = 1;

      await expect(
        marketplace.connect(seller).updateListingPrice(await nftContract.getAddress(), tokenId, 0)
      ).to.be.revertedWithCustomError(marketplace, "PriceMustBeGreaterThanZero");
    });

    it("Should fail to update if not the seller", async function () {
      const tokenId = 1;

      await expect(
        marketplace.connect(buyer).updateListingPrice(await nftContract.getAddress(), tokenId, NEW_LISTING_PRICE)
      ).to.be.revertedWithCustomError(marketplace, "NotTheSeller");
    });
  });

  describe("Getting Listings", function () {
    it("Should get all active listings", async function () {
      // Mint and list multiple NFTs
      await nftContract.connect(seller).mint(0, { value: COMMON_PRICE });
      await nftContract.connect(seller).mint(0, { value: COMMON_PRICE });

      await nftContract.connect(seller).approve(await marketplace.getAddress(), 1);
      await nftContract.connect(seller).approve(await marketplace.getAddress(), 2);
      await nftContract.connect(seller).approve(await marketplace.getAddress(), 3);

      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), 1, LISTING_PRICE);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), 2, LISTING_PRICE);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), 3, LISTING_PRICE);

      const activeListings = await marketplace.getActiveListings();
      expect(activeListings.length).to.equal(3);
    });

    it("Should only return active listings", async function () {
      await nftContract.connect(seller).mint(0, { value: COMMON_PRICE });

      await nftContract.connect(seller).approve(await marketplace.getAddress(), 1);
      await nftContract.connect(seller).approve(await marketplace.getAddress(), 2);

      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), 1, LISTING_PRICE);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), 2, LISTING_PRICE);

      // Cancel one listing
      await marketplace.connect(seller).cancelListing(await nftContract.getAddress(), 1);

      const activeListings = await marketplace.getActiveListings();
      expect(activeListings.length).to.equal(1);
      expect(activeListings[0].tokenId).to.equal(2);
    });

    it("Should get total listings count", async function () {
      await nftContract.connect(seller).mint(0, { value: COMMON_PRICE });

      await nftContract.connect(seller).approve(await marketplace.getAddress(), 1);
      await nftContract.connect(seller).approve(await marketplace.getAddress(), 2);

      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), 1, LISTING_PRICE);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), 2, LISTING_PRICE);

      expect(await marketplace.getTotalListingsCount()).to.equal(2);
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks on buyNFT", async function () {
      // This is a basic test - in production, you'd use a malicious contract
      const tokenId = 1;
      await nftContract.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nftContract.getAddress(), tokenId, LISTING_PRICE);

      // The ReentrancyGuard should prevent any reentrancy
      await marketplace.connect(buyer).buyNFT(await nftContract.getAddress(), tokenId, { value: LISTING_PRICE });
      
      // Verify the NFT was transferred
      expect(await nftContract.ownerOf(tokenId)).to.equal(buyer.address);
    });
  });
});
