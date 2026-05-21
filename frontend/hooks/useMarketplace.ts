"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { NFT_MARKETPLACE_ABI } from "@/lib/contractABI";
import { MARKETPLACE_ADDRESS, CONTRACT_ADDRESS } from "@/lib/constants";
import { NFT_MINTING_ABI } from "@/lib/contractABI";

export interface MarketplaceListing {
  seller: string;
  nftAddress: string;
  tokenId: bigint;
  price: bigint;
  isActive: boolean;
}

// Helper function to parse contract and wallet errors
const parseError = (err: any): string => {
  const errorMessage = err.message || err.toString();
  
  // Contract errors
  if (errorMessage.includes("ListingNotActive")) {
    return "This NFT is no longer listed for sale";
  }
  if (errorMessage.includes("InsufficientPayment")) {
    return "Insufficient payment amount";
  }
  if (errorMessage.includes("NotTokenOwner")) {
    return "You don't own this NFT";
  }
  if (errorMessage.includes("MarketplaceNotApproved")) {
    return "Please approve the marketplace first";
  }
  if (errorMessage.includes("NotTheSeller")) {
    return "Only the seller can perform this action";
  }
  if (errorMessage.includes("ListingAlreadyExists")) {
    return "This NFT is already listed for sale";
  }
  if (errorMessage.includes("PriceMustBeGreaterThanZero")) {
    return "Price must be greater than 0";
  }
  if (errorMessage.includes("TransferFailed")) {
    return "Transfer failed. Please try again";
  }
  
  // MetaMask/Wallet errors
  if (errorMessage.includes("user rejected") || errorMessage.includes("User denied")) {
    return "Transaction rejected by user";
  }
  if (errorMessage.includes("insufficient funds")) {
    return "Insufficient ETH in wallet";
  }
  if (errorMessage.includes("network") || errorMessage.includes("Network")) {
    return "Network error. Please check your connection";
  }
  
  // Generic errors
  if (errorMessage.includes("invalid BigNumber") || errorMessage.includes("invalid price")) {
    return "Invalid price format";
  }
  
  return errorMessage || "Transaction failed. Please try again";
};

export function useMarketplace() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApproval = useCallback(async (tokenId: number): Promise<boolean> => {
    try {
      if (!window.ethereum) return false;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, NFT_MINTING_ABI, signer);
      
      const approved = await nftContract.getApproved(tokenId);
      const isApprovedForAll = await nftContract.isApprovedForAll(await signer.getAddress(), MARKETPLACE_ADDRESS);
      
      return approved === MARKETPLACE_ADDRESS || isApprovedForAll;
    } catch (err) {
      console.error("Error checking approval:", err);
      return false;
    }
  }, []);

  const approveMarketplace = useCallback(async (tokenId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        setError("MetaMask not installed");
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, NFT_MINTING_ABI, signer);

      const tx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await tx.wait();

      return true;
    } catch (err: any) {
      console.error("Error approving marketplace:", err);
      setError(parseError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listNFT = useCallback(async (tokenId: number, priceInEth: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        setError("MetaMask not installed");
        return false;
      }

      if (!MARKETPLACE_ADDRESS) {
        setError("Marketplace not deployed");
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, signer);

      const priceWei = ethers.parseEther(priceInEth);
      const tx = await marketplace.listNFT(CONTRACT_ADDRESS, tokenId, priceWei);
      await tx.wait();

      return true;
    } catch (err: any) {
      console.error("Error listing NFT:", err);
      setError(parseError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buyNFT = useCallback(async (tokenId: number, priceInEth: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        setError("MetaMask not installed");
        return false;
      }

      if (!MARKETPLACE_ADDRESS) {
        setError("Marketplace not deployed");
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, signer);

      const priceWei = ethers.parseEther(priceInEth);
      const tx = await marketplace.buyNFT(CONTRACT_ADDRESS, tokenId, { value: priceWei });
      await tx.wait();

      return true;
    } catch (err: any) {
      console.error("Error buying NFT:", err);
      setError(parseError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelListing = useCallback(async (tokenId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        setError("MetaMask not installed");
        return false;
      }

      if (!MARKETPLACE_ADDRESS) {
        setError("Marketplace not deployed");
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, signer);

      const tx = await marketplace.cancelListing(CONTRACT_ADDRESS, tokenId);
      await tx.wait();

      return true;
    } catch (err: any) {
      console.error("Error canceling listing:", err);
      setError(parseError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateListingPrice = useCallback(async (tokenId: number, newPriceInEth: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        setError("MetaMask not installed");
        return false;
      }

      if (!MARKETPLACE_ADDRESS) {
        setError("Marketplace not deployed");
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, signer);

      const priceWei = ethers.parseEther(newPriceInEth);
      const tx = await marketplace.updateListingPrice(CONTRACT_ADDRESS, tokenId, priceWei);
      await tx.wait();

      return true;
    } catch (err: any) {
      console.error("Error updating listing price:", err);
      setError(parseError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActiveListings = useCallback(async (): Promise<MarketplaceListing[]> => {
    try {
      if (!window.ethereum) return [];
      if (!MARKETPLACE_ADDRESS) return [];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, provider);

      const listings = await marketplace.getActiveListings();
      return listings.map((listing: any) => ({
        seller: listing.seller,
        nftAddress: listing.nftAddress,
        tokenId: listing.tokenId,
        price: listing.price,
        isActive: listing.isActive
      }));
    } catch (err) {
      console.error("Error fetching active listings:", err);
      return [];
    }
  }, []);

  const checkIfListed = useCallback(async (tokenId: number): Promise<boolean> => {
    try {
      if (!window.ethereum) return false;
      if (!MARKETPLACE_ADDRESS) return false;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, provider);

      return await marketplace.hasListing(CONTRACT_ADDRESS, tokenId);
    } catch (err) {
      console.error("Error checking if listed:", err);
      return false;
    }
  }, []);

  const validateBuyNFT = useCallback(async (tokenId: number, price: bigint): Promise<{ valid: boolean; error?: string }> => {
    try {
      if (!window.ethereum) {
        return { valid: false, error: "MetaMask not installed" };
      }
      if (!MARKETPLACE_ADDRESS) {
        return { valid: false, error: "Marketplace not deployed" };
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, provider);
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, NFT_MINTING_ABI, provider);

      // Check if listing exists
      const hasListingCheck = await marketplace.hasListing(CONTRACT_ADDRESS, tokenId);
      if (!hasListingCheck) {
        return { valid: false, error: "This NFT is not listed for sale" };
      }

      // Get listing details using getListing function
      let listing;
      try {
        listing = await marketplace.getListing(CONTRACT_ADDRESS, tokenId);
      } catch (err) {
        return { valid: false, error: "This listing is no longer active" };
      }
      
      if (!listing.isActive) {
        return { valid: false, error: "This listing is no longer active" };
      }

      // Verify seller still owns the NFT
      const owner = await nftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== listing.seller.toLowerCase()) {
        return { valid: false, error: "Seller no longer owns this NFT" };
      }

      // Check buyer's balance
      const balance = await provider.getBalance(await signer.getAddress());
      if (balance < price) {
        return { valid: false, error: "Insufficient ETH in wallet" };
      }

      return { valid: true };
    } catch (err: any) {
      console.error("Validation error:", err);
      return { valid: false, error: parseError(err) };
    }
  }, []);

  const validateListNFT = useCallback(async (tokenId: number, price: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      if (!window.ethereum) {
        return { valid: false, error: "MetaMask not installed" };
      }
      if (!MARKETPLACE_ADDRESS) {
        return { valid: false, error: "Marketplace not deployed" };
      }

      // Validate price
      if (!price || parseFloat(price) <= 0) {
        return { valid: false, error: "Price must be greater than 0" };
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, NFT_MINTING_ABI, provider);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI, provider);

      // Check if user owns the token
      const owner = await nftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        return { valid: false, error: "You don't own this NFT" };
      }

      // Check if already listed
      const hasListing = await marketplace.hasListing(CONTRACT_ADDRESS, tokenId);
      if (hasListing) {
        return { valid: false, error: "This NFT is already listed" };
      }

      return { valid: true };
    } catch (err: any) {
      console.error("Validation error:", err);
      return { valid: false, error: parseError(err) };
    }
  }, []);

  return {
    isLoading,
    error,
    checkApproval,
    approveMarketplace,
    listNFT,
    buyNFT,
    cancelListing,
    updateListingPrice,
    getActiveListings,
    checkIfListed,
    validateBuyNFT,
    validateListNFT
  };
}
