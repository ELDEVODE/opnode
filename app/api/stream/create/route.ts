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
    const { userId, title, description, tags, category, thumbnailStorageId, bolt12Offer } = body;

    console.log("📥 Stream creation request received");
    console.log("  - userId:", userId);
    console.log("  - title:", title);
    console.log("  - category:", category);
    console.log("  - bolt12Offer present:", !!bolt12Offer);
    console.log("  - bolt12Offer value:", bolt12Offer || "NOT PROVIDED");

    if (!userId || !title) {
      console.error("❌ Missing required fields:", { userId: !!userId, title: !!title });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Always create a new stream (Mux deletes streams after ending, so reuse is not possible)
    console.log(`📺 Creating new stream for user ${userId}`);

    // Create stream in Convex first
    console.log("📤 Sending to Convex with bolt12Offer:", bolt12Offer || "NULL");
    const streamId = await convex.mutation(api.streams.createStream, {
      hostUserId: userId,
      title,
      description,
      tags: tags || [],
      category: category || "Live",
      thumbnailStorageId,
      bolt12Offer, // Store Spark Address immediately if provided
    });

    console.log(`✅ Created Convex stream: ${streamId}`);

    // Create Mux live stream
    const muxStream = await createLiveStream({
      reconnectWindow: 60,
      reducedLatency: true,
    });

    console.log(`Created Mux stream: ${muxStream.streamId}`);

    // Encrypt the stream key before storing
    const encryptedStreamKey = await encryptSecret(muxStream.streamKey);

    // Update Convex stream with Mux details
    await convex.mutation(api.streams.updateStreamMux, {
      streamId,
      muxStreamId: muxStream.streamId,
      muxPlaybackId: muxStream.playbackId,
      muxStreamKey: encryptedStreamKey,
    });

    console.log(`✅ Stream created successfully: ${streamId}`);

    return NextResponse.json({
      success: true,
      streamId,
      muxStreamId: muxStream.streamId,
      muxPlaybackId: muxStream.playbackId,
    });
  } catch (error) {
    console.error("❌ Error creating/reusing stream:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to create stream",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
