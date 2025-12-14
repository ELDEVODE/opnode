import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ENCRYPTION_KEY_SOURCE = process.env.CONVEX_EMBEDDED_WALLET_KEY ?? null;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const IV_LENGTH = 12;

type CiphertextPayload = {
  iv: string;
  ciphertext: string;
};

let encryptionKeyPromise: Promise<CryptoKey> | null = null;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function getSecret(): string {
  if (!ENCRYPTION_KEY_SOURCE) {
    throw new Error(
      "CONVEX_EMBEDDED_WALLET_KEY env var is required for wallet encryption"
    );
  }
  return ENCRYPTION_KEY_SOURCE;
}

function getEncryptionKey(): Promise<CryptoKey> {
  if (!encryptionKeyPromise) {
    encryptionKeyPromise = (async () => {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        textEncoder.encode(getSecret())
      );
      return crypto.subtle.importKey("raw", digest, "AES-GCM", false, [
        "encrypt",
        "decrypt",
      ]);
    })();
  }
  return encryptionKeyPromise;
}

async function encryptSecret(plainText: string): Promise<CiphertextPayload> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(plainText)
  );

  return {
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ciphertext),
  };
}

async function decryptSecret(payload: CiphertextPayload): Promise<string> {
  const key = await getEncryptionKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(base64ToArrayBuffer(payload.iv)) },
    key,
    base64ToArrayBuffer(payload.ciphertext)
  );
  return textDecoder.decode(decrypted);
}

export const upsertProfile = mutation({
  args: {
    userId: v.string(),
    walletId: v.string(),
    publicKey: v.string(),
    network: v.string(),
    mnemonic: v.string(),
  },
  handler: async (ctx, args) => {
    const encryptedMnemonic = await encryptSecret(args.mnemonic);
    const existing = await ctx.db
      .query("walletProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const timestamps = { updatedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, {
        walletId: args.walletId,
        publicKey: args.publicKey,
        network: args.network,
        encryptedMnemonic,
        ...timestamps,
      });
      return existing._id;
    }

    return await ctx.db.insert("walletProfiles", {
      userId: args.userId,
      walletId: args.walletId,
      publicKey: args.publicKey,
      network: args.network,
      encryptedMnemonic,
      createdAt: Date.now(),
      ...timestamps,
    });
  },
});

export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("walletProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existing) {
      return null;
    }

    const mnemonic = await decryptSecret(existing.encryptedMnemonic);

    return {
      walletId: existing.walletId,
      publicKey: existing.publicKey,
      mnemonic,
      network: existing.network,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    };
  },
});
