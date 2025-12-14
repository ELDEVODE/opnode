import Mux from "@mux/mux-node";

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export interface CreateLiveStreamResult {
  streamId: string;
  streamKey: string;
  playbackId: string;
}

/**
 * Create a new Mux live stream
 */
export async function createLiveStream(options: {
  reconnectWindow?: number;
  reducedLatency?: boolean;
}): Promise<CreateLiveStreamResult> {
  const { reconnectWindow = 60, reducedLatency = true } = options;

  const stream = await mux.video.liveStreams.create({
    playback_policy: ["public"],
    reconnect_window: reconnectWindow,
    reduced_latency: reducedLatency,
    new_asset_settings: {
      playback_policy: ["public"],
    },
  });

  if (!stream.stream_key || !stream.playback_ids?.[0]?.id) {
    throw new Error("Failed to create Mux stream - missing credentials");
  }

  return {
    streamId: stream.id,
    streamKey: stream.stream_key,
    playbackId: stream.playback_ids[0].id,
  };
}

/**
 * Delete a Mux live stream
 */
export async function deleteLiveStream(streamId: string): Promise<void> {
  await mux.video.liveStreams.delete(streamId);
}

/**
 * Get stream status from Mux
 */
export async function getStreamStatus(streamId: string) {
  const stream = await mux.video.liveStreams.retrieve(streamId);
  return {
    status: stream.status,
    isActive: stream.status === "active",
    recent_asset_ids: stream.recent_asset_ids,
  };
}

/**
 * Verify Mux webhook signature
 * Mux signs webhook payloads with HMAC-SHA256
 * Format: t=<timestamp>,v1=<signature>
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  try {
    if (!signatureHeader || !secret) {
      console.error("Missing signature or secret for webhook verification");
      return false;
    }

    // Parse the signature header: "t=<timestamp>,v1=<signature>"
    const signatureParts = signatureHeader.split(",");
    let timestamp = "";
    let signature = "";

    for (const part of signatureParts) {
      const [key, value] = part.split("=");
      if (key === "t") {
        timestamp = value;
      } else if (key === "v1") {
        signature = value;
      }
    }

    if (!timestamp || !signature) {
      console.error("Invalid signature header format");
      return false;
    }

    // Create the signed payload string: timestamp.rawBody
    const signedPayload = `${timestamp}.${rawBody}`;

    // Create HMAC-SHA256 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedPayload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Compare signatures (constant-time comparison would be ideal in production)
    const isValid = expectedSignature === signature;

    if (!isValid) {
      console.error("Webhook signature verification failed");
      console.error("Expected:", expectedSignature);
      console.error("Received:", signature);
    }

    return isValid;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

export default mux;
