"use client";

import { useState, useEffect } from "react";
import { IoClose, IoCopy } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";
import Image from "next/image";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getOrCreateWalletUserId } from "@/lib/userId";
import { toast } from "sonner";
import { getNodeInfo } from "@/lib/breezClient";
import QRCode from "qrcode";

type ReceivePaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ReceivePaymentModal({
  isOpen,
  onClose,
}: ReceivePaymentModalProps) {
  const { sdk, status } = useEmbeddedWallet();
  const [amount, setAmount] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [invoice, setInvoice] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const userId = getOrCreateWalletUserId();
  
  const userProfile = useQuery(
    api.users.getProfile,
    status === "ready" && userId ? { userId } : "skip"
  );

  const handleGenerateInvoice = async () => {
    if (!sdk) {
      toast.error("Wallet not ready");
      return;
    }

    const amountSats = parseInt(amount);
    if (!amountSats || amountSats < 1) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsGenerating(true);

    try {
      // Generate invoice using Breez SDK
      const result = await sdk.receivePayment({
        paymentMethod: {
          type: "bolt11Invoice",
          description: `Payment request for ${amountSats} sats`,
          amountSats: amountSats,
        },
      }) as any;
      
      const bolt11 = result.invoice || result.bolt11 || result.paymentRequest || "";
      
      if (bolt11) {
        setInvoice(bolt11);
        
        // Generate QR code
        const qrUrl = await QRCode.toDataURL(bolt11, { 
          width: 300, 
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        });
        setQrCodeUrl(qrUrl);
        
        toast.success("Invoice generated!");
      } else {
        toast.error("Failed to generate invoice");
        console.error("Invoice object:", result);
      }
    } catch (err: any) {
      console.error("Invoice generation error:", err);
      toast.error(err.message || "Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!invoice) return;
    
    try {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      toast.success("Invoice copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleReset = () => {
    setAmount("");
    setInvoice("");
    setQrCodeUrl("");
    setCopied(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center sm:px-4 bg-[#0B0B10] sm:bg-black/70 sm:backdrop-blur-md">
      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-[#0B0B10] px-6 py-8 sm:px-8 sm:py-10 text-white sm:rounded-4xl sm:shadow-[0_35px_60px_rgba(0,0,0,0.35)] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#1B1B21] text-white/80 transition hover:bg-white/20 z-10"
        >
          <IoClose className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6 h-24 w-24 sm:h-32 sm:w-32">
            <Image
              src="/images/3d-glossy-shape%202.svg"
              alt="Receive"
              fill
              className="object-contain"
            />
          </div>
          
          <h2 className="mb-2 text-2xl sm:text-3xl font-semibold">
            Receive Payment
          </h2>
          <p className="mb-6 sm:mb-8 text-sm text-white/60">
            Generate an invoice to receive sats
          </p>

          {!invoice ? (
            <div className="w-full space-y-4">
              <div>
                <label className="block text-left text-sm font-medium text-white/70 mb-2">
                  Amount (sats)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to receive"
                  className="w-full bg-[#1A1A1F] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500"
                  min="1"
                />
              </div>

              <button
                onClick={handleGenerateInvoice}
                disabled={isGenerating || !amount || status !== "ready"}
                className="w-full rounded-full bg-white py-3.5 text-base font-bold text-black transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  "Generate Invoice"
                )}
              </button>
            </div>
          ) : (
            <div className="w-full space-y-4 sm:space-y-6">
              {/* QR Code Display */}
              <div className="bg-[#1A1A1F] rounded-2xl p-4 sm:p-6 border border-white/10">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="bg-white rounded-2xl p-3 sm:p-4">
                    <img
                      src={qrCodeUrl}
                      alt="Payment QR Code"
                      className="w-48 h-48 sm:w-64 sm:h-64"
                    />
                  </div>
                </div>
                
                <p className="text-sm text-white/60 mb-3">
                  Scan this QR code or copy the invoice below
                </p>

                {/* Invoice String */}
                <div className="bg-black/30 rounded-xl p-3 mb-3">
                  <p className="text-xs font-mono text-white/70 break-all line-clamp-3">
                    {invoice}
                  </p>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-sm font-semibold"
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <IoCopy className="w-4 h-4" />
                      Copy Invoice
                    </>
                  )}
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-[#1A1A1F] rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Amount:</span>
                  <span className="text-2xl font-bold text-orange-500">{amount} sats</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 py-3.5 text-base font-semibold transition"
                >
                  New Invoice
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full bg-white py-3.5 text-base font-bold text-black transition hover:bg-gray-200"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
