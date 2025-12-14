import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // Create some test streams
    const testStreams = [
      {
        hostUserId: "test-user-1",
        title: "Building a Bitcoin App Live!",
        description: "Let's build something awesome with Lightning Network",
        tags: ["bitcoin", "development", "lightning"],
        category: "Tech",
      },
      {
        hostUserId: "test-user-2",
        title: "Music Production Session",
        description: "Creating beats and vibes",
        tags: ["music", "production", "live"],
        category: "Music",
      },
      {
        hostUserId: "test-user-3",
        title: "Gaming Marathon - Speedrun",
        description: "Attempting world record speedrun",
        tags: ["gaming", "speedrun", "live"],
        category: "Gaming",
      },
    ];

    const createdStreams = [];
    for (const stream of testStreams) {
      const streamId = await convex.mutation(api.streams.createStream, stream);
      createdStreams.push(streamId);
    }

    return NextResponse.json({
      success: true,
      message: "Test streams created",
      streamIds: createdStreams,
    });
  } catch (error) {
    console.error("Error creating test streams:", error);
    return NextResponse.json(
      { error: "Failed to create test streams" },
      { status: 500 }
    );
  }
}
