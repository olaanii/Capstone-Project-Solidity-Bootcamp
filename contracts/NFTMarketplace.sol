// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @dev A decentralized marketplace for trading ERC721 NFTs with approval-style listings
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    
    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    // Array of all listings for easy enumeration
    Listing[] public activeListings;
    
    // Mapping from NFT address => tokenId => listing index in activeListings array
    mapping(address => mapping(uint256 => uint256)) public listingIndex;
    
    // Mapping to track if a listing exists
    mapping(address => mapping(uint256 => bool)) public hasListing;

    // Events
    event NFTListed(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 listingId
    );
    
    event NFTSold(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price
    );
    
    event NFTListingCanceled(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event ListingPriceUpdated(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );

    // Custom errors
    error PriceMustBeGreaterThanZero();
    error NotTokenOwner();
    error MarketplaceNotApproved();
    error ListingNotActive();
    error InsufficientPayment();
    error NotTheSeller();
    error ListingAlreadyExists();
    error TransferFailed();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice List an NFT for sale on the marketplace
     * @param nftAddress The address of the NFT contract
     * @param tokenId The ID of the token to list
     * @param price The listing price in wei
     */
    function listNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        if (price == 0) revert PriceMustBeGreaterThanZero();
        if (hasListing[nftAddress][tokenId]) revert ListingAlreadyExists();
        
        IERC721 nft = IERC721(nftAddress);
        
        if (nft.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        
        // Check if marketplace is approved
        if (
            !nft.isApprovedForAll(msg.sender, address(this)) &&
            nft.getApproved(tokenId) != address(this)
        ) revert MarketplaceNotApproved();

        // Create listing
        uint256 listingId = activeListings.length;
        activeListings.push(
            Listing({
                seller: msg.sender,
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
                isActive: true
            })
        );

        listingIndex[nftAddress][tokenId] = listingId;
        hasListing[nftAddress][tokenId] = true;

        emit NFTListed(nftAddress, tokenId, msg.sender, price, listingId);
    }

    /**
     * @notice Purchase a listed NFT
     * @param nftAddress The address of the NFT contract
     * @param tokenId The ID of the token to purchase
     */
    function buyNFT(address nftAddress, uint256 tokenId) external payable nonReentrant {
        if (!hasListing[nftAddress][tokenId]) revert ListingNotActive();
        
        uint256 index = listingIndex[nftAddress][tokenId];
        Listing storage listing = activeListings[index];
        
        if (!listing.isActive) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment();

        address seller = listing.seller;
        uint256 price = listing.price;

        // Mark as inactive and remove from mappings
        listing.isActive = false;
        hasListing[nftAddress][tokenId] = false;

        // Transfer NFT to buyer
        IERC721(nftAddress).safeTransferFrom(seller, msg.sender, tokenId);

        // Transfer funds to seller
        (bool success, ) = payable(seller).call{value: price}("");
        if (!success) revert TransferFailed();

        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            if (!refundSuccess) revert TransferFailed();
        }

        emit NFTSold(nftAddress, tokenId, seller, msg.sender, price);
    }

    /**
     * @notice Cancel an active listing
     * @param nftAddress The address of the NFT contract
     * @param tokenId The ID of the token to cancel
     */
    function cancelListing(address nftAddress, uint256 tokenId) external nonReentrant {
        if (!hasListing[nftAddress][tokenId]) revert ListingNotActive();
        
        uint256 index = listingIndex[nftAddress][tokenId];
        Listing storage listing = activeListings[index];
        
        if (!listing.isActive) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotTheSeller();

        // Mark as inactive and remove from mappings
        listing.isActive = false;
        hasListing[nftAddress][tokenId] = false;

        emit NFTListingCanceled(nftAddress, tokenId, msg.sender);
    }

    /**
     * @notice Update the price of an active listing
     * @param nftAddress The address of the NFT contract
     * @param tokenId The ID of the token
     * @param newPrice The new price in wei
     */
    function updateListingPrice(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external nonReentrant {
        if (newPrice == 0) revert PriceMustBeGreaterThanZero();
        if (!hasListing[nftAddress][tokenId]) revert ListingNotActive();
        
        uint256 index = listingIndex[nftAddress][tokenId];
        Listing storage listing = activeListings[index];
        
        if (!listing.isActive) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotTheSeller();

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit ListingPriceUpdated(nftAddress, tokenId, oldPrice, newPrice);
    }

    /**
     * @notice Get all active listings
     * @return An array of all active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        // Count active listings
        uint256 activeCount = 0;
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i].isActive) {
                activeCount++;
            }
        }

        // Create array of active listings
        Listing[] memory activeListing = new Listing[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i].isActive) {
                activeListing[currentIndex] = activeListings[i];
                currentIndex++;
            }
        }

        return activeListing;
    }

    /**
     * @notice Get listing details for a specific NFT
     * @param nftAddress The address of the NFT contract
     * @param tokenId The ID of the token
     * @return The listing details
     */
    function getListing(address nftAddress, uint256 tokenId) 
        external 
        view 
        returns (Listing memory) 
    {
        if (!hasListing[nftAddress][tokenId]) revert ListingNotActive();
        uint256 index = listingIndex[nftAddress][tokenId];
        return activeListings[index];
    }

    /**
     * @notice Get total number of listings (active and inactive)
     * @return The total count
     */
    function getTotalListingsCount() external view returns (uint256) {
        return activeListings.length;
    }
}
