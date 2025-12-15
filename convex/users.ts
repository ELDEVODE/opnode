import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update user profile
export const upsertProfile = mutation({
  args: {
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
    bannerStorageId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username,
        displayName: args.displayName,
        avatarStorageId: args.avatarStorageId,
        bannerStorageId: args.bannerStorageId,
        bio: args.bio,
      });
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      userId: args.userId,
      username: args.username,
      displayName: args.displayName,
      avatarStorageId: args.avatarStorageId,
      bannerStorageId: args.bannerStorageId,
      bio: args.bio,
      followers: 0,
      following: 0,
      totalEarnings: 0,
      isVerified: false,
      createdAt: Date.now(),
    });
  },
});

// Update Lightning address for user profile
export const updateLightningAddress = mutation({
  args: {
    userId: v.string(),
    lightningAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existing) {
      throw new Error("User profile not found");
    }

    await ctx.db.patch(existing._id, {
      lightningAddress: args.lightningAddress,
    });

    return existing._id;
  },
});

// Generate upload URL for profile images
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create default profile if one doesn't exist (for wallet connection)
export const ensureProfile = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      return existing._id; // Already has a profile
    }

    // Create default profile with generated username
    return await ctx.db.insert("userProfiles", {
      userId: args.userId,
      username: `user_${args.userId.slice(0, 8)}`,
      displayName: `User ${args.userId.slice(0, 6)}`,
      followers: 0,
      following: 0,
      totalEarnings: 0,
      isVerified: false,
      createdAt: Date.now(),
    });
  },
});

// Get file URL from storage ID
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Add earnings to user profile
export const addUserEarnings = mutation({
  args: {
    userId: v.string(),
    amountSats: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("User profile not found");

    await ctx.db.patch(profile._id, {
      totalEarnings: profile.totalEarnings + args.amountSats,
    });
  },
});

// Follow a user
export const followUser = mutation({
  args: {
    followerUserId: v.string(),
    followingUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q
          .eq("followerUserId", args.followerUserId)
          .eq("followingUserId", args.followingUserId)
      )
      .unique();

    if (existing) return existing._id;

    // Create follow relationship
    const followId = await ctx.db.insert("follows", {
      followerUserId: args.followerUserId,
      followingUserId: args.followingUserId,
      createdAt: Date.now(),
    });

    // Update follower counts
    const follower = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.followerUserId))
      .unique();

    const following = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.followingUserId))
      .unique();

    if (follower) {
      await ctx.db.patch(follower._id, {
        following: follower.following + 1,
      });
    }

    if (following) {
      await ctx.db.patch(following._id, {
        followers: following.followers + 1,
      });
    }

    return followId;
  },
});

// Unfollow a user
export const unfollowUser = mutation({
  args: {
    followerUserId: v.string(),
    followingUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q
          .eq("followerUserId", args.followerUserId)
          .eq("followingUserId", args.followingUserId)
      )
      .unique();

    if (!follow) return;

    await ctx.db.delete(follow._id);

    // Update follower counts
    const follower = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.followerUserId))
      .unique();

    const following = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.followingUserId))
      .unique();

    if (follower && follower.following > 0) {
      await ctx.db.patch(follower._id, {
        following: follower.following - 1,
      });
    }

    if (following && following.followers > 0) {
      await ctx.db.patch(following._id, {
        followers: following.followers - 1,
      });
    }
  },
});

// Create notification
export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    relatedUserId: v.optional(v.string()),
    relatedStreamId: v.optional(v.id("streams")),
    relatedGiftId: v.optional(v.id("gifts")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      relatedUserId: args.relatedUserId,
      relatedStreamId: args.relatedStreamId,
      relatedGiftId: args.relatedGiftId,
      isRead: false,
      timestamp: Date.now(),
    });
  },
});

// Mark notifications as read
export const markNotificationsRead = mutation({
  args: {
    userId: v.string(),
    notificationIds: v.optional(v.array(v.id("notifications"))),
  },
  handler: async (ctx, args) => {
    if (args.notificationIds) {
      // Mark specific notifications
      for (const id of args.notificationIds) {
        await ctx.db.patch(id, { isRead: true });
      }
    } else {
      // Mark all user's notifications as read
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user_unread", (q) =>
          q.eq("userId", args.userId).eq("isRead", false)
        )
        .collect();

      for (const notification of notifications) {
        await ctx.db.patch(notification._id, { isRead: true });
      }
    }
  },
});

// Get user profile
export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) return null;

    // Get URLs from storage IDs
    const avatarUrl = profile.avatarStorageId
      ? await ctx.storage.getUrl(profile.avatarStorageId)
      : null;

    const bannerUrl = profile.bannerStorageId
      ? await ctx.storage.getUrl(profile.bannerStorageId)
      : null;
    
    // Get wallet public key for Lightning payments
    const walletProfile = await ctx.db
      .query("walletProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    return {
      ...profile,
      avatarUrl: avatarUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      avatar: avatarUrl || undefined, // For compatibility
      publicKey: walletProfile?.publicKey,
    };
  },
});

// Get profile by username
export const getProfileByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

// Check username availability
export const checkUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    return !existing; // Available if no existing user
  },
});

// Get user notifications
export const getNotifications = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get unread notification count
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    return unread.length;
  },
});
