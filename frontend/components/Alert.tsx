"use client";

import { useEffect, useState } from "react";

interface AlertProps {
  message: string;
  type?: "error" | "success" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Alert({ message, type = "error", duration = 5000, onClose }: AlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getAlertStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "bg-[#2a2f32]",
          border: "border-red-500/50",
          icon: "🔴",
          text: "text-red-400"
        };
      case "success":
        return {
          bg: "bg-[#2a2f32]",
          border: "border-green-500/50",
          icon: "✅",
          text: "text-green-400"
        };
      case "warning":
        return {
          bg: "bg-[#2a2f32]",
          border: "border-yellow-500/50",
          icon: "⚠️",
          text: "text-yellow-400"
        };
      case "info":
        return {
          bg: "bg-[#2a2f32]",
          border: "border-blue-500/50",
          icon: "ℹ️",
          text: "text-blue-400"
        };
      default:
        return {
          bg: "bg-[#2a2f32]",
          border: "border-red-500/50",
          icon: "🔴",
          text: "text-red-400"
        };
    }
  };

  const styles = getAlertStyles();

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div
        className={`${styles.bg} ${styles.border} border rounded-lg shadow-xl px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-md backdrop-blur-sm`}
      >
        <span className="text-lg">{styles.icon}</span>
        <p className={`text-sm ${styles.text} flex-1`}>{message}</p>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
