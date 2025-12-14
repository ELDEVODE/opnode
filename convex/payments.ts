import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record a payment
export const recordPayment = mutation({
  args: {
    userId: v.string(),
    type: v.string(), // "received" | "sent" | "withdrawal"
    amountSats: v.number(),
    relatedStreamId: v.optional(v.id("streams")),
    relatedGiftId: v.optional(v.id("gifts")),
    paymentHash: v.optional(v.string()),
    status: v.string(), // "pending" | "completed" | "failed"
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("paymentHistory", {
      userId: args.userId,
      type: args.type,
      amountSats: args.amountSats,
      relatedStreamId: args.relatedStreamId,
      relatedGiftId: args.relatedGiftId,
      paymentHash: args.paymentHash,
      status: args.status,
      timestamp: Date.now(),
    });
  },
});

// Create a pending payment (before sending)
export const createPendingPayment = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    amountSats: v.number(),
    paymentRequest: v.optional(v.string()),
    relatedStreamId: v.optional(v.id("streams")),
    relatedGiftId: v.optional(v.id("gifts")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("paymentHistory", {
      userId: args.userId,
      type: args.type,
      amountSats: args.amountSats,
      paymentRequest: args.paymentRequest,
      relatedStreamId: args.relatedStreamId,
      relatedGiftId: args.relatedGiftId,
      status: "pending",
      timestamp: Date.now(),
    });
  },
});

// Update payment with hash after sending
export const updatePaymentWithHash = mutation({
  args: {
    paymentId: v.id("paymentHistory"),
    paymentHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      paymentHash: args.paymentHash,
    });
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("paymentHistory"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: args.status,
    });
  },
});

// Get payment history for a user
export const getPaymentHistory = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    return await ctx.db
      .query("paymentHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get payment by hash
export const getPaymentByHash = query({
  args: { paymentHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentHistory")
      .withIndex("by_paymentHash", (q) => q.eq("paymentHash", args.paymentHash))
      .first();
  },
});

// Record incoming payment (received)
export const recordIncomingPayment = mutation({
  args: {
    userId: v.string(),
    amountSats: v.number(),
    paymentHash: v.string(),
    relatedStreamId: v.optional(v.id("streams")),
  },
  handler: async (ctx, args) => {
    // Check if payment already exists
    const existing = await ctx.db
      .query("paymentHistory")
      .withIndex("by_paymentHash", (q) => q.eq("paymentHash", args.paymentHash))
      .first();

    if (existing) {
      // Update status if it was pending
      if (existing.status === "pending") {
        await ctx.db.patch(existing._id, { status: "completed" });
      }
      return existing._id;
    }

    // Create new payment record
    return await ctx.db.insert("paymentHistory", {
      userId: args.userId,
      type: "received",
      amountSats: args.amountSats,
      paymentHash: args.paymentHash,
      relatedStreamId: args.relatedStreamId,
      status: "completed",
      timestamp: Date.now(),
    });
  },
});

// Get user earnings summary
export const getUserEarnings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("paymentHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), "received"))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const totalEarnings = payments.reduce((sum, p) => sum + p.amountSats, 0);
    const totalTransactions = payments.length;

    // Get profile for all-time earnings
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    return {
      totalEarnings,
      totalTransactions,
      allTimeEarnings: profile?.totalEarnings ?? 0,
    };
  },
});
