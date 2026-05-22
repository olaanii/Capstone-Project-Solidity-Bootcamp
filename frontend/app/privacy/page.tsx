"use client";

import { useState, useEffect } from "react";
import { MobileMenu } from "@/components/MobileMenu";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

export default function PrivacyPage() {
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
            <span className="text-[#c3f400]">Privacy Policy</span>
          </h1>
          
          <div className="bg-[rgba(32,31,32,0.7)] border border-[rgba(68,73,51,0.3)] rounded-2xl p-6 sm:p-8 lg:p-12">
            <p className="text-[#c4c9ac] text-sm mb-8">
              <strong>Last Updated:</strong> May 22, 2026
            </p>

            <div className="space-y-8 text-[#c4c9ac]">
              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  FLUXX ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use the FLUXX NFT platform.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">2. Information We Collect</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">2.1 Wallet Information</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Public Wallet Address:</strong> Collected when you connect your wallet</li>
                  <li><strong>Transaction History:</strong> Recorded on the blockchain and publicly accessible</li>
                  <li><strong>Network Information:</strong> Ethereum network and chain ID</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">2.2 Account Information</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Email Address:</strong> Collected if you create an account through our authentication provider</li>
                  <li><strong>Profile Information:</strong> Optional display name and avatar</li>
                  <li><strong>Authentication Tokens:</strong> Session tokens for secure access</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">2.3 Usage Data</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Page Views:</strong> Which pages you visit on the Platform</li>
                  <li><strong>Click Data:</strong> Links and buttons you interact with</li>
                  <li><strong>Session Duration:</strong> How long you use the Platform</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, screen resolution</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">2.4 Technical Data</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>IP Address:</strong> Collected for security and analytics purposes</li>
                  <li><strong>Browser Fingerprint:</strong> Used to prevent fraud and abuse</li>
                  <li><strong>Cookies and Local Storage:</strong> Used for session management and preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">3.1 Platform Functionality</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Wallet Connection:</strong> To enable NFT minting and trading</li>
                  <li><strong>Transaction Processing:</strong> To execute blockchain transactions</li>
                  <li><strong>Authentication:</strong> To secure your account and prevent unauthorized access</li>
                  <li><strong>User Experience:</strong> To personalize your experience and remember preferences</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">3.2 Security and Fraud Prevention</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Risk Assessment:</strong> To detect and prevent fraudulent activity</li>
                  <li><strong>Account Protection:</strong> To secure your account from unauthorized access</li>
                  <li><strong>Compliance:</strong> To comply with applicable laws and regulations</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">3.3 Analytics and Improvement</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Platform Analytics:</strong> To understand how users interact with the Platform</li>
                  <li><strong>Performance Monitoring:</strong> To improve Platform speed and reliability</li>
                  <li><strong>Feature Development:</strong> To develop new features and improve existing ones</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">3.4 Communications</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>Service Updates:</strong> To send important updates about the Platform</li>
                  <li><strong>Security Alerts:</strong> To notify you of security issues</li>
                  <li><strong>Marketing Communications:</strong> Only with your explicit consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">4.1 Blockchain Data</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Public Blockchain:</strong> All transactions are recorded on the Ethereum blockchain and are publicly accessible</li>
                  <li><strong>Wallet Addresses:</strong> Your wallet address is visible to other users for transactions</li>
                  <li><strong>NFT Ownership:</strong> NFT ownership is publicly verifiable on the blockchain</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">4.2 Third-Party Services</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Authentication Providers:</strong> We use Clerk for authentication (see their privacy policy)</li>
                  <li><strong>Blockchain Infrastructure:</strong> We use Infura for blockchain connectivity</li>
                  <li><strong>Analytics Services:</strong> We may use analytics services to improve the Platform</li>
                  <li><strong>Payment Processors:</strong> We may use payment processors for fiat transactions</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">4.3 Legal Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Law Enforcement:</strong> We may disclose information if required by law</li>
                  <li><strong>Court Orders:</strong> We may disclose information in response to court orders</li>
                  <li><strong>Regulatory Requirements:</strong> We may disclose information to comply with regulations</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">4.4 Business Transfers</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>Mergers and Acquisitions:</strong> If we are acquired, your data may be transferred</li>
                  <li><strong>Asset Sales:</strong> If we sell assets, your data may be included</li>
                  <li><strong>Bankruptcy:</strong> In bankruptcy proceedings, your data may be transferred</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">5. Data Security</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">5.1 Security Measures</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                  <li><strong>Access Controls:</strong> Strict access controls limit who can access your data</li>
                  <li><strong>Regular Audits:</strong> We conduct regular security audits</li>
                  <li><strong>Bug Bounty Program:</strong> We offer rewards for reporting security vulnerabilities</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">5.2 Blockchain Security</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Smart Contract Audits:</strong> Our smart contracts are audited by third parties</li>
                  <li><strong>Reentrancy Protection:</strong> Smart contracts include reentrancy guards</li>
                  <li><strong>Input Validation:</strong> All inputs are validated before processing</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">5.3 Your Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>Wallet Security:</strong> You are responsible for securing your wallet</li>
                  <li><strong>Private Keys:</strong> Never share your private keys with anyone</li>
                  <li><strong>Phishing:</strong> Be aware of phishing attempts impersonating FLUXX</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">6. Data Retention</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">6.1 Account Data</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Active Accounts:</strong> Retained while your account is active</li>
                  <li><strong>Inactive Accounts:</strong> May be deleted after 2 years of inactivity</li>
                  <li><strong>Deleted Accounts:</strong> Data is deleted within 30 days of account deletion</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">6.2 Transaction Data</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Blockchain Data:</strong> Permanently recorded on the blockchain (cannot be deleted)</li>
                  <li><strong>Platform Records:</strong> Retained for 7 years for compliance purposes</li>
                  <li><strong>Analytics Data:</strong> Aggregated and anonymized after 90 days</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">6.3 Cookies and Local Storage</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Retained for 1 year unless you delete them</li>
                  <li><strong>Local Storage:</strong> Retained until you clear your browser data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">7. Your Privacy Rights</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">7.1 Access Rights</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
                  <li><strong>Right to Correction:</strong> You can request correction of inaccurate data</li>
                  <li><strong>Right to Deletion:</strong> You can request deletion of your personal data</li>
                  <li><strong>Right to Portability:</strong> You can request your data in a machine-readable format</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">7.2 Control Rights</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time</li>
                  <li><strong>Right to Opt-Out:</strong> You can opt-out of marketing communications</li>
                  <li><strong>Right to Object:</strong> You can object to certain data processing activities</li>
                  <li><strong>Right to Restrict:</strong> You can request restriction of data processing</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">7.3 Exercise Your Rights</h3>
                <p className="text-sm sm:text-base leading-relaxed mb-4">To exercise your rights, contact us at:</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>Email: privacy@fluxx-nft.com</li>
                  <li>Discord: [Community Server]</li>
                  <li>Twitter: @FLUXX_NFT</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">8. Children's Privacy</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  The Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">9. International Data Transfers</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">10. Changes to This Privacy Policy</h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4">We may update this Privacy Policy from time to time. We will notify you of significant changes by:</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>Posting the new policy on the Platform</li>
                  <li>Sending an email notification (if you have provided an email)</li>
                  <li>Displaying a prominent notice on the Platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">11. California Privacy Rights</h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4">If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>Right to Know:</strong> You can request disclosure of categories of personal information collected</li>
                  <li><strong>Right to Delete:</strong> You can request deletion of your personal information</li>
                  <li><strong>Right to Opt-Out:</strong> You can opt-out of the sale of your personal information</li>
                  <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">12. GDPR Compliance</h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4">If you are located in the European Union, you have rights under the General Data Protection Regulation (GDPR):</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>Lawful Basis:</strong> We process your data based on legitimate interests and contract performance</li>
                  <li><strong>Data Protection Officer:</strong> You can contact our DPO at dpo@fluxx-nft.com</li>
                  <li><strong>Cross-Border Transfers:</strong> We use standard contractual clauses for international transfers</li>
                  <li><strong>Data Breach Notification:</strong> We will notify you within 72 hours of a data breach</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">13. Cookies and Tracking Technologies</h2>
                
                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">13.1 Types of Cookies</h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4">
                  <li><strong>Essential Cookies:</strong> Required for Platform functionality</li>
                  <li><strong>Analytics Cookies:</strong> Used to understand Platform usage</li>
                  <li><strong>Marketing Cookies:</strong> Used for personalized advertising (with consent)</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>

                <h3 className="text-[#d2f032] text-lg font-semibold mb-2">13.2 Cookie Management</h3>
                <p className="text-sm sm:text-base leading-relaxed mb-4">You can manage cookies through:</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                  <li><strong>Platform Settings:</strong> You can manage preferences in your account settings</li>
                  <li><strong>Opt-Out Links:</strong> Available in our cookie consent banner</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">14. Third-Party Links</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  The Platform may contain links to third-party websites. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">15. Contact Information</h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4">For questions about this Privacy Policy or your privacy rights, contact:</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li><strong>Email:</strong> privacy@fluxx-nft.com</li>
                  <li><strong>Discord:</strong> [Community Server]</li>
                  <li><strong>Twitter:</strong> @FLUXX_NFT</li>
                  <li><strong>Address:</strong> [Physical Address - to be added]</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">16. Effective Date</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  This Privacy Policy is effective as of May 22, 2026, and will remain in effect until replaced by a new version.
                </p>
              </section>

              <div className="mt-12 pt-8 border-t border-[rgba(68,73,51,0.3)]">
                <p className="text-sm sm:text-base text-[#c4c9ac] italic">
                  By using the FLUXX NFT Platform, you acknowledge that you have read, understood, and agree to this Privacy Policy.
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
