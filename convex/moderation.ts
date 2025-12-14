import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Block a user from your streams
export const blockUser = mutation({
  args: {
    blockerId: v.string(),
    blockedUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already blocked
    const existing = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker", (q) => q.eq("blockerId", args.blockerId))
      .filter((q) => q.eq(q.field("blockedUserId"), args.blockedUserId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("blockedUsers", {
      blockerId: args.blockerId,
      blockedUserId: args.blockedUserId,
      createdAt: Date.now(),
    });
  },
});

// Unblock a user
export const unblockUser = mutation({
  args: {
    blockerId: v.string(),
    blockedUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const blocked = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker", (q) => q.eq("blockerId", args.blockerId))
      .filter((q) => q.eq(q.field("blockedUserId"), args.blockedUserId))
      .first();

    if (blocked) {
      await ctx.db.delete(blocked._id);
    }
  },
});

// Check if a user is blocked
export const isUserBlocked = query({
  args: {
    blockerId: v.string(),
    blockedUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const blocked = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker", (q) => q.eq("blockerId", args.blockerId))
      .filter((q) => q.eq(q.field("blockedUserId"), args.blockedUserId))
      .first();

    return !!blocked;
  },
});

// Report content
export const reportContent = mutation({
  args: {
    reporterId: v.string(),
    contentType: v.string(), // "message" | "stream" | "user"
    contentId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      reporterId: args.reporterId,
      contentType: args.contentType,
      contentId: args.contentId,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Get all reports (admin only)
export const getReports = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const status = args.status; // TypeScript narrowing
      return await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(50);
    }

    return await ctx.db.query("reports").order("desc").take(50);
  },
});
