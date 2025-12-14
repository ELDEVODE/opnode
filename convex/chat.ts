import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a chat message
export const sendMessage = mutation({
  args: {
    streamId: v.id("streams"),
    userId: v.string(),
    username: v.string(),
    userAvatar: v.optional(v.string()),
    message: v.string(),
    isHost: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      streamId: args.streamId,
      userId: args.userId,
      username: args.username,
      userAvatar: args.userAvatar,
      message: args.message,
      timestamp: Date.now(),
      isHost: args.isHost,
    });
  },
});

// Send a gift (creates both chat message and gift record)
export const sendGift = mutation({
  args: {
    streamId: v.id("streams"),
    fromUserId: v.string(),
    fromUsername: v.string(),
    toUserId: v.string(),
    amountSats: v.number(),
    giftType: v.string(),
    paymentHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create gift record
    const giftId = await ctx.db.insert("gifts", {
      streamId: args.streamId,
      fromUserId: args.fromUserId,
      fromUsername: args.fromUsername,
      toUserId: args.toUserId,
      amountSats: args.amountSats,
      giftType: args.giftType,
      paymentHash: args.paymentHash,
      status: "pending",
      timestamp: Date.now(),
    });

    // Create chat message for gift
    await ctx.db.insert("chatMessages", {
      streamId: args.streamId,
      userId: args.fromUserId,
      username: args.fromUsername,
      message: `Sent ${args.amountSats} sats ${args.giftType}`,
      timestamp: Date.now(),
      isHost: false,
      isGift: true,
      giftAmount: args.amountSats,
    });
    
    // Create notification for the recipient
    await ctx.db.insert("notifications", {
      userId: args.toUserId,
      type: "gift",
      title: "New Gift Received! ⚡",
      message: `${args.fromUsername} sent you ${args.amountSats} sats`,
      relatedUserId: args.fromUserId,
      relatedStreamId: args.streamId,
      relatedGiftId: giftId,
      isRead: false,
      timestamp: Date.now(),
    });

    return giftId;
  },
});

// Update gift status (when payment confirms)
export const updateGiftStatus = mutation({
  args: {
    giftId: v.id("gifts"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.giftId, {
      status: args.status,
    });
  },
});

// Get messages for a stream (paginated)
export const getStreamMessages = query({
  args: {
    streamId: v.id("streams"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .order("desc")
      .take(limit);
  },
});

// Get recent messages (for live chat)
export const getRecentMessages = query({
  args: {
    streamId: v.id("streams"),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const count = args.count ?? 20;
    
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .order("desc")
      .take(count);

    return messages.reverse(); // Return in chronological order
  },
});
