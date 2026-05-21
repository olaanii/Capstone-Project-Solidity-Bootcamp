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
      setError(err.message || "Failed to approve marketplace");
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
      setError(err.message || "Failed to list NFT");
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
      setError(err.message || "Failed to buy NFT");
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
      setError(err.message || "Failed to cancel listing");
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
      setError(err.message || "Failed to update listing price");
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
    checkIfListed
  };
}
