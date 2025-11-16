import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
});
