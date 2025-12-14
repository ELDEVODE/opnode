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
  error?: string;
};

const EmbeddedWalletContext = createContext<
  EmbeddedWalletContextValue | undefined
>(undefined);

class EmbeddedSdkEventListener {
  onEvent(event: unknown) {
    console.debug("[Breez SDK Event]", event);
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
        listenerIdRef.current = await sdk.addEventListener(
          new EmbeddedSdkEventListener()
        );
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

  const value = useMemo<EmbeddedWalletContextValue>(
    () => ({
      status,
      walletId,
      publicKey,
      sdk: sdkRef.current,
      connectNewWallet,
      resumeWallet,
      disconnect,
      error,
    }),
    [
      connectNewWallet,
      disconnect,
      error,
      publicKey,
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
