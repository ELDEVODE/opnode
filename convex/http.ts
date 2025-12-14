import { httpRouter } from "convex/server";
import { httpAction} from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Helper function to verify Mux webhook signature
async function verifyMuxWebhookSignature(
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

    // Compare signatures
    const isValid = expectedSignature === signature;

    if (!isValid) {
      console.error("Webhook signature verification failed");
    }

    return isValid;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

// Mux webhook handler
http.route({
  path: "/muxWebhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const rawBody = await request.text();
      const signature = request.headers.get("mux-signature") || "";
      
      // Verify webhook signature (optional during setup)
      const webhookSecret = process.env.MUX_WEBHOOK_SIGNING_SECRET;
      if (webhookSecret) {
        const isValid = await verifyMuxWebhookSignature(rawBody, signature, webhookSecret);
        if (!isValid) {
          console.error("Invalid webhook signature - rejecting");
          return new Response("Invalid signature", { status: 401 });
        }
        console.log("✅ Webhook signature verified");
      } else {
        console.warn("⚠️ MUX_WEBHOOK_SIGNING_SECRET not configured - skipping signature verification");
      }
      
      // Parse webhook payload
      const payload = JSON.parse(rawBody);
      
      // Webhook events we care about:
      // - video.live_stream.active: Stream went live
      // - video.live_stream.idle: Stream ended
      // - video.live_stream.created: Stream was created
      
      const eventType = payload.type;
      const liveStreamId = payload.data?.id;

      if (!liveStreamId) {
        console.error("No stream ID in Mux webhook payload");
        return new Response("No stream ID in payload", { status: 400 });
      }

      console.log("Mux webhook received:", { eventType, liveStreamId });

      switch (eventType) {
        case "video.live_stream.active":
          console.log("Stream went live:", liveStreamId);
          try {
            await ctx.runMutation(api.streams.updateStreamStatusByMuxId, {
              muxStreamId: liveStreamId,
              isLive: true,
            });
            console.log("Successfully updated stream to live");
          } catch (error) {
            console.error("Failed to update stream to live:", error);
            return new Response("Failed to update stream status", { status: 500 });
          }
          break;

        case "video.live_stream.idle":
          console.log("Stream ended:", liveStreamId);
          try {
            await ctx.runMutation(api.streams.updateStreamStatusByMuxId, {
              muxStreamId: liveStreamId,
              isLive: false,
            });
            console.log("Successfully updated stream to idle");
          } catch (error) {
            console.error("Failed to update stream to idle:", error);
            return new Response("Failed to update stream status", { status: 500 });
          }
          break;

        case "video.live_stream.created":
          console.log("Stream created:", liveStreamId);
          break;

        default:
          console.log("Unhandled webhook event:", eventType);
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Error processing Mux webhook:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

// Breez payment webhook handler
http.route({
  path: "/paymentWebhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      
      console.log("Payment webhook received:", payload);

      // When a payment is received:
      // 1. Update gift status to "completed"
      // 2. Add earnings to stream
      // 3. Add earnings to user profile
      // 4. Record in payment history
      // 5. Create notification for streamer

      const { paymentHash, amountSats, recipientUserId } = payload;

      if (paymentHash && amountSats && recipientUserId) {
        // Record payment in history
        await ctx.runMutation(api.payments.recordPayment, {
          userId: recipientUserId,
          type: "received",
          amountSats: amountSats,
          paymentHash: paymentHash,
          status: "completed",
        });

        // Add to user earnings
        await ctx.runMutation(api.users.addUserEarnings, {
          userId: recipientUserId,
          amountSats: amountSats,
        });

        // Create notification
        await ctx.runMutation(api.users.createNotification, {
          userId: recipientUserId,
          type: "gift",
          title: "Payment Received!",
          message: `You received ${amountSats} sats`,
        });
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Error processing payment webhook:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
