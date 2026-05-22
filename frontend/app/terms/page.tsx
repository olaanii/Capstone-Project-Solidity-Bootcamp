"use client";

import { useState, useEffect } from "react";
import { MobileMenu } from "@/components/MobileMenu";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

export default function TermsPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050a0d] text-white font-sans">
      {/* Navigation Bar */}
      <nav className="fixed top-4 sm:top-6 lg:top-8 left-4 right-4 sm:left-[5%] sm:right-[5%] lg:left-[5.56%] lg:right-[5.56%] max-w-[1280px] mx-auto z-50">
        <div className="backdrop-blur-md bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] border-b rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between">
          <img src="/logo.png" alt="FLUXX NFT" className="h-6 sm:h-7 lg:h-8 w-auto" />
          <div className="hidden sm:flex items-center gap-4 lg:gap-8">
            <a href="/" className="text-[#c6c9ae] text-[32px] hover:text-white transition">Home</a>
            <a href="/collection" className="text-[#c6c9ae] text-[32px] hover:text-white transition">Collection</a>
            <a href="/marketplace" className="text-[#c6c9ae] text-[32px] hover:text-white transition">Marketplace</a>
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
      </nav>

      {/* Main Content */}
      <main className="pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-8 lg:px-12 xl:px-20 max-w-[1440px] mx-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12">
            <span className="text-[#c3f400]">Terms of Service</span>
          </h1>
          
          <div className="bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-2xl p-6 sm:p-8 lg:p-12">
            <p className="text-[#c4c9ac] text-sm mb-8">
              <strong>Last Updated:</strong> May 22, 2026
            </p>

            <div className="space-y-8 text-[#c4c9ac]">
              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  By accessing or using the FLUXX NFT platform (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4">
                  FLUXX is a decentralized NFT minting and marketplace platform built on the Ethereum blockchain. The Platform allows users to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>Mint NFTs with tiered rarity systems</li>
                  <li>List NFTs for sale on the marketplace</li>
                  <li>Purchase NFTs from other users</li>
                  <li>Manage their NFT collections</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">3. User Responsibilities</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">3.1 Wallet Security</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>You are solely responsible for the security of your cryptocurrency wallet</li>
                  <li>You must protect your private keys and seed phrases</li>
                  <li>FLUXX is not responsible for lost funds due to compromised wallets</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">3.2 Transaction Responsibility</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>All blockchain transactions are irreversible</li>
                  <li>You are responsible for verifying transaction details before confirming</li>
                  <li>Gas fees are determined by the Ethereum network and are not controlled by FLUXX</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">3.3 Compliance</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>You must comply with all applicable laws and regulations</li>
                  <li>You agree not to use the Platform for illegal activities</li>
                  <li>You must be of legal age to use the Platform in your jurisdiction</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">4. NFT Ownership</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">4.1 Ownership Rights</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>When you mint an NFT, you own the token on the blockchain</li>
                  <li>Ownership is recorded on the Ethereum blockchain and is immutable</li>
                  <li>FLUXX does not hold custody of your NFTs</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">4.2 License Grant</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>Minting an NFT grants you a license to use the associated artwork</li>
                  <li>You may display the NFT in your digital wallet or marketplace</li>
                  <li>Commercial rights are limited unless explicitly stated</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">4.3 No Warranty</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>NFTs are provided "as is" without warranties</li>
                  <li>FLUXX makes no guarantees about future value</li>
                  <li>NFTs may lose value or become worthless</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">5. Marketplace Terms</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">5.1 Listings</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>You may list your NFTs for sale at prices you determine</li>
                  <li>Listings can be modified or cancelled at any time</li>
                  <li>FLUXX does not guarantee sale of listed NFTs</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">5.2 Purchases</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>All purchases are final and irreversible</li>
                  <li>Buyers must verify NFT authenticity before purchasing</li>
                  <li>FLUXX is not responsible for disputes between buyers and sellers</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">5.3 Fees</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>Platform fees may apply to marketplace transactions</li>
                  <li>Fees are disclosed before transaction confirmation</li>
                  <li>FLUXX reserves the right to modify fee structures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">6. Intellectual Property</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">6.1 Platform Content</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>All Platform content, including code, design, and branding, is owned by FLUXX</li>
                  <li>You may not reproduce, modify, or distribute Platform content without permission</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">6.2 User Content</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>You retain ownership of content you create</li>
                  <li>By using the Platform, you grant FLUXX a license to display your NFTs</li>
                  <li>You represent that you have the right to mint any NFT you create</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">7. Prohibited Activities</h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>Use the Platform for fraudulent purposes</li>
                  <li>Attempt to hack or compromise the Platform</li>
                  <li>Reverse engineer Platform code</li>
                  <li>Create bots or automated scripts</li>
                  <li>Violate intellectual property rights</li>
                  <li>Engage in market manipulation</li>
                  <li>Use the Platform to launder money</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">8. Smart Contract Risks</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">8.1 Smart Contract Vulnerabilities</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>Smart contracts may contain bugs or vulnerabilities</li>
                  <li>FLUXX is not liable for losses due to smart contract failures</li>
                  <li>Users acknowledge the inherent risks of blockchain technology</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">8.2 Network Risks</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>Ethereum network congestion may affect transaction times</li>
                  <li>Network failures may prevent transactions from completing</li>
                  <li>FLUXX is not responsible for network issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">9.1 Disclaimer</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>The Platform is provided "as is" without warranties</li>
                  <li>FLUXX disclaims all warranties, express or implied</li>
                  <li>FLUXX is not liable for any indirect, incidental, or consequential damages</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">9.2 Maximum Liability</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>FLUXX's total liability is limited to the amount you paid in fees</li>
                  <li>FLUXX is not liable for lost NFTs, cryptocurrency, or other assets</li>
                  <li>In no event shall FLUXX be liable for more than $100 USD</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">10. Indemnification</h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4">You agree to indemnify and hold harmless FLUXX from:</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>Any claims arising from your use of the Platform</li>
                  <li>Violations of these Terms by you</li>
                  <li>Violations of applicable laws by you</li>
                  <li>Disputes with other users</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">11. Termination</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">11.1 By User</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>You may stop using the Platform at any time</li>
                  <li>Your NFTs remain in your wallet regardless of Platform usage</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">11.2 By FLUXX</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>FLUXX may suspend or terminate access for Terms violations</li>
                  <li>FLUXX may modify or discontinue the Platform at any time</li>
                  <li>FLUXX is not liable for termination</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">12. Modifications to Terms</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  FLUXX reserves the right to modify these Terms at any time. Continued use of the Platform after modifications constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">13. Governing Law</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  These Terms are governed by the laws of the jurisdiction where FLUXX is registered. Any disputes shall be resolved in the courts of that jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">14. Dispute Resolution</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">14.1 Arbitration</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li>Disputes shall be resolved through binding arbitration</li>
                  <li>Arbitration shall be conducted by a neutral third party</li>
                  <li>You waive your right to a trial by jury</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">14.2 Class Action Waiver</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>You agree to resolve disputes individually</li>
                  <li>You waive any right to participate in class actions</li>
                  <li>Class arbitrations are not permitted</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">15. Severability</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">16. Entire Agreement</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  These Terms constitute the entire agreement between you and FLUXX regarding the Platform. They supersede all prior agreements and understandings.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">17. Contact Information</h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4">For questions about these Terms, contact:</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>Email: legal@fluxx-nft.com</li>
                  <li>Discord: [Community Server]</li>
                  <li>Twitter: @FLUXX_NFT</li>
                </ul>
              </section>

              <div className="mt-12 pt-8 border-t border-[rgba(68,73,51,0.3)]">
                <p className="text-sm sm:text-base text-[#c4c9ac] italic">
                  By using the FLUXX NFT Platform, you acknowledge that you have read, understood, and agree to these Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
