"use client";

import { useState } from "react";
import { useDisconnect } from "wagmi";

interface MobileMenuProps {
  currentPage: "home" | "collection" | "marketplace";
}

export function MobileMenu({ currentPage }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  return (
    <div className="sm:hidden relative">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center gap-1.5 w-8 h-8"
        aria-label="Toggle menu"
      >
        <div className={`w-5 h-0.5 bg-[#d2f032] transition-all duration-300 ${isOpen ? "rotate-45 translate-y-1.5" : ""}`}></div>
        <div className={`w-5 h-0.5 bg-[#d2f032] transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></div>
        <div className={`w-5 h-0.5 bg-[#d2f032] transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#1d2224] border border-[rgba(68,73,51,0.2)] rounded-lg shadow-xl overflow-hidden z-50">
          <a
            href="/"
            onClick={() => setIsOpen(false)}
            className={`block px-4 py-3 text-sm transition-colors ${
              currentPage === "home" ? "text-[#d2f032] bg-[rgba(210,240,50,0.1)]" : "text-[#c6c9ae] hover:text-white"
            }`}
          >
            Minting
          </a>
          <a
            href="/collection"
            onClick={() => setIsOpen(false)}
            className={`block px-4 py-3 text-sm transition-colors ${
              currentPage === "collection" ? "text-[#d2f032] bg-[rgba(210,240,50,0.1)]" : "text-[#c6c9ae] hover:text-white"
            }`}
          >
            Collection
          </a>
          <a
            href="/marketplace"
            onClick={() => setIsOpen(false)}
            className={`block px-4 py-3 text-sm transition-colors ${
              currentPage === "marketplace" ? "text-[#d2f032] bg-[rgba(210,240,50,0.1)]" : "text-[#c6c9ae] hover:text-white"
            }`}
          >
            Marketplace
          </a>
          <div className="border-t border-[rgba(68,73,51,0.2)]">
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-3 text-sm text-[#d2f032] hover:bg-[rgba(210,240,50,0.1)] transition-colors text-left"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
