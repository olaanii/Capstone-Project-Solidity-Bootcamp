"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Rarity } from "@/lib/contractABI";
import { RARITY_CONFIG, NFT_IMAGES } from "@/lib/constants";
import { useMarketplace, MarketplaceListing } from "@/hooks/useMarketplace";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { Alert } from "@/components/Alert";
import { MobileMenu } from "@/components/MobileMenu";

interface ListingWithMetadata extends MarketplaceListing {
  name: string;
  image: string;
  tier: Rarity;
}

export default function MarketplacePage() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { getActiveListings, buyNFT, isLoading, error, validateBuyNFT } = useMarketplace();
  const [listings, setListings] = useState<ListingWithMetadata[]>([]);
  const [filter, setFilter] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: "error" | "success" | "warning" | "info" } | null>(null);
  const [buyingTokenId, setBuyingTokenId] = useState<number | null>(null);
  const [validating, setValidating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const activeListings = await getActiveListings();
      
      const listingsWithMetadata: ListingWithMetadata[] = activeListings.map((listing) => {
        const tokenId = Number(listing.tokenId);
        const tier = (tokenId % 3) as Rarity;
        const tierKey = tier === 0 ? "common" : tier === 1 ? "rare" : "legendary";
        const imageIndex = tokenId % NFT_IMAGES[tierKey].length;
        
        return {
          ...listing,
          name: `FLUXX #${tokenId}`,
          image: NFT_IMAGES[tierKey][imageIndex],
          tier
        };
      });

      setListings(listingsWithMetadata);
    } catch (err) {
      console.error("Error loading listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (tokenId: number, price: bigint) => {
    setBuyingTokenId(tokenId);
    setValidating(true);
    
    // Pre-transaction validation
    const validation = await validateBuyNFT(tokenId, price);
    setValidating(false);
    
    if (!validation.valid) {
      setAlertInfo({ message: validation.error || "Validation failed", type: "error" });
      setBuyingTokenId(null);
      return;
    }
    
    // Proceed with purchase
    const priceInEth = ethers.formatEther(price);
    const success = await buyNFT(tokenId, priceInEth);
    
    if (success) {
      setAlertInfo({ message: `Successfully purchased NFT #${tokenId}!`, type: "success" });
      await loadListings();
    } else if (error) {
      setAlertInfo({ message: error, type: "error" });
    }
    
    setBuyingTokenId(null);
  };

  const filteredListings = filter === -1 
    ? listings 
    : listings.filter(listing => listing.tier === filter);

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050a0d] text-white font-sans">
      {/* Navigation Bar - Responsive */}
      <nav className="fixed top-4 sm:top-6 lg:top-8 left-4 right-4 sm:left-[5%] sm:right-[5%] lg:left-[5.56%] lg:right-[5.56%] max-w-[1280px] mx-auto z-50">
        <div className="backdrop-blur-md bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] border-b rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between">
          <img src="/logo.png" alt="FLUXX NFT" className="h-6 sm:h-7 lg:h-8 w-auto" />
          <div className="hidden sm:flex items-center gap-4 lg:gap-8">
            <a href="/" className="text-[#c6c9ae] text-[32px] hover:text-white transition">Home</a>
            <a href="/collection" className="text-[#c6c9ae] text-[32px] hover:text-white transition">Collection</a>
            <a href="/marketplace" className="text-[#d2f032] text-[32px] font-medium border-b-2 border-[#d2f032] pb-1">Marketplace</a>
          </div>
          {!mounted ? (
            <div className="bg-[#d2f032] px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full text-[#2c3400] text-xs sm:text-sm font-medium">
              Loading...
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex bg-[#d2f032] px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-full text-[#060e20] text-xs sm:text-sm font-medium items-center gap-2">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#4ade80] rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </div>
              <div className="hidden sm:block">
                <button
                  onClick={() => disconnect()}
                  className="bg-[rgba(210,240,50,0.2)] border border-[#d2f032] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[#d2f032] text-xs sm:text-sm font-medium hover:bg-[rgba(210,240,50,0.3)] transition"
                >
                  Disconnect
                </button>
              </div>
              <MobileMenu currentPage="marketplace" />
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: metaMask() })}
              className="bg-[#d2f032] px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full text-[#2c3400] text-xs sm:text-sm font-medium hover:opacity-90 transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Alert positioned below navbar */}
      {alertInfo && (
        <div className="fixed top-20 sm:top-24 lg:top-28 left-1/2 transform -translate-x-1/2 z-40">
          <Alert
            message={alertInfo.message}
            type={alertInfo.type}
            onClose={() => setAlertInfo(null)}
          />
        </div>
      )}

      {/* Main Content - Responsive */}
      <main className="pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-8 lg:px-12 xl:px-20 max-w-[1440px] mx-auto">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4 lg:mb-6">
            <img src="/logo.png" alt="FLUXX" className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 w-auto" />
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] xl:text-[56px] font-bold leading-tight tracking-[-1.5px] sm:tracking-[-2px] lg:tracking-[-2.88px]">
              <span className="text-[#c3f400]">MARKETPLACE</span>
            </h1>
          </div>
          <p className="text-[#c4c9ac] text-base sm:text-lg px-4 sm:px-0">
            Browse and purchase NFTs from other collectors
          </p>
        </div>

        {/* Filters - Responsive */}
        <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 justify-center sm:justify-start">
          <button
            onClick={() => setFilter(-1)}
            className={`px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-medium text-sm sm:text-base transition ${
              filter === -1
                ? "bg-[#d2f032] text-[#060e20]"
                : "bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] text-[#c4c9ac] hover:border-[rgba(195,244,0,0.5)]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter(Rarity.Common)}
            className={`px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-medium text-sm sm:text-base transition ${
              filter === Rarity.Common
                ? "bg-[#d2f032] text-[#060e20]"
                : "bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] text-[#c4c9ac] hover:border-[rgba(195,244,0,0.5)]"
            }`}
          >
            Common
          </button>
          <button
            onClick={() => setFilter(Rarity.Rare)}
            className={`px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-medium text-sm sm:text-base transition ${
              filter === Rarity.Rare
                ? "bg-[#d2f032] text-[#060e20]"
                : "bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] text-[#c4c9ac] hover:border-[rgba(195,244,0,0.5)]"
            }`}
          >
            Rare
          </button>
          <button
            onClick={() => setFilter(Rarity.Legendary)}
            className={`px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-medium text-sm sm:text-base transition ${
              filter === Rarity.Legendary
                ? "bg-[#d2f032] text-[#060e20]"
                : "bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] text-[#c4c9ac] hover:border-[rgba(195,244,0,0.5)]"
            }`}
          >
            Legendary
          </button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center text-[#c4c9ac] py-20">Loading marketplace...</div>
        ) : !isConnected ? (
          <div className="text-center py-20">
            <p className="text-[#c4c9ac] text-lg mb-4">Connect your wallet to browse the marketplace</p>
            <button
              onClick={() => connect({ connector: metaMask() })}
              className="bg-[#d2f032] px-8 py-4 rounded-full text-[#2c3400] font-bold text-lg hover:opacity-90 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#c4c9ac] text-lg">No NFTs listed for sale</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {paginatedListings.map((listing) => {
              const tokenId = Number(listing.tokenId);
              const tierKey = listing.tier === 0 ? "common" : listing.tier === 1 ? "rare" : "legendary";
              const isBuying = buyingTokenId === tokenId;
              
              return (
                <div
                  key={tokenId}
                  className="bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-lg overflow-hidden hover:border-[rgba(195,244,0,0.5)] transition"
                >
                  <div className="aspect-square relative">
                    <img
                      src={listing.image}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[rgba(18,18,18,0.8)] border border-[rgba(255,255,255,0.1)] rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                      <span className="text-[#d2f032] text-[10px] sm:text-xs font-bold tracking-[1.2px]">
                        {RARITY_CONFIG[tierKey].name.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6">
                    <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-2">{listing.name}</h3>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[#c4c9ac] text-xs sm:text-sm">ID: {tokenId}</span>
                      <span className="text-[#d2f032] font-bold text-sm sm:text-base">
                        {ethers.formatEther(listing.price)} ETH
                      </span>
                    </div>
                    <div className="text-[#c4c9ac] text-xs mb-3">
                      Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                    </div>
                    <button
                      onClick={() => handleBuy(tokenId, listing.price)}
                      disabled={isBuying || isLoading || validating || listing.seller.toLowerCase() === address?.toLowerCase()}
                      className="w-full bg-[#d2f032] text-[#2c3400] py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {listing.seller.toLowerCase() === address?.toLowerCase() 
                        ? "Your Listing" 
                        : isBuying && validating
                        ? "Validating..."
                        : isBuying 
                        ? "Buying..." 
                        : "Buy Now"}
                    </button>
                  </div>
                </div>
              );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8 sm:mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-lg text-[#c4c9ac] text-sm sm:text-base hover:border-[rgba(195,244,0,0.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition ${
                        currentPage === page
                          ? "bg-[#d2f032] text-[#2c3400] font-bold"
                          : "bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] text-[#c4c9ac] hover:border-[rgba(195,244,0,0.5)]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-lg text-[#c4c9ac] text-sm sm:text-base hover:border-[rgba(195,244,0,0.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer - Responsive */}
      <footer className="bg-[#1d2224] border-t border-[rgba(68,73,51,0.2)] py-8 sm:py-10 lg:py-12 px-4 sm:px-8 lg:px-12 xl:px-24 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-[1440px] mx-auto flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-[#c4c9ac] text-xs sm:text-sm">
          <a href="/terms" className="hover:text-white transition">Terms</a>
          <a href="/privacy" className="hover:text-white transition">Privacy</a>
          <a href="https://discord.gg/ZN3xkYaT" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Discord</a>
          <a href="#" className="hover:text-white transition">Twitter</a>
        </div>
      </footer>
    </div>
  );
}
