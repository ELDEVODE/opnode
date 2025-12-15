"use client";

import { useState, useEffect } from "react";
import { IoClose, IoCopy } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";
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
  const [nodeId, setNodeId] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const userId = getOrCreateWalletUserId();
  
  const userProfile = useQuery(
    api.users.getProfile,
    status === "ready" && userId ? { userId } : "skip"
  );
  
  const walletProfile = useQuery(
    api.wallets.getProfile,
    status === "ready" && userId ? { userId } : "skip"
  );

  useEffect(() => {
    if (walletProfile && status === "ready" && isOpen) {
      setIsLoading(true);
      setError("");
      
      console.log("Wallet profile:", walletProfile);
      
      // Use wallet ID as node identifier
      // Note: This is a simplified identifier. For production with real Lightning network,
      // you'd want to derive the actual node public key from the Breez SDK
      const id = walletProfile.walletId || walletProfile.publicKey || "";
      console.log("Using wallet ID:", id);
      
      if (id) {
        setNodeId(id);
        // Generate QR code
        QRCode.toDataURL(id, { width: 300, margin: 2 })
          .then(setQrCodeUrl)
          .catch((err: any) => {
            console.error("QR code generation error:", err);
          });
        setIsLoading(false);
      } else {
        console.warn("No wallet ID found");
        setError("Wallet not fully initialized. Please reconnect.");
        setIsLoading(false);
      }
    } else if (status === "ready" && isOpen && !walletProfile) {
      setIsLoading(true);
    }
  }, [walletProfile, status, isOpen]);


  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  if (!isOpen) return null;

  const lightningAddress = userProfile?.lightningAddress || "Not set up yet";
  const hasLightningAddress = !!userProfile?.lightningAddress;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div
        className="relative w-full max-w-md bg-[#0B0B10] rounded-3xl p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#1B1B21] hover:bg-white/20 transition"
        >
          <IoClose className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Receive Payment</h2>

        <div className="space-y-6">
          {/* Generate Invoice Section */}
          <div className="bg-[#1A1A1F] rounded-2xl p-4 border border-white/10">
            <p className="text-sm font-semibold text-white/70 mb-3">
              💳 Generate Invoice
            </p>
            <p className="text-xs text-white/50 mb-3">
              Create a BOLT11 invoice for a specific amount
            </p>
            
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount in sats"
                className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                id="invoice-amount"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('invoice-amount') as HTMLInputElement;
                  const amount = parseInt(input.value);
                  
                  if (!amount || amount < 1) {
                    toast.error("Please enter a valid amount");
                    return;
                  }
                  
                  if (!sdk) {
                    toast.error("Wallet not ready");
                    return;
                  }
                  
                  // Get button element to show loading
                  const button = document.querySelector('#generate-invoice-btn') as HTMLButtonElement;
                  const originalText = button?.textContent;
                  
                  try {
                    // Show loading state
                    if (button) {
                      button.disabled = true;
                      button.innerHTML = `
                        <div class="flex items-center gap-2">
                          <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Generating...</span>
                        </div>
                      `;
                    }
                    
                    // Generate invoice using Breez SDK
                    // For Spark, use bolt11Invoice payment method
                    const invoice = await sdk.receivePayment({
                      paymentMethod: {
                        type: "bolt11Invoice",
                        description: `Payment request for ${amount} sats`,
                        amountSats: amount, // number, not BigInt
                      },
                    }) as any;
                    
                    const bolt11 = invoice.invoice || invoice.bolt11 || invoice.paymentRequest || "";
                    
                    if (bolt11) {
                      await navigator.clipboard.writeText(bolt11);
                      toast.success("Invoice copied to clipboard!");
                      console.log("Generated invoice:", bolt11);
                    } else {
                      toast.error("Failed to generate invoice");
                      console.error("Invoice object:", invoice);
                    }
                  } catch (err: any) {
                    console.error("Invoice generation error:", err);
                    toast.error(err.message || "Failed to generate invoice");
                  } finally {
                    // Restore button
                    if (button) {
                      button.disabled = false;
                      button.textContent = originalText || "Generate & Copy";
                    }
                  }
                }}
                id="generate-invoice-btn"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate & Copy
              </button>
            </div>
            
            <p className="mt-2 text-xs text-white/40">
              Share the generated invoice with the sender
            </p>
          </div>

          {/* Node ID for direct payments */}
          <div className="bg-[#1A1A1F] rounded-2xl p-4 border border-white/10">
            <p className="text-sm font-semibold text-white/70 mb-2">
              ℹ️ Wallet ID (For Reference Only)
            </p>
            <p className="text-xs text-white/40 mb-3">
              This is NOT a payment address. Use "Generate Invoice" above to receive payments.
            </p>
          </div>

          {/* Node ID section - kept for technical reference */}

          {nodeId && (
            <div className="bg-[#1A1A1F] rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white/70">Node ID</p>
                <button
                  onClick={() => handleCopy(nodeId, "Node ID")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition text-xs font-medium"
                >
                  <IoCopy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
              
              {qrCodeUrl && (
                <div className="flex justify-center mb-3">
                  <img
                    src={qrCodeUrl}
                    alt="Node ID QR Code"
                    className="w-48 h-48 rounded-xl"
                  />
                </div>
              )}
              
              <div className="bg-black/30 rounded-xl p-3">
                <p className="text-xs font-mono text-white/70 break-all">
                  {nodeId}
                </p>
              </div>
            </div>
          )}

          {!nodeId && isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
              <p className="text-sm text-white/60">Loading payment info...</p>
            </div>
          )}
          
          {!nodeId && error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
              >
                Reload Page
              </button>
            </div>
          )}

        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-full bg-white/10 hover:bg-white/20 py-3 text-base font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
