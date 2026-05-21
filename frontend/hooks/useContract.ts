"use client";

import { useMemo, useState, useEffect } from "react";
import { ethers } from "ethers";
import { NFT_MINTING_ABI } from "@/lib/contractABI";
import { CONTRACT_ADDRESS } from "@/lib/constants";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        console.error("MetaMask not installed");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signerInstance = await provider.getSigner();
        setSigner(signerInstance);
        
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, NFT_MINTING_ABI, signerInstance);
        setContract(contractInstance);
      } catch (error: any) {
        console.error("Error initializing contract:", error);
      }
    };

    initContract();
  }, []);

  return { contract, signer };
}

export function useReadOnlyContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        console.error("MetaMask not installed");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, NFT_MINTING_ABI, provider);
        setContract(contractInstance);
      } catch (error: any) {
        console.error("Error initializing read-only contract:", error);
      }
    };

    initContract();
  }, []);

  return contract;
}
