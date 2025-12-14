import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Decryption helpers (matching encryption in create route)
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const IV_LENGTH = 12;

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
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

async function decryptSecret(encrypted: { iv: string; ciphertext: string }) {
  const key = await getEncryptionKey();
  const iv = base64ToBuffer(encrypted.iv);
  const ciphertext = base64ToBuffer(encrypted.ciphertext);

  const plainText = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return textDecoder.decode(plainText);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamId, userId } = body;

    if (!streamId || !userId) {
      return NextResponse.json(
        { error: "Stream ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get stream from Convex
    const stream = await convex.query(api.streams.getStream, {
      streamId: streamId as Id<"streams">,
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Verify user is the host
    if (stream.hostUserId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: You are not the stream host" },
        { status: 403 }
      );
    }

    // Decrypt and return stream key
    if (!stream.muxStreamKey) {
      return NextResponse.json(
        { error: "Stream key not available" },
        { status: 404 }
      );
    }

    const streamKey = await decryptSecret(stream.muxStreamKey);

    return NextResponse.json({
      success: true,
      streamKey,
      muxStreamId: stream.muxStreamId,
      rtmpUrl: `rtmps://global-live.mux.com:443/app`,
    });
  } catch (error) {
    console.error("Error getting stream key:", error);
    return NextResponse.json(
      { error: "Failed to retrieve stream key" },
      { status: 500 }
    );
  }
}
