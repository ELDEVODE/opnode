import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new stream
export const createStream = mutation({
  args: {
    hostUserId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    category: v.string(),
    thumbnailStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const streamId = await ctx.db.insert("streams", {
      hostUserId: args.hostUserId,
      title: args.title,
      description: args.description,
      tags: args.tags,
      category: args.category,
      thumbnailStorageId: args.thumbnailStorageId,
      isLive: false,
      viewers: 0,
      totalViews: 0,
      totalEarnings: 0,
      totalGifts: 0,
      createdAt: Date.now(),
    });

    return streamId;
  },
});

// Update stream with Mux details
export const updateStreamMux = mutation({
  args: {
    streamId: v.id("streams"),
    muxStreamId: v.string(),
    muxPlaybackId: v.string(),
    muxStreamKey: v.object({
      iv: v.string(),
      ciphertext: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, {
      muxStreamId: args.muxStreamId,
      muxPlaybackId: args.muxPlaybackId,
      muxStreamKey: args.muxStreamKey,
    });
  },
});

// Start a stream (mark as live)
export const startStream = mutation({
  args: {
    streamId: v.id("streams"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, {
      isLive: true,
      startedAt: Date.now(),
    });
  },
});

// End a stream
export const endStream = mutation({
  args: {
    streamId: v.id("streams"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, {
      isLive: false,
      endedAt: Date.now(),
    });
  },
});

// Update stream status by Mux stream ID (for webhooks)
export const updateStreamStatusByMuxId = mutation({
  args: {
    muxStreamId: v.string(),
    isLive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Find the stream by muxStreamId
    const stream = await ctx.db
      .query("streams")
      .filter((q) => q.eq(q.field("muxStreamId"), args.muxStreamId))
      .first();

    if (!stream) {
      throw new Error(`Stream not found for muxStreamId: ${args.muxStreamId}`);
    }

    // Update the stream status
    const updates: any = {
      isLive: args.isLive,
    };

    if (args.isLive) {
      updates.startedAt = Date.now();
    } else {
      updates.endedAt = Date.now();
    }

    await ctx.db.patch(stream._id, updates);
    
    return stream._id;
  },
});

// Update stream viewer count
export const updateViewers = mutation({
  args: {
    streamId: v.id("streams"),
    viewers: v.number(),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (!stream) throw new Error("Stream not found");

    await ctx.db.patch(args.streamId, {
      viewers: args.viewers,
      totalViews: Math.max(stream.totalViews, args.viewers),
    });
  },
});

// Increment earnings when gift received
export const addEarnings = mutation({
  args: {
    streamId: v.id("streams"),
    amountSats: v.number(),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (!stream) throw new Error("Stream not found");

    await ctx.db.patch(args.streamId, {
      totalEarnings: stream.totalEarnings + args.amountSats,
      totalGifts: stream.totalGifts + 1,
    });
  },
});

// Update stream details (title, description, etc.)
export const updateStreamDetails = mutation({
  args: {
    streamId: v.id("streams"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (!stream) throw new Error("Stream not found");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.category !== undefined) updates.category = args.category;

    await ctx.db.patch(args.streamId, updates);
  },
});

// Get a single stream
export const getStream = query({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.streamId);
  },
});

// Get all live streams
export const getLiveStreams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("streams")
      .withIndex("by_live", (q) => q.eq("isLive", true))
      .order("desc")
      .collect();
  },
});

// Get streams by category
export const getStreamsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("streams")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isLive"), true))
      .order("desc")
      .collect();
  },
});

// Get streams by host
export const getUserStreams = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("streams")
      .withIndex("by_host", (q) => q.eq("hostUserId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get active stream for user (to prevent duplicates)
export const getActiveStream = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get the most recent stream that's still live or was created recently
    const streams = await ctx.db
      .query("streams")
      .withIndex("by_host", (q) => q.eq("hostUserId", args.userId))
      .order("desc")
      .take(5); // Check last 5 streams

    // Return the first one that's either live or created within last hour and not ended
    return streams.find(stream => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return stream.isLive || (stream.createdAt > oneHourAgo && !stream.endedAt);
    }) || null;
  },
});

// Get stream stats
export const getStreamStats = query({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (!stream) return null;

    return {
      viewers: stream.viewers,
      totalViews: stream.totalViews,
      totalEarnings: stream.totalEarnings,
      totalGifts: stream.totalGifts,
      isLive: stream.isLive,
      startedAt: stream.startedAt,
    };
  },
});
