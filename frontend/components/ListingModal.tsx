"use client";

import { useState } from "react";

interface ListingModalProps {
  tokenId: number;
  tokenName: string;
  tokenImage: string;
  isOpen: boolean;
  onClose: () => void;
  onList: (price: string) => Promise<boolean>;
  needsApproval: boolean;
  onApprove: () => Promise<boolean>;
}

export function ListingModal({
  tokenId,
  tokenName,
  tokenImage,
  isOpen,
  onClose,
  onList,
  needsApproval,
  onApprove
}: ListingModalProps) {
  const [price, setPrice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"input" | "approving" | "listing">("input");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setValidationError(null);
    
    if (!price || parseFloat(price) <= 0) {
      setValidationError("Please enter a valid price");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Approve if needed
      if (needsApproval) {
        setStep("approving");
        const approved = await onApprove();
        if (!approved) {
          setIsProcessing(false);
          setStep("input");
          return;
        }
      }

      // Step 2: List NFT
      setStep("listing");
      const success = await onList(price);
      
      if (success) {
        setPrice("");
        setStep("input");
        setValidationError(null);
        onClose();
      }
    } catch (err: any) {
      console.error("Error in listing flow:", err);
      setValidationError(err.message || "Failed to list NFT");
    } finally {
      setIsProcessing(false);
      setStep("input");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-[#1d2224] border border-[rgba(68,73,51,0.3)] rounded-2xl max-w-md w-full p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-[#c4c9ac] hover:text-white transition disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-6">List NFT for Sale</h2>

        {/* NFT Preview */}
        <div className="mb-6">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img src={tokenImage} alt={tokenName} className="w-full h-full object-cover" />
          </div>
          <p className="text-white font-medium text-center">{tokenName}</p>
          <p className="text-[#c4c9ac] text-sm text-center">Token ID: {tokenId}</p>
        </div>

        {/* Price Input */}
        <div className="mb-6">
          <label className="block text-[#c4c9ac] text-sm mb-2">Listing Price (ETH)</label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isProcessing}
            placeholder="0.5"
            className="w-full bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-lg px-4 py-3 text-white placeholder-[#c4c9ac] focus:outline-none focus:border-[#d2f032] transition disabled:opacity-50"
          />
          <p className="text-[#c4c9ac] text-xs mt-2">
            Suggested: 0.5 - 2.0 ETH depending on rarity
          </p>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-6 p-4 bg-[rgba(255,0,0,0.1)] border border-[rgba(255,0,0,0.3)] rounded-lg">
            <p className="text-red-400 text-sm">
              ❌ {validationError}
            </p>
          </div>
        )}

        {/* Approval Notice */}
        {needsApproval && step === "input" && !validationError && (
          <div className="mb-6 p-4 bg-[rgba(210,240,50,0.1)] border border-[rgba(210,240,50,0.3)] rounded-lg">
            <p className="text-[#d2f032] text-sm">
              ⚠️ You need to approve the marketplace to transfer this NFT. This is a one-time approval per NFT.
            </p>
          </div>
        )}

        {/* Status Messages */}
        {step === "approving" && (
          <div className="mb-6 p-4 bg-[rgba(210,240,50,0.1)] border border-[rgba(210,240,50,0.3)] rounded-lg">
            <p className="text-[#d2f032] text-sm">
              🔄 Approving marketplace... Please confirm in MetaMask
            </p>
          </div>
        )}

        {step === "listing" && (
          <div className="mb-6 p-4 bg-[rgba(210,240,50,0.1)] border border-[rgba(210,240,50,0.3)] rounded-lg">
            <p className="text-[#d2f032] text-sm">
              🔄 Listing NFT... Please confirm in MetaMask
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] text-white py-3 rounded-lg font-medium hover:border-[rgba(195,244,0,0.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !price || parseFloat(price) <= 0}
            className="flex-1 bg-[#d2f032] text-[#2c3400] py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing 
              ? step === "approving" 
                ? "Approving..." 
                : "Listing..."
              : needsApproval 
                ? "Approve & List" 
                : "List for Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
