import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Save/update stream settings for a user
export const saveSettings = mutation({
  args: {
    userId: v.string(),
    microphone: v.string(),
    speaker: v.string(),
    camera: v.string(),
    micVolume: v.number(),
    speakerVolume: v.number(),
    sceneLayout: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("streamSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        microphone: args.microphone,
        speaker: args.speaker,
        camera: args.camera,
        micVolume: args.micVolume,
        speakerVolume: args.speakerVolume,
        sceneLayout: args.sceneLayout,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("streamSettings", {
      userId: args.userId,
      microphone: args.microphone,
      speaker: args.speaker,
      camera: args.camera,
      micVolume: args.micVolume,
      speakerVolume: args.speakerVolume,
      sceneLayout: args.sceneLayout,
      updatedAt: Date.now(),
    });
  },
});

// Get user's stream settings
export const getSettings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("streamSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});
