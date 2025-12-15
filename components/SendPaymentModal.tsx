"use client";

import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getOrCreateWalletUserId } from "@/lib/userId";
import { toast } from "sonner";
import {
  parsePaymentInput,
  prepareSendPayment,
  sendPayment,
  prepareLnurlPay,
  lnurlPay,
} from "@/lib/breezClient";

type SendPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SendPaymentModal({
  isOpen,
  onClose,
}: SendPaymentModalProps) {
  const { sdk, status } = useEmbeddedWallet();
  const [paymentInput, setPaymentInput] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [parsedInput, setParsedInput] = useState<any>(null);
  const [preparedPayment, setPreparedPayment] = useState<any>(null);
  const [fees, setFees] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState<"input" | "confirm" | "sending">("input");

  const createPendingPayment = useMutation(api.payments.createPendingPayment);
  const updatePaymentWithHash = useMutation(api.payments.updatePaymentWithHash);
  const updatePaymentStatus = useMutation(api.payments.updatePaymentStatus);

  const userId = getOrCreateWalletUserId();

  const handleParse = async () => {
    if (!sdk || !paymentInput.trim()) return;

    try {
      const parsed = await parsePaymentInput(sdk, paymentInput.trim());
      setParsedInput(parsed);

      // Handle different payment types
      if (parsed.type === "lightningAddress") {
        // LNURL-Pay - amount is required
        if (!amount) {
          toast.error("Please enter an amount for Lightning address payments");
          return;
        }
        
        const amountSats = parseInt(amount);
        const prepared = await prepareLnurlPay(
          sdk,
          amountSats,
          parsed.payRequest,
          comment || undefined
        );
        
        setPreparedPayment(prepared);
        setFees(Number(prepared.feeSats));
        setStep("confirm");
      } else if (parsed.type === "bolt11Invoice") {
        // BOLT11 invoice
        const amountBigInt = amount ? BigInt(parseInt(amount)) : undefined;
        const prepared = await prepareSendPayment(sdk, paymentInput, amountBigInt);
        
        setPreparedPayment(prepared);
        
        // Extract fees based on payment method
        if (prepared.paymentMethod.type === "bolt11Invoice") {
          const feesSats = Number(prepared.paymentMethod.lightningFeeSats ||  0);
          setFees(feesSats);
        }
        
        setStep("confirm");
      } else {
        toast.error(`Payment type ${parsed.type} is not yet supported`);
      }
    } catch (error: any) {
      console.error("Parse error:", error);
      toast.error(error.message || "Invalid payment request");
    }
  };

  const handleSend = async () => {
    if (!sdk || !preparedPayment) return;

    setIsSending(true);
    setStep("sending");

    try {
      // Create pending payment record
      const paymentId = await createPendingPayment({
        userId,
        type: "sent",
        amountSats: parseInt(amount) || 0,
        paymentRequest: paymentInput,
      });

      let result;
      
      if (parsedInput.type === "lightningAddress") {
        // Send via LNURL-Pay
        result = await lnurlPay(sdk, preparedPayment);
      } else {
        // Send via standard payment
        result = await sendPayment(sdk, preparedPayment);
      }

      // Update payment with hash
      const payment = result.payment as any; // Breez SDK payment object
      const hash = payment.id || payment.paymentHash || payment.hash;
      
      if (hash) {
        await updatePaymentWithHash({
          paymentId,
          paymentHash: hash,
        });
      }

      toast.success(`⚡ Payment sent! ${parseInt(amount)} sats`);

      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Send error:", error);
      
      // Show user-friendly error messages
      if (error.message?.toLowerCase().includes("insufficient funds")) {
        toast.error("Insufficient funds. You need at least 10 sats to send payments (includes network fees).");
      } else if (error.message?.toLowerCase().includes("invalid")) {
        toast.error("Invalid payment request. Please check and try again.");
      } else {
        toast.error(error.message || "Failed to send payment");
      }
      
      setStep("confirm");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setPaymentInput("");
    setAmount("");
    setComment("");
    setParsedInput(null);
    setPreparedPayment(null);
    setFees(null);
    setStep("input");
  };

  if (!isOpen) return null;

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

        <h2 className="text-2xl font-bold mb-6">Send Payment</h2>

        {step === "input" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Payment Request
              </label>
              <textarea
                value={paymentInput}
                onChange={(e) => setPaymentInput(e.target.value)}
                placeholder="BOLT11 invoice, Lightning address, or Bitcoin address"
                className="w-full bg-[#1A1A1F] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500 resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Amount (sats)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Optional for invoices, required for addresses"
                className="w-full bg-[#1A1A1F] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Comment (optional)
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Message for recipient"
                className="w-full bg-[#1A1A1F] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              onClick={handleParse}
              disabled={!paymentInput.trim() || status !== "ready"}
              className="w-full rounded-full bg-orange-500 py-3.5 text-base font-bold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {step === "confirm" && preparedPayment && (
          <div className="space-y-4">
            <div className="bg-[#1A1A1F] rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-white/60">Amount:</span>
                <span className="font-bold">{amount} sats</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span className="text-white/80 font-semibold">Total:</span>
                <span className="font-bold text-orange-500">
                  {parseInt(amount)} sats
                </span>
              </div>
            </div>

            {comment && (
              <div className="bg-[#1A1A1F] rounded-2xl p-4 border border-white/10">
                <p className="text-sm text-white/60">Comment:</p>
                <p className="text-white">{comment}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("input")}
                className="flex-1 rounded-full border border-white/20 py-3 text-base font-semibold transition hover:bg-white/10"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 rounded-full bg-orange-500 py-3 text-base font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send Payment"}
              </button>
            </div>
          </div>
        )}

        {step === "sending" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
            <p className="text-lg font-semibold">Sending payment...</p>
            <p className="text-sm text-white/60 mt-2">Please wait</p>
          </div>
        )}
      </div>
    </div>
  );
}
