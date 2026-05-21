"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Rarity } from "@/lib/contractABI";
import { useContract } from "./useContract";

export function useMint() {
  const { contract, signer } = useContract();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mint = async (tier: Rarity) => {
    if (!contract || !signer) {
      setError("Wallet not connected");
      return null;
    }

    setIsMinting(true);
    setError(null);

    try {
      const mintPrices = await contract.mintPrices(tier);
      const tx = await contract.mint(tier, { value: mintPrices });
      const receipt = await tx.wait();
      
      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === "MintedWithRarity";
        } catch {
          return false;
        }
      });

      if (mintEvent) {
        const parsed = contract.interface.parseLog(mintEvent);
        if (parsed && parsed.args) {
          return {
            tokenId: parsed.args.tokenId?.toString() || "0",
            tier: parsed.args.tier || Rarity.Common,
            txHash: receipt.hash
          };
        }
      }

      return { txHash: receipt.hash };
    } catch (err: any) {
      console.error("Mint error:", err);
      let errorMessage = "Failed to mint NFT";
      
      // Extract user-friendly error message
      if (err.code === "ACTION_REJECTED" || err.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        // Clean up common error messages
        if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (err.message.includes("wallet limit")) {
          errorMessage = "Wallet limit reached for this tier";
        } else if (err.message.includes("wrong chain") || err.message.includes("network")) {
          errorMessage = "Please switch to Sepolia testnet";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsMinting(false);
    }
  };

  const getWalletMintCount = async (address: string, tier: Rarity) => {
    if (!contract) return 0;
    try {
      const count = await contract.getWalletMintCount(address, tier);
      return Number(count);
    } catch (err) {
      console.error("Error getting wallet mint count:", err);
      return 0;
    }
  };

  const getTokenRarity = async (tokenId: number) => {
    if (!contract) return Rarity.Common;
    try {
      const tier = await contract.getTokenRarity(tokenId);
      return Number(tier);
    } catch (err) {
      console.error("Error getting token rarity:", err);
      return Rarity.Common;
    }
  };

  return {
    mint,
    isMinting,
    error,
    getWalletMintCount,
    getTokenRarity
  };
}
