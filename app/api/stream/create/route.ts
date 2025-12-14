import { NextRequest, NextResponse } from "next/server";
import { createLiveStream } from "@/lib/mux";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Encryption helpers (same as wallets.ts)
const textEncoder = new TextEncoder();
const IV_LENGTH = 12;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary);
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = process.env.CONVEX_EMBEDDED_WALLET_KEY!;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(secret)
  );
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encryptSecret(plainText: string) {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, description, tags, category, thumbnailStorageId } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create stream in Convex first
    const streamId = await convex.mutation(api.streams.createStream, {
      hostUserId: userId,
      title,
      description,
      tags: tags || [],
      category: category || "Live",
      thumbnailStorageId,
    });

    // Create Mux live stream
    const muxStream = await createLiveStream({
      reconnectWindow: 60,
      reducedLatency: true,
    });

    // Encrypt the stream key before storing
    const encryptedStreamKey = await encryptSecret(muxStream.streamKey);

    // Update Convex stream with Mux details
    await convex.mutation(api.streams.updateStreamMux, {
      streamId,
      muxStreamId: muxStream.streamId,
      muxPlaybackId: muxStream.playbackId,
      muxStreamKey: encryptedStreamKey,
    });

    return NextResponse.json({
      success: true,
      streamId,
      muxStreamId: muxStream.streamId,
      muxPlaybackId: muxStream.playbackId,
      // Note: We don't return the stream key to the client for security
      // The client will need to request it separately if needed
    });
  } catch (error) {
    console.error("Error creating stream:", error);
    return NextResponse.json(
      { error: "Failed to create stream" },
      { status: 500 }
    );
  }
}
