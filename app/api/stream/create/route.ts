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

    // Check if user has an existing inactive stream that can be reused
    const existingStreams = await convex.query(api.streams.getUserStreams, {
      userId,
    });

    // Find the most recent inactive stream with Mux credentials
    const reusableStream = existingStreams
      .filter((stream) => !stream.isLive && stream.muxStreamId && stream.muxPlaybackId)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];

    if (reusableStream) {
      // Reuse existing stream - just update the metadata
      console.log(`Reusing stream ${reusableStream._id} for user ${userId}`);
      
      await convex.mutation(api.streams.resetStreamForReuse, {
        streamId: reusableStream._id,
        title,
        description,
        tags: tags || [],
        category: category || "Live",
        thumbnailStorageId,
      });

      return NextResponse.json({
        success: true,
        streamId: reusableStream._id,
        muxStreamId: reusableStream.muxStreamId,
        muxPlaybackId: reusableStream.muxPlaybackId,
        reused: true, // Flag to indicate this was reused
      });
    }

    // No reusable stream found - create a new one
    console.log(`Creating new stream for user ${userId}`);

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
      reused: false,
      // Note: We don't return the stream key to the client for security
      // The client will need to request it separately if needed
    });
  } catch (error) {
    console.error("Error creating/reusing stream:", error);
    return NextResponse.json(
      { error: "Failed to create stream" },
      { status: 500 }
    );
  }
}
