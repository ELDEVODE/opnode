"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { buildBreezSdk, BreezSdkInstance } from "@/lib/breezClient";
import { generateWalletMnemonic } from "@/lib/mnemonic";
import { getOrCreateWalletUserId } from "@/lib/userId";

type WalletStatus = "idle" | "connecting" | "ready" | "disconnected" | "error";

const breezNetwork = process.env.NEXT_PUBLIC_BREEZ_NETWORK ?? "regtest";

type EmbeddedWalletContextValue = {
  status: WalletStatus;
  walletId?: string;
  publicKey?: string;
  sdk: BreezSdkInstance | null;
  connectNewWallet: () => Promise<void>;
  resumeWallet: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => void;
  error?: string;
};

const EmbeddedWalletContext = createContext<
  EmbeddedWalletContextValue | undefined
>(undefined);

import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

class EmbeddedSdkEventListener {
  onEvent(breezEvent: any) {
    console.log("Breez event:", breezEvent);
    
    // Show toast notification for received payments
    if (breezEvent.type === "paymentSucceeded") {
      const payment = breezEvent.details;
      
      // Check if it's an incoming payment 
      if (payment && (payment.paymentType === "received" || payment.status === "Complete")) {
        const amountSats = payment.amountSats || (payment.amountMsat ? payment.amountMsat / 1000 : 0);
        const paymentHash = payment.id || payment.paymentHash || payment.hash;
        
        // Show toast notification
        import("sonner").then(({ toast }) => {
          toast.success(`⚡ Received ${Math.floor(amountSats)} sats!`, {
            description: "Payment received successfully",
            duration: 5000,
          });
        });
        
        console.log("✅ Incoming payment:", Math.floor(amountSats), "sats");
        
        // Record payment in Convex (async, non-blocking)
        this.recordIncomingPayment(Math.floor(amountSats), paymentHash).catch(err => {
          console.error("Failed to record incoming payment:", err);
        });
      }
    }
    
    // Sync payment history when wallet syncs
    if (breezEvent.type === "synced") {
      console.log("Wallet synced, checking for payment history updates...");
      this.syncAllPayments().catch(err => {
        console.error("Failed to sync payment history:", err);
      });
    }
    
    // Log payment events for debugging (with BigInt handling)
    if (breezEvent.type?.toLowerCase().includes("payment")) {
      // Custom replacer to handle BigInt values
      const replacer = (key: string, value: any) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      };
      console.log("Payment event:", JSON.stringify(breezEvent, replacer, 2));
    }
  }
  
  async syncAllPayments() {
    try {
      const userId = localStorage.getItem("wallet_user_id");
      if (!userId) return;
      
      // This will be called when the SDK syncs
      console.log("Auto-syncing payment history from network...");
    } catch (error) {
      console.error("Error syncing payments:", error);
    }
  }

  
  async recordIncomingPayment(amountSats: number, paymentHash?: string) {
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem("wallet_user_id");
      if (!userId) {
        console.warn("No user ID found, skipping payment recording");
        return;
      }
      
      // Create Convex client
      const convex = new ConvexHttpClient(convexUrl);
      
      // Record payment in history
      await convex.mutation(api.payments.recordIncomingPayment, {
        userId,
        amountSats,
        paymentHash: paymentHash || `incoming-${Date.now()}`,
      });
      
      // Create notification for received payment
      await convex.mutation(api.users.createNotification, {
        userId,
        type: "payment_received",
        title: "Payment Received",
        message: `You received ${amountSats} sats`,
      });
      
      console.log("✅ Payment recorded in history and notification created");
    } catch (error) {
      console.error("Error recording payment:", error);
    }
  }
}

const EMPTY_ERROR = undefined;

function fallbackId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `wallet-${Date.now()}`;
}

export function useEmbeddedWallet() {
  const context = useContext(EmbeddedWalletContext);
  if (!context) {
    throw new Error(
      "useEmbeddedWallet must be used inside EmbeddedWalletProvider"
    );
  }
  return context;
}

export default function EmbeddedWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const convex = useConvex();
  const sdkRef = useRef<BreezSdkInstance | null>(null);
  const listenerIdRef = useRef<string | null>(null);

  const [status, setStatus] = useState<WalletStatus>("idle");
  const [walletId, setWalletId] = useState<string | undefined>();
  const [publicKey, setPublicKey] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>(EMPTY_ERROR);
  const [autoResumeAttempted, setAutoResumeAttempted] = useState(false);

  const ensureUserId = useCallback(() => getOrCreateWalletUserId(), []);

  const cleanupListener = useCallback(async () => {
    if (
      sdkRef.current &&
      listenerIdRef.current &&
      sdkRef.current.removeEventListener
    ) {
      try {
        await sdkRef.current.removeEventListener(listenerIdRef.current);
      } catch (listenerError) {
        console.debug("Failed to remove Breez listener", listenerError);
      }
    }
    listenerIdRef.current = null;
  }, []);

  const attachListener = useCallback(
    async (sdk: BreezSdkInstance) => {
      await cleanupListener();
      if (typeof sdk.addEventListener === "function") {
        try {
          const listenerId = await sdk.addEventListener(
            new EmbeddedSdkEventListener()
          );
          listenerIdRef.current = listenerId;
        } catch (listenerError) {
          console.error("Failed to attach Breez listener", listenerError);
        }
      }
    },
    [cleanupListener]
  );

  const disconnect = useCallback(async () => {
    setError(EMPTY_ERROR);
    await cleanupListener();
    if (sdkRef.current && typeof sdkRef.current.disconnect === "function") {
      try {
        await sdkRef.current.disconnect();
      } catch (disconnectError) {
        console.debug("Failed to disconnect Breez SDK", disconnectError);
      }
    }
    sdkRef.current = null;
    setStatus("disconnected");
    setWalletId(undefined);
    setPublicKey(undefined);
  }, [cleanupListener]);

  const hydrateSdk = useCallback(
    async (mnemonic: string) => {
      const sdk = await buildBreezSdk(mnemonic);
      sdkRef.current = sdk;
      await attachListener(sdk);
      return sdk;
    },
    [attachListener]
  );

  const connectNewWallet = useCallback(async () => {
    setStatus("connecting");
    setError(EMPTY_ERROR);
    try {
      const mnemonic = generateWalletMnemonic();
      const sdk = await hydrateSdk(mnemonic);
      const info = (await sdk.getInfo({ ensureSynced: false })) as any;
      const derivedWalletId =
        (info.nodeId as string | undefined) ??
        (info.walletId as string | undefined) ??
        fallbackId();
      const derivedPublicKey =
        (info.nodePubkey as string | undefined) ??
        (info.walletPubkey as string | undefined) ??
        derivedWalletId;

      const userId = ensureUserId();
      await convex.mutation(api.wallets.upsertProfile, {
        userId,
        walletId: derivedWalletId,
        publicKey: derivedPublicKey,
        network: breezNetwork,
        mnemonic,
      });

      setWalletId(derivedWalletId);
      setPublicKey(derivedPublicKey);
      setStatus("ready");
    } catch (connectError) {
      console.error(connectError);
      setError(
        connectError instanceof Error
          ? connectError.message
          : "Failed to create embedded wallet"
      );
      setStatus("error");
      throw connectError;
    }
  }, [convex, ensureUserId, hydrateSdk]);

  const resumeWalletInternal = useCallback(
    async (options?: { allowNoWallet?: boolean }) => {
      setStatus("connecting");
      setError(EMPTY_ERROR);
      try {
        const userId = ensureUserId();
        const profile = await convex.query(api.wallets.getProfile, { userId });

        if (!profile) {
          if (options?.allowNoWallet) {
            setStatus("disconnected");
            return;
          }
          throw new Error("No saved wallet found for this user");
        }

        await hydrateSdk(profile.mnemonic);
        setWalletId(profile.walletId);
        setPublicKey(profile.publicKey);
        setStatus("ready");
      } catch (resumeError) {
        console.error(resumeError);
        if (options?.allowNoWallet) {
          setStatus("disconnected");
          setError(EMPTY_ERROR);
          return;
        }
        setError(
          resumeError instanceof Error
            ? resumeError.message
            : "Failed to resume embedded wallet"
        );
        setStatus("error");
        throw resumeError;
      }
    },
    [convex, ensureUserId, hydrateSdk]
  );

  const resumeWallet = useCallback(
    () => resumeWalletInternal(),
    [resumeWalletInternal]
  );

  useEffect(() => {
    if (autoResumeAttempted) {
      return;
    }
    resumeWalletInternal({ allowNoWallet: true }).finally(() =>
      setAutoResumeAttempted(true)
    );
  }, [autoResumeAttempted, resumeWalletInternal]);

  useEffect(() => {
    return () => {
      disconnect().catch(() => undefined);
    };
  }, [disconnect]);

  const refreshBalance = useCallback(() => {
    // Dispatch custom event to trigger balance refresh in all components
    window.dispatchEvent(new CustomEvent('wallet-balance-refresh'));
  }, []);

  const value = useMemo<EmbeddedWalletContextValue>(
    () => ({
      status,
      walletId,
      publicKey,
      sdk: sdkRef.current,
      connectNewWallet,
      resumeWallet,
      disconnect,
      refreshBalance,
      error,
    }),
    [
      connectNewWallet,
      disconnect,
      error,
      publicKey,
      refreshBalance,
      resumeWallet,
      status,
      walletId,
    ]
  );

  return (
    <EmbeddedWalletContext.Provider value={value}>
      {children}
    </EmbeddedWalletContext.Provider>
  );
}
