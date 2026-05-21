"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Rarity } from "@/lib/contractABI";
import { RARITY_CONFIG, NFT_IMAGES } from "@/lib/constants";
import { useMint } from "@/hooks/useMint";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { Alert } from "@/components/Alert";
import { MobileMenu } from "@/components/MobileMenu";

export default function MintPage() {
  const { mint, isMinting, error, getWalletMintCount } = useMint();
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [selectedTier, setSelectedTier] = useState<Rarity>(Rarity.Common);
  const [walletCounts, setWalletCounts] = useState({ 0: 0, 1: 0, 2: 0 });
  const [mounted, setMounted] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: "error" | "success" | "warning" | "info" } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadWalletData = async () => {
      if (isConnected && address && chainId === 11155111) {
        try {
          const commonCount = await getWalletMintCount(address, Rarity.Common);
          const rareCount = await getWalletMintCount(address, Rarity.Rare);
          const legendaryCount = await getWalletMintCount(address, Rarity.Legendary);
          setWalletCounts({ 0: commonCount, 1: rareCount, 2: legendaryCount });
        } catch (err) {
          console.error("Failed to load wallet data:", err);
        }
      }
    };

    loadWalletData();
  }, [isConnected, address, chainId, getWalletMintCount]);

  const handleMint = async () => {
    if (!isConnected) {
      connect({ connector: metaMask() });
      return;
    }

    if (chainId !== 11155111) {
      setAlertInfo({ message: "Please switch to Sepolia network", type: "warning" });
      return;
    }

    const result = await mint(selectedTier);
    if (result && address) {
      // Show success alert
      setAlertInfo({ 
        message: `Successfully minted NFT #${result.tokenId}! Transaction: ${result.txHash.slice(0, 20)}...`, 
        type: "success" 
      });
      
      // Refresh wallet counts
      const commonCount = await getWalletMintCount(address, Rarity.Common);
      const rareCount = await getWalletMintCount(address, Rarity.Rare);
      const legendaryCount = await getWalletMintCount(address, Rarity.Legendary);
      setWalletCounts({ 0: commonCount, 1: rareCount, 2: legendaryCount });
    }
  };

  const tierKeys = Object.keys(RARITY_CONFIG) as Array<keyof typeof RARITY_CONFIG>;

  return (
    <div className="min-h-screen bg-[#050a0d] text-white font-sans">
      {/* Navigation Bar - Responsive */}
      <nav className="fixed top-4 sm:top-6 lg:top-8 left-4 right-4 sm:left-[5%] sm:right-[5%] lg:left-[5.56%] lg:right-[5.56%] max-w-7xl mx-auto z-50">
        <div className="backdrop-blur-md bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] border-b rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between">
          <img src="/logo.png" alt="FLUXX NFT" className="h-6 sm:h-7 lg:h-8 w-auto" />
          <div className="hidden sm:flex items-center gap-4 lg:gap-8">
            <a href="/" className="text-[#d2f032] text-xs sm:text-sm border-b-2 border-[#d2f032] pb-1">Home</a>
            <a href="/collection" className="text-[#c6c9ae] text-xs sm:text-sm hover:text-white transition">Collection</a>
            <a href="/marketplace" className="text-[#c6c9ae] text-xs sm:text-sm hover:text-white transition">Marketplace</a>
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
              <MobileMenu currentPage="home" />
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
        {/* Alert positioned under wallet button area */}
        {alertInfo && (
          <div className="absolute top-full left-0 right-0 mt-2 flex justify-center">
            <Alert
              message={alertInfo.message}
              type={alertInfo.type}
              onClose={() => setAlertInfo(null)}
            />
          </div>
        )}
      </nav>

      {/* Main Content - Responsive */}
      <main className="pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-8 lg:px-12 xl:px-20 max-w-[1440px] mx-auto relative">
        {/* Background Effects - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:block absolute left-[20%] xl:left-[360px] xl:top-[225px] w-50 xl:w-96 h-50 xl:h-96 bg-[#d2f032] blur-[50px] rounded-full opacity-20 mix-blend-screen"></div>
        <div className="hidden lg:block absolute right-[20%] xl:right-[360px] xl:bottom-[225px] w-50 xl:w-96 h-50 xl:h-96 bg-[#caebc9] blur-[50px] rounded-full opacity-10 mix-blend-screen"></div>

        {/* Hero Section - Responsive */}
        <div className="relative z-10 flex items-center justify-center min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
          <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Side - NFT Display */}
            <div className="flex-1 relative order-1 lg:order-1">
              <div className="w-70 h-70 sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px] mx-auto relative">
                {/* NFT Card Border Design */}
                <div className="absolute inset-0 rounded-2xl p-1 bg-linear-to-br from-[#d2f032] via-[#4ade80] to-[#d2f032] animate-gradient-rotate">
                  <div className="absolute inset-0 rounded-2xl bg-[#050a0d] m-1"></div>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-[#d2f032] blur-xl opacity-20 animate-pulse"></div>
                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#d2f032] rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#d2f032] rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#d2f032] rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#d2f032] rounded-br-lg"></div>
                {/* NFT Image */}
                <div className="relative z-10 w-full h-full rounded-xl overflow-hidden p-4">
                  <img
                    src={NFT_IMAGES[selectedTier === 0 ? "common" : selectedTier === 1 ? "rare" : "legendary"][0]}
                    alt="NFT Character"
                    className="w-full h-full object-contain drop-shadow-[0px_25px_25px_0px_rgba(0,0,0,0.3)]"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Mint Panel */}
            <div className="flex-1 lg:pl-4 xl:pl-8 order-2 lg:order-2 w-full">
              <div className="flex flex-col gap-6 lg:gap-8">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4 lg:mb-6">
                    <img src="/logo.png" alt="FLUXX" className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 w-auto" />
                    <h1 className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-tight tracking-[-1.5px] sm:tracking-[-2px] lg:tracking-[-2.88px]">
                      <span className="text-[#c3f400]">COLLECTION</span>
                    </h1>
                  </div>
                  <p className="text-[#c4c9ac] text-base sm:text-lg mt-3 lg:mt-4 px-4 sm:px-0">
                    Mint your elite cyber mascot. 5,000 unique variants with tiered rarity.
                  </p>
                </div>

                {/* Rarity Selection - Responsive */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-0">
                  {tierKeys.map((key) => {
                    const config = RARITY_CONFIG[key];
                    const tierIndex = key === "common" ? 0 : key === "rare" ? 1 : 2;
                    const count = walletCounts[tierIndex];
                    const limit = config.limit;
                    const remaining = limit - count;

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTier(tierIndex)}
                        disabled={remaining <= 0}
                        className={`p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-lg border transition-all ${
                          selectedTier === tierIndex
                            ? "border-[#d2f032] bg-[rgba(210,240,50,0.1)]"
                            : "border-[rgba(68,73,51,0.3)] bg-[rgba(32,31,32,0.7)] hover:border-[rgba(195,244,0,0.5)]"
                        } ${remaining <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="text-[#c4c9ac] text-[8px] sm:text-[10px] md:text-xs tracking-[1px] sm:tracking-[1.5px] md:tracking-[1.8px] font-bold mb-0.5 sm:mb-1 md:mb-2">
                          {config.name.toUpperCase()}
                        </div>
                        <div className="text-white text-xs sm:text-sm md:text-base lg:text-xl font-bold">{config.price} ETH</div>
                        <div className="text-[#c4c9ac] text-[8px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 md:mt-2">
                          {remaining}/{limit}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Mint Button - Responsive */}
                {!mounted ? (
                  <button
                    disabled
                    className="w-full bg-[#d2f032] text-[#2c3400] py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg opacity-50 cursor-not-allowed"
                  >
                    Loading...
                  </button>
                ) : isConnected ? (
                  <button
                    onClick={handleMint}
                    disabled={isMinting || chainId !== 11155111}
                    className="w-full bg-[#d2f032] text-[#2c3400] py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMinting ? "Minting..." : chainId !== 11155111 ? "Switch to Sepolia" : "Mint NFT"}
                  </button>
                ) : (
                  <button
                    onClick={() => connect({ connector: metaMask() })}
                    className="w-full bg-[#d2f032] text-[#2c3400] py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:opacity-90 transition"
                  >
                    Connect Wallet to Mint
                  </button>
                )}

                {error && (
                  <div className="text-red-400 text-sm text-center">{error}</div>
                )}

                <div className="text-[#c4c9ac] text-sm text-center">
                  Max {RARITY_CONFIG[selectedTier === 0 ? "common" : selectedTier === 1 ? "rare" : "legendary"].limit} per wallet for {RARITY_CONFIG[selectedTier === 0 ? "common" : selectedTier === 1 ? "rare" : "legendary"].name} tier.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1d2224] border-t border-[rgba(68,73,51,0.2)] py-12 px-24 mt-20">
        <div className="max-w-[1440px] mx-auto flex justify-center gap-8 text-[#c4c9ac] text-sm">
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Discord</a>
          <a href="#" className="hover:text-white transition">Twitter</a>
        </div>
      </footer>
    </div>
  );
}
