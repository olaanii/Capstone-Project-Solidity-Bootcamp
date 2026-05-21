"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Rarity } from "@/lib/contractABI";
import { RARITY_CONFIG, NFT_IMAGES, RARITY_VALUES } from "@/lib/constants";
import { useContract } from "@/hooks/useContract";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { Alert } from "@/components/Alert";
import { MobileMenu } from "@/components/MobileMenu";

interface MintedNFT {
  tokenId: string;
  tier: Rarity;
  name: string;
  image: string;
  value: string;
}

export default function CollectionPage() {
  const { contract } = useContract();
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [nfts, setNfts] = useState<MintedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Rarity | -1>(-1);
  const [mounted, setMounted] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: "error" | "success" | "warning" | "info" } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadCollection = async () => {
      if (!isConnected || !address || chainId !== 11155111) {
        setLoading(false);
        return;
      }

      if (typeof window === "undefined" || !window.ethereum) {
        setLoading(false);
        return;
      }

      try {
        if (contract) {
          const balance = await contract.balanceOf(address);
          const totalSupply = await contract.totalSupply();
          
          const userNfts: MintedNFT[] = [];
          
          for (let i = 1; i <= Number(totalSupply); i++) {
            try {
              const owner = await contract.ownerOf(i);
              if (owner.toLowerCase() === address.toLowerCase()) {
                const tier = await contract.getTokenRarity(i);
                const tierIndex = Number(tier);
                const tierName = tierIndex === 0 ? "common" : tierIndex === 1 ? "rare" : "legendary";
                const images = NFT_IMAGES[tierName];
                const imageIndex = i % images.length;
                
                userNfts.push({
                  tokenId: i.toString(),
                  tier: tierIndex,
                  name: `NFT #${i}`,
                  image: images[imageIndex],
                  value: RARITY_VALUES[tierIndex as keyof typeof RARITY_VALUES]
                });
              }
            } catch (err) {
              console.error(`Error fetching token ${i}:`, err);
            }
          }
          
          setNfts(userNfts);
        }
      } catch (err) {
        console.error("Failed to load collection:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [contract, isConnected, address, chainId]);

  const filteredNfts = filter === -1 
    ? nfts 
    : nfts.filter(nft => nft.tier === filter);

  return (
    <div className="min-h-screen bg-[#050a0d] text-white font-sans">
      {/* Navigation Bar - Responsive */}
      <nav className="fixed top-4 sm:top-6 lg:top-8 left-4 right-4 sm:left-[5%] sm:right-[5%] lg:left-[5.56%] lg:right-[5.56%] max-w-[1280px] mx-auto z-50">
        <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] border-b rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between">
          <img src="/logo.png" alt="FLUXX NFT" className="h-6 sm:h-7 lg:h-8 w-auto" />
          <div className="hidden sm:flex items-center gap-4 lg:gap-8">
            <a href="/" className="text-[#c6c9ae] text-xs sm:text-sm hover:text-white transition">Home</a>
            <a href="/collection" className="text-[#d2f032] text-xs sm:text-sm border-b-2 border-[#d2f032] pb-1">Collection</a>
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
              <MobileMenu currentPage="collection" />
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
      <main className="pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-8 lg:px-12 xl:px-20 max-w-[1440px] mx-auto relative min-h-screen">
        {/* Background Effects - Hidden on mobile */}
        <div className="hidden lg:block absolute left-[20%] xl:left-[360px] top-[10%] xl:top-[225px] w-[200px] xl:w-[384px] h-[200px] xl:h-[384px] bg-[#d2f032] blur-[50px] rounded-full opacity-20 mix-blend-screen"></div>
        <div className="hidden lg:block absolute right-[20%] xl:right-[360px] bottom-[10%] xl:bottom-[225px] w-[200px] xl:w-[384px] h-[200px] xl:h-[384px] bg-[#caebc9] blur-[50px] rounded-full opacity-10 mix-blend-screen"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <img src="/logo.png" alt="FLUXX" className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 w-auto" />
            <h1 className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-tight tracking-[-1.5px] sm:tracking-[-2px] lg:tracking-[-2.88px]">
              <span className="text-[#c3f400]">YOUR COLLECTION</span>
            </h1>
          </div>

          {/* Filter Buttons - Responsive */}
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

          {loading ? (
            <div className="text-center text-[#c4c9ac] py-20">Loading collection...</div>
          ) : !isConnected ? (
            <div className="text-center py-20">
              <p className="text-[#c4c9ac] text-lg mb-4">Connect your wallet to view your collection</p>
              <button
                onClick={() => connect({ connector: metaMask() })}
                className="bg-[#d2f032] px-8 py-4 rounded-full text-[#2c3400] font-bold text-lg hover:opacity-90 transition"
              >
                Connect Wallet
              </button>
            </div>
          ) : filteredNfts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#c4c9ac] text-lg">No NFTs found in your collection</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredNfts.map((nft) => (
                <div
                  key={nft.tokenId}
                  className="bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-lg overflow-hidden hover:border-[rgba(195,244,0,0.5)] transition"
                >
                  <div className="aspect-square relative">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[rgba(18,18,18,0.8)] border border-[rgba(255,255,255,0.1)] rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                      <span className="text-[#d2f032] text-[10px] sm:text-xs font-bold tracking-[1.2px]">
                        {RARITY_CONFIG[nft.tier === 0 ? "common" : nft.tier === 1 ? "rare" : "legendary"].name.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6">
                    <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-2">{nft.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-[#c4c9ac] text-xs sm:text-sm">ID: {nft.tokenId}</span>
                      <span className="text-[#d2f032] font-bold text-sm sm:text-base">{nft.value} ETH</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer - Responsive */}
      <footer className="bg-[#1d2224] border-t border-[rgba(68,73,51,0.2)] py-8 sm:py-10 lg:py-12 px-4 sm:px-8 lg:px-12 xl:px-24 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-[1440px] mx-auto flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-[#c4c9ac] text-xs sm:text-sm">
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Discord</a>
          <a href="#" className="hover:text-white transition">Twitter</a>
        </div>
      </footer>
    </div>
  );
}
