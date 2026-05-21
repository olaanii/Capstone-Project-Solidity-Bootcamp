"use client";

import { useState } from "react";

interface ManageListingModalProps {
  tokenId: number;
  tokenName: string;
  tokenImage: string;
  currentPrice: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePrice: (newPrice: string) => Promise<boolean>;
  onCancelListing: () => Promise<boolean>;
}

export function ManageListingModal({
  tokenId,
  tokenName,
  tokenImage,
  currentPrice,
  isOpen,
  onClose,
  onUpdatePrice,
  onCancelListing
}: ManageListingModalProps) {
  const [newPrice, setNewPrice] = useState(currentPrice);
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<"update" | "cancel" | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdatePrice = async () => {
    setValidationError(null);
    
    if (!newPrice || parseFloat(newPrice) <= 0) {
      setValidationError("Please enter a valid price");
      return;
    }
    
    if (newPrice === currentPrice) {
      setValidationError("New price must be different from current price");
      return;
    }

    setIsProcessing(true);
    setAction("update");

    try {
      const success = await onUpdatePrice(newPrice);
      if (success) {
        setValidationError(null);
        onClose();
      }
    } catch (err: any) {
      console.error("Error updating price:", err);
      setValidationError(err.message || "Failed to update price");
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  const handleCancelListing = async () => {
    setValidationError(null);
    setIsProcessing(true);
    setAction("cancel");

    try {
      const success = await onCancelListing();
      if (success) {
        setValidationError(null);
        onClose();
      }
    } catch (err: any) {
      console.error("Error canceling listing:", err);
      setValidationError(err.message || "Failed to cancel listing");
    } finally {
      setIsProcessing(false);
      setAction(null);
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
        <h2 className="text-2xl font-bold text-white mb-6">Manage Listing</h2>

        {/* NFT Preview */}
        <div className="mb-6">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img src={tokenImage} alt={tokenName} className="w-full h-full object-cover" />
          </div>
          <p className="text-white font-medium text-center">{tokenName}</p>
          <p className="text-[#c4c9ac] text-sm text-center">Token ID: {tokenId}</p>
        </div>

        {/* Current Price */}
        <div className="mb-6 p-4 bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-lg">
          <p className="text-[#c4c9ac] text-sm mb-1">Current Listing Price</p>
          <p className="text-[#d2f032] text-2xl font-bold">{currentPrice} ETH</p>
        </div>

        {/* Update Price Section */}
        <div className="mb-6">
          <label className="block text-[#c4c9ac] text-sm mb-2">Update Price (ETH)</label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            disabled={isProcessing}
            placeholder={currentPrice}
            className="w-full bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-lg px-4 py-3 text-white placeholder-[#c4c9ac] focus:outline-none focus:border-[#d2f032] transition disabled:opacity-50"
          />
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-6 p-4 bg-[rgba(255,0,0,0.1)] border border-[rgba(255,0,0,0.3)] rounded-lg">
            <p className="text-red-400 text-sm">
              ❌ {validationError}
            </p>
          </div>
        )}

        {/* Status Messages */}
        {action === "update" && (
          <div className="mb-6 p-4 bg-[rgba(210,240,50,0.1)] border border-[rgba(210,240,50,0.3)] rounded-lg">
            <p className="text-[#d2f032] text-sm">
              🔄 Updating price... Please confirm in MetaMask
            </p>
          </div>
        )}

        {action === "cancel" && (
          <div className="mb-6 p-4 bg-[rgba(210,240,50,0.1)] border border-[rgba(210,240,50,0.3)] rounded-lg">
            <p className="text-[#d2f032] text-sm">
              🔄 Canceling listing... Please confirm in MetaMask
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpdatePrice}
            disabled={isProcessing || !newPrice || parseFloat(newPrice) <= 0 || newPrice === currentPrice}
            className="w-full bg-[#d2f032] text-[#2c3400] py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action === "update" ? "Updating Price..." : "Update Price"}
          </button>

          <button
            onClick={handleCancelListing}
            disabled={isProcessing}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action === "cancel" ? "Canceling..." : "Cancel Listing"}
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] text-white py-3 rounded-lg font-medium hover:border-[rgba(195,244,0,0.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
