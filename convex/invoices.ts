import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create an invoice request (called by viewer)
export const createInvoiceRequest = mutation({
  args: {
    streamId: v.id("streams"),
    viewerUserId: v.string(),
    amountSats: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 60000; // 60 seconds

    const requestId = await ctx.db.insert("invoiceRequests", {
      streamId: args.streamId,
      viewerUserId: args.viewerUserId,
      amountSats: args.amountSats,
      description: args.description,
      status: "pending",
      createdAt: now,
      expiresAt,
    });

    console.log("📝 Invoice request created:", requestId);

    return requestId;
  },
});

// Get pending invoice requests for a stream (called by streamer)
export const getPendingInvoiceRequests = query({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get all pending requests for this stream
    const requests = await ctx.db
      .query("invoiceRequests")
      .withIndex("by_stream", (q) =>
        q.eq("streamId", args.streamId).eq("status", "pending")
      )
      .collect();

    // Filter out expired ones
    return requests.filter((req) => req.expiresAt > now);
  },
});

// Fulfill an invoice request (called by streamer after generating invoice)
export const fulfillInvoiceRequest = mutation({
  args: {
    requestId: v.id("invoiceRequests"),
    invoice: v.string(),
    paymentHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "fulfilled",
      invoice: args.invoice,
      paymentHash: args.paymentHash,
      fulfilledAt: Date.now(),
    });

    console.log("✅ Invoice request fulfilled:", args.requestId);
  },
});

// Get a specific invoice request (called by viewer to check if fulfilled)
export const getInvoiceRequest = query({
  args: { requestId: v.id("invoiceRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

// Mark invoice as paid (called after successful payment)
export const markInvoicePaid = mutation({
  args: {
    requestId: v.id("invoiceRequests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "paid",
      paidAt: Date.now(),
    });

    console.log("💰 Invoice marked as paid:", args.requestId);
  },
});

// Clean up expired requests (can be called periodically)
export const cleanupExpiredRequests = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredRequests = await ctx.db
      .query("invoiceRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    for (const request of expiredRequests) {
      if (request.expiresAt < now) {
        await ctx.db.patch(request._id, {
          status: "expired",
        });
      }
    }
  },
});
