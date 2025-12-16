import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Existing wallet profiles
  walletProfiles: defineTable({
    userId: v.string(),
    walletId: v.string(),
    publicKey: v.string(),
    network: v.string(),
    encryptedMnemonic: v.object({
      iv: v.string(),
      ciphertext: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Live streams
  streams: defineTable({
    hostUserId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    category: v.string(),
    thumbnailStorageId: v.optional(v.id("_storage")), // Custom thumbnail image
    muxStreamId: v.optional(v.string()), // Mux live stream ID
    muxPlaybackId: v.optional(v.string()), // For viewers
    muxStreamKey: v.optional(
      v.object({
        // Encrypted stream key
        iv: v.string(),
        ciphertext: v.string(),
      })
    ),
    bolt12Offer: v.optional(v.string()), // Spark Address or BOLT12 offer for receiving gifts
    isLive: v.boolean(),
    viewers: v.number(),
    totalViews: v.number(),
    totalEarnings: v.number(), // in sats
    totalGifts: v.number(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
  })
    .index("by_host", ["hostUserId"])
    .index("by_live", ["isLive"])
    .index("by_category", ["category"]),

  // Chat messages
  chatMessages: defineTable({
    streamId: v.id("streams"),
    userId: v.string(),
    username: v.string(),
    userAvatar: v.optional(v.string()),
    message: v.string(),
    timestamp: v.number(),
    isHost: v.boolean(),
    isGift: v.optional(v.boolean()),
    giftAmount: v.optional(v.number()),
  }).index("by_stream", ["streamId", "timestamp"]),

  // Gifts/Tips
  gifts: defineTable({
    streamId: v.id("streams"),
    fromUserId: v.string(),
    fromUsername: v.string(),
    toUserId: v.string(),
    amountSats: v.number(),
    giftType: v.string(),
    paymentHash: v.optional(v.string()),
    status: v.string(), // "pending" | "completed" | "failed"
    timestamp: v.number(),
  })
    .index("by_stream", ["streamId"])
    .index("by_recipient", ["toUserId", "timestamp"]),

  // User profiles
  userProfiles: defineTable({
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
    bannerStorageId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    followers: v.number(),
    following: v.number(),
    totalEarnings: v.number(), // in sats
    isVerified: v.boolean(),
    lightningAddress: v.optional(v.string()), // username@domain.com
    bolt12Offer: v.optional(v.string()), // Static BOLT12 offer for receiving payments
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_username", ["username"]),

  // Follow relationships
  follows: defineTable({
    followerUserId: v.string(),
    followingUserId: v.string(),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerUserId"])
    .index("by_following", ["followingUserId"])
    .index("by_pair", ["followerUserId", "followingUserId"]),

  // Notifications
  notifications: defineTable({
    userId: v.string(),
    type: v.string(), // "gift" | "follow" | "stream_start" | "mention"
    title: v.string(),
    message: v.string(),
    relatedUserId: v.optional(v.string()),
    relatedStreamId: v.optional(v.id("streams")),
    relatedGiftId: v.optional(v.id("gifts")),
    isRead: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId", "timestamp"])
    .index("by_user_unread", ["userId", "isRead", "timestamp"]),

  // Payment history
  paymentHistory: defineTable({
    userId: v.string(),
    type: v.string(), // "received" | "sent" | "withdrawal"
    amountSats: v.number(),
    paymentRequest: v.optional(v.string()), // BOLT11, Lightning address, etc.
    relatedStreamId: v.optional(v.id("streams")),
    relatedGiftId: v.optional(v.id("gifts")),
    paymentHash: v.optional(v.string()),
    status: v.string(), // "pending" | "completed" | "failed"
    timestamp: v.number(),
  })
    .index("by_user", ["userId", "timestamp"])
    .index("by_paymentHash", ["paymentHash"]),

  // Stream settings (persisted per user)
  streamSettings: defineTable({
    userId: v.string(),
    microphone: v.string(),
    speaker: v.string(),
    camera: v.string(),
    micVolume: v.number(),
    speakerVolume: v.number(),
    sceneLayout: v.string(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Blocked users (for moderation)
  blockedUsers: defineTable({
    blockerId: v.string(),
    blockedUserId: v.string(),
    createdAt: v.number(),
  })
    .index("by_blocker", ["blockerId"])
    .index("by_blocked", ["blockedUserId"]),

  // Content reports
  reports: defineTable({
    reporterId: v.string(),
    contentType: v.string(), // "message" | "stream" | "user"
    contentId: v.string(),
    reason: v.string(),
    status: v.string(), // "pending" | "reviewed" | "resolved"
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // Invoice requests for gift payments
  invoiceRequests: defineTable({
    streamId: v.id("streams"),
    viewerUserId: v.string(),
    amountSats: v.number(),
    description: v.string(),
    status: v.string(), // "pending" | "fulfilled" | "expired" | "paid"
    invoice: v.optional(v.string()), // BOLT11 invoice (set when fulfilled)
    paymentHash: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(), // Request expires after 60 seconds
    fulfilledAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
  })
    .index("by_stream", ["streamId", "status", "createdAt"])
    .index("by_status", ["status", "createdAt"]),
});
