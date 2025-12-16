"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { usePrepStream } from "@/components/providers/PrepStreamProvider";
import { getOrCreateWalletUserId } from "@/lib/userId";
import Image from "next/image";
import { HiX } from "react-icons/hi";
import {
  HiOutlineEye,
  HiOutlineGift,
  HiOutlineUserGroup,
  HiOutlineFaceSmile,
  HiOutlineMagnifyingGlass,
  HiOutlineDevicePhoneMobile,
  HiOutlineCog6Tooth,
  HiOutlineSpeakerXMark,
  HiOutlineMicrophone,
  HiAdjustmentsHorizontal,
} from "react-icons/hi2";
import { PiUserPlus } from "react-icons/pi";
import { PiMonitorArrowUp } from "react-icons/pi";
import { MdOutlineEdit } from "react-icons/md";
import { PiPencilSimple } from "react-icons/pi";
import { FaBitcoin } from "react-icons/fa";
import { RiChatOffLine } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import { IoShareOutline } from "react-icons/io5";
import { PiDevices } from "react-icons/pi";
import { RiHeartsLine } from "react-icons/ri";
import Navbar from "@/components/nav";
import StreamSettingsModal, {
  DeviceSettings,
} from "@/components/StreamSettingsModal";
import SceneSelectionModal from "@/components/SceneSelectionModal";
import ShareScreenModal from "@/components/ShareScreenModal";
import GoLiveCountdown from "@/components/GoLiveCountdown";
import CoHostModal from "@/components/CoHostModal";
import LiveEndedModal from "@/components/LiveEndedModal";

export default function StreamPage() {
  // Wallet and user
  const { status, sdk } = useEmbeddedWallet();
  const isWalletConnected = status === "ready";

  // Get stream metadata from PrepStream provider
  const { streamMetadata: prepStreamMetadata, clearStreamMetadata } =
    usePrepStream();

  // Only get userId after mount to avoid SSR issues
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(getOrCreateWalletUserId());
    }
  }, []);

  // Stream session state
  const [streamSessionId, setStreamSessionId] = useState<Id<"streams"> | null>(
    null
  );
  const [muxPlaybackId, setMuxPlaybackId] = useState<string | null>(null);
  const [isCreatingStream, setIsCreatingStream] = useState(false);

  // Media and UI state
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [displayStream, setDisplayStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );
  const [screenVideoElement, setScreenVideoElement] =
    useState<HTMLVideoElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSceneSelectionOpen, setIsSceneSelectionOpen] = useState(false);
  const [isShareScreenOpen, setIsShareScreenOpen] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [showShareCopied, setShowShareCopied] = useState(false);
  const [isCoHostModalOpen, setIsCoHostModalOpen] = useState(false);
  const [isLiveEndedModalOpen, setIsLiveEndedModalOpen] = useState(false);
  const [liveTime, setLiveTime] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Initialize stream metadata from PrepStream or use defaults
  const [streamMetadata, setStreamMetadata] = useState({
    title: prepStreamMetadata?.title || "My Live Stream",
    category: "Live",
    tags: prepStreamMetadata?.tags || ["Live", "Gaming"],
    thumbnailUrl: prepStreamMetadata?.thumbnailUrl || "/images/500l.png",
  });

  // Update stream metadata when prepStreamMetadata changes
  useEffect(() => {
    if (prepStreamMetadata) {
      setStreamMetadata({
        title: prepStreamMetadata.title,
        category: "Live", // TODO: Add category to PrepStream modal
        tags: prepStreamMetadata.tags,
        thumbnailUrl: prepStreamMetadata.thumbnailUrl || "/images/500l.png",
      });
    }
  }, [prepStreamMetadata]);
  const [endStreamStats, setEndStreamStats] = useState({
    viewers: "0",
    followers: 0,
    earnings: 0,
    gifts: 0,
    streamDuration: "00:00:00",
    streamedTime: "0m",
  });
  const [sceneLayout, setSceneLayout] = useState<"chat" | "general">("chat");
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>({
    microphone: "",
    speaker: "",
    camera: "",
    micVolume: 60,
    speakerVolume: 60,
  });
  const volumeLevel = deviceSettings.speakerVolume;
  const micLevel = deviceSettings.micVolume;
  const volumeSegments = Math.round(volumeLevel / 20);
  const micSegments = Math.round(micLevel / 20);

  // Fetch current stream data if session exists
  const currentStream = useQuery(
    api.streams.getStream,
    streamSessionId ? { streamId: streamSessionId } : "skip"
  );

  // Get user profile
  const userProfile = useQuery(
    api.users.getProfile,
    isWalletConnected && userId ? { userId } : "skip"
  );

  // Mutations
  const updateStreamDetails = useMutation(api.streams.updateStreamDetails);

  // Use real stream data or defaults
  const streamData = currentStream
    ? {
        title: currentStream.title,
        thumbnail: "/images/500l.png", // TODO: Add thumbnail from storage
        tags: currentStream.tags,
        category: currentStream.category,
        stats: {
          sats: currentStream.totalEarnings,
          views: currentStream.totalViews,
          gifts: currentStream.totalGifts,
          subscribers: userProfile?.followers || 0,
        },
      }
    : {
        title: streamMetadata.title,
        thumbnail: streamMetadata.thumbnailUrl,
        tags: streamMetadata.tags,
        category: streamMetadata.category,
        stats: {
          sats: 0,
          views: 0,
          gifts: 0,
          subscribers: userProfile?.followers || 0,
        },
      };

  // Mock chat messages when streaming
  const chatMessages = [
    {
      id: 1,
      user: "Alessandro",
      avatar: "/images/avatar1.png",
      message: "Sent you a pouch",
      emoji: "🎁",
      isGift: true,
      giftText: "Won 200 Wison tokens 🎉",
    },
    {
      id: 2,
      user: "The Nonnies",
      avatar: "/images/avatar2.png",
      message: "Sent you a gift",
      emoji: "🎁",
      isGift: true,
    },
    {
      id: 3,
      user: "Alessandro",
      avatar: "/images/avatar1.png",
      message: "Alessandro gave you 0.5 🪙",
      isGift: true,
      giftText: "Won 200 Wison tokens 🎉",
    },
    {
      id: 4,
      user: "Kaааhtea",
      avatar: "/images/avatar3.png",
      message: "Hi!! Shanaya, it's going greatt!!",
      isHost: true,
    },
    {
      id: 5,
      user: "Kaааhtea",
      avatar: "/images/avatar3.png",
      message:
        "Haha! No we're at an open field to play some ball! Keep watching and you'll see more",
      isHost: true,
    },
  ];

  // Create stream session with Mux
  const createStreamSession = async () => {
    if (!isWalletConnected || isCreatingStream) return;

    setIsCreatingStream(true);
    try {
      let sparkAddress: string | null = null;
      
      // Generate Spark Address for receiving gifts BEFORE creating the stream
      if (status === 'ready' && sdk) {
        try {
          console.log("🔄 Attempting to generate Spark Address...");
          
          const result = await sdk.receivePayment({
            paymentMethod: {
              type: "sparkAddress",
            },
          }) as any;
          
          console.log("🔍 Spark Address raw result:", result);
          console.log("🔍 Result keys:", Object.keys(result || {}));
          console.log("🔍 Result type:", typeof result);
          
          // Try multiple possible field names
          sparkAddress = result?.destination || 
                        result?.address || 
                        result?.sparkAddress || 
                        result?.offer ||
                        result?.bolt12 ||
                        result?.paymentRequest ||
                        null;
          
          if (sparkAddress) {
            console.log("✅ Spark Address generated successfully!");
            console.log("✅ Spark Address:", sparkAddress);
          } else {
            console.warn("⚠️ Spark Address not found in result");
            console.warn("⚠️ Full result object:", JSON.stringify(result, null, 2));
          }
        } catch (offerError: any) {
          console.error("❌ Failed to generate Spark Address:", offerError);
          console.error("❌ Error message:", offerError?.message);
          console.error("❌ Error stack:", offerError?.stack);
          // Continue without address - we'll warn user but stream creation will proceed
        }
      } else {
        console.warn("⚠️ Cannot generate Spark Address - wallet not ready", { status, hasSdk: !!sdk });
      }

      console.log("📡 Creating stream with sparkAddress:", sparkAddress ? "✅ Present" : "❌ Missing");

      const response = await fetch("/api/stream/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: streamMetadata.title,
          description: "Live stream",
          tags: streamMetadata.tags,
          category: streamMetadata.category,
          bolt12Offer: sparkAddress, // Include Spark Address in stream creation
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create stream");
      }

      const data = await response.json();
      setStreamSessionId(data.streamId);
      setMuxPlaybackId(data.muxPlaybackId);

      console.log("Stream session created:", data);
      console.log("Mux Playback ID:", data.muxPlaybackId);
      console.log(
        "Share URL:",
        `${window.location.origin}/stream/${data.streamId}`
      );
      
      // Warn user if Spark Address wasn't generated
      if (!sparkAddress) {
        console.warn("⚠️ Stream created without Spark Address - gifts will not work");
      }
    } catch (error) {
      console.error("Error creating stream:", error);
      alert("Failed to create stream. Please try again.");
    } finally {
      setIsCreatingStream(false);
    }
  };

  // Start stream (mark as live)
  const startStream = async () => {
    if (!streamSessionId) return;

    try {
      // Spark Address was already generated and stored during stream creation
      const response = await fetch("/api/stream/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          streamId: streamSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start stream");
      }

      console.log("Stream marked as live");
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  // End stream
  const endStream = async () => {
    if (!streamSessionId) return;

    try {
      const response = await fetch("/api/stream/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId: streamSessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to end stream");
      }

      const data = await response.json();
      console.log("Stream ended:", data.finalStats);

      // Update end stats
      if (data.finalStats) {
        setEndStreamStats({
          viewers: data.finalStats.viewers.toString(),
          followers: userProfile?.followers || 0,
          earnings: data.finalStats.totalEarnings / 1000,
          gifts: data.finalStats.totalGifts,
          streamDuration: formatTime(liveTime),
          streamedTime:
            liveTime >= 3600
              ? `${Math.floor(liveTime / 3600)}h ${Math.floor((liveTime % 3600) / 60)}m`
              : `${Math.floor(liveTime / 60)}m`,
        });
      }

      // Reset session
      setStreamSessionId(null);
      setMuxPlaybackId(null);
    } catch (error) {
      console.error("Error ending stream:", error);
    }
  };

  // Edit stream title
  const handleEditTitle = () => {
    setEditedTitle(streamData.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (editedTitle.trim()) {
      setStreamMetadata((prev) => ({
        ...prev,
        title: editedTitle.trim(),
      }));

      // Update the database if stream session exists
      if (streamSessionId) {
        try {
          await updateStreamDetails({
            streamId: streamSessionId,
            title: editedTitle.trim(),
          });
          console.log("Stream title updated");
        } catch (error) {
          console.error("Error updating stream title:", error);
        }
      }
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  const checkAndInitializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      setHasPermissions(true);

      // Attach stream to video element
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } catch (error) {
      console.error("Failed to get permissions:", error);
      // Permissions not granted - user needs to go through modal flow
      setHasPermissions(false);
    }
  };

  // Auto-initialize camera on mount if permissions exist
  useEffect(() => {
    checkAndInitializeCamera();
  }, []);

  // Live timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setLiveTime((prev) => prev + 1);
      }, 1000);
    } else {
      setLiveTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGoLive = async () => {
    // Create stream session if not exists
    if (!streamSessionId) {
      await createStreamSession();
      // Wait a bit for state to update
      setTimeout(() => setIsCountdownActive(true), 500);
    } else {
      setIsCountdownActive(true);
    }
  };

  const handleCountdownComplete = async () => {
    setIsCountdownActive(false);
    setIsStreaming(true);
    // Mark stream as live in backend
    await startStream();
  };

  const handleSettingsConfirm = (settings: DeviceSettings) => {
    setDeviceSettings(settings);
    // Apply the settings to the media stream if needed
  };

  const handleSceneLayoutChange = (layout: "chat" | "general") => {
    setSceneLayout(layout);
    // Apply the layout change to your stream configuration
  };

  // Share stream URL
  const handleShareStream = async () => {
    if (!streamSessionId) {
      alert("Please go live first to share your stream!");
      return;
    }

    const streamUrl = `${window.location.origin}/stream/${streamSessionId}`;

    try {
      await navigator.clipboard.writeText(streamUrl);
      setShowShareCopied(true);
      setTimeout(() => setShowShareCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback: show URL in alert
      alert(`Share this link: ${streamUrl}`);
    }
  };

  const handleShareScreen = async () => {
    try {
      const displayMediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setDisplayStream(displayMediaStream);
      setIsScreenSharing(true);

      // Attach stream to screen video element
      if (screenVideoElement) {
        screenVideoElement.srcObject = displayMediaStream;
      }

      // Listen for when user stops sharing via browser UI
      displayMediaStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        setDisplayStream(null);
      };
    } catch (error) {
      console.error("Failed to share screen:", error);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup media stream on unmount
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (displayStream) {
        displayStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream, displayStream]);

  useEffect(() => {
    if (videoElement && mediaStream) {
      videoElement.srcObject = mediaStream;
    }
  }, [videoElement, mediaStream]);

  useEffect(() => {
    if (screenVideoElement && displayStream) {
      screenVideoElement.srcObject = displayStream;
    }
  }, [screenVideoElement, displayStream]);

  return (
    <div className="h-screen bg-[#0F0F0F] text-white flex flex-col overflow-hidden">
      {/* Navbar - visible on all devices */}
      <div className="block sticky top-0 z-50 shrink-0">
        <Navbar />
      </div>

      <main className="flex-1 w-full lg:px-4 lg:pb-6 flex flex-col lg:flex-row lg:gap-6 overflow-hidden min-h-0">
        {/* Main Content Area */}
        <section className="flex-1 flex flex-col gap-0 min-h-0 relative">
          {/* Desktop Header - Above Video */}
          <div className="hidden lg:flex items-stretch justify-between gap-4 bg-[#131316] px-6 py-4 rounded-t-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.35)] shrink-0">
            <div className="flex items-stretch gap-4 flex-1">
              <Image
                src={streamData.thumbnail}
                alt="Stream thumbnail"
                width={56}
                height={56}
                className="rounded-xl object-cover self-stretch max-w-[200px] h-auto"
                priority
              />
              <div className="flex-1 flex flex-col justify-center">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle();
                        if (e.key === "Escape") handleCancelEditTitle();
                      }}
                      className="flex-1 bg-white/10 text-white px-3 py-1.5 rounded-lg text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      autoFocus
                      placeholder="Enter stream title"
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-semibold transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditTitle}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h1 className="text-xl font-bold leading-tight text-white">
                    {streamData.title}
                  </h1>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {streamData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Edit stream"
                onClick={handleEditTitle}
                disabled={isEditingTitle}
                className="w-11 h-11 rounded-full  flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PiPencilSimple className="w-7 h-7" />
              </button>
              <button
                aria-label="Share stream"
                onClick={handleShareStream}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110"
              >
                <IoShareOutline className="w-7 h-7" />
              </button>
              <div className="w-px h-6 bg-white/20"></div>
              <button
                aria-label="Mobile view"
                onClick={() => setIsSceneSelectionOpen(true)}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110"
              >
                <PiDevices className="w-7 h-7" />
              </button>

              {isStreaming && (
                <>
                  <div className="w-px h-6 bg-white/20"></div>
                  <button className="bg-red-600 hover:bg-red-700 px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Live
                    <span className="mx-2">•</span>
                    {formatTime(liveTime)}
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Video Container */}
          <div className="relative flex-1 min-h-0 bg-[#131316] border-none lg:border lg:border-white/5 rounded-none lg:rounded-[14px] lg:rounded-t-none overflow-hidden shadow-none lg:shadow-[0_25px_50px_rgba(0,0,0,0.35)]">
            {/* Mobile Header Overlay - Only on Mobile */}
            <div className="lg:hidden absolute top-0 left-0 right-0 z-20">
              {isStreaming ? (
                /* Live State - Stats Bar */
                <div className="bg-[#374151]/95 backdrop-blur-md rounded-3xl mx-4 mt-4 px-4 py-3">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="flex items-center gap-1.5">
                      <FaBitcoin className="text-orange-500 w-4 h-4" />
                      <span className="font-semibold">
                        {streamData.stats.sats >= 1000
                          ? `${(streamData.stats.sats / 1000).toFixed(0)}K`
                          : streamData.stats.sats}
                      </span>
                    </span>
                    <div className="w-px h-4 bg-white/20"></div>
                    <span className="flex items-center gap-1.5">
                      <HiOutlineEye className="w-4 h-4" />
                      <span className="font-semibold">
                        {streamData.stats.views >= 1000
                          ? `${(streamData.stats.views / 1000).toFixed(0)}k`
                          : streamData.stats.views}
                      </span>
                    </span>
                    <div className="w-px h-4 bg-white/20"></div>
                    <span className="flex items-center gap-1.5">
                      <HiOutlineGift className="w-4 h-4" />
                      <span className="font-semibold">
                        {streamData.stats.gifts}
                      </span>
                    </span>
                    <div className="w-px h-4 bg-white/20"></div>
                    <span className="flex items-center gap-1.5">
                      <RiHeartsLine className="w-4 h-4" />
                      <span className="font-semibold">
                        {streamData.stats.subscribers >= 1000000
                          ? `${(streamData.stats.subscribers / 1000000).toFixed(1)}M`
                          : streamData.stats.subscribers >= 1000
                            ? `${(streamData.stats.subscribers / 1000).toFixed(0)}K`
                            : streamData.stats.subscribers}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      aria-label="Share stream"
                      className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <IoShareOutline className="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Screen share"
                      onClick={() => {
                        if (isScreenSharing) {
                          if (displayStream) {
                            displayStream
                              .getTracks()
                              .forEach((track) => track.stop());
                          }
                          setIsScreenSharing(false);
                          setDisplayStream(null);
                        } else {
                          handleShareScreen();
                        }
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isScreenSharing
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <PiMonitorArrowUp className="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Settings"
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <HiAdjustmentsHorizontal className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="font-semibold">Live</span>
                      </span>
                      <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2">
                        {formatTime(liveTime)}
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Offline State - Original Header */
                <div className="bg-gradient-to-b from-black/60 via-black/40 to-transparent pt-12 pb-8">
                  <div className="px-4 flex items-stretch gap-3">
                    <Image
                      src={streamData.thumbnail}
                      alt="Stream thumbnail"
                      width={56}
                      height={56}
                      className="rounded-xl object-cover shrink-0 self-stretch"
                      priority
                    />
                    <div className="flex flex-col flex-1 min-w-0 justify-between">
                      <div>
                        <h1 className="text-base font-bold leading-tight text-white">
                          {streamData.title}
                        </h1>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-white/70">
                          <FaBitcoin className="text-orange-500 shrink-0" />
                          <span>{streamData.stats.sats}</span>
                          <span className="mx-1">•</span>
                          <HiOutlineEye className="w-3.5 h-3.5 shrink-0" />
                          <span>{streamData.stats.views}</span>
                          <span className="mx-1">•</span>
                          <HiOutlineGift className="w-3.5 h-3.5 shrink-0" />
                          <span>{streamData.stats.gifts}</span>
                          <span className="mx-1">•</span>
                          <RiHeartsLine className="w-3.5 h-3.5 shrink-0" />
                          <span>{streamData.stats.subscribers}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 self-start"
                      aria-label="Close"
                    >
                      <HiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="px-4 mt-3 flex items-center gap-2">
                    <button
                      aria-label="Edit stream"
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110"
                    >
                      <PiPencilSimple className="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Share stream"
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110"
                    >
                      <IoShareOutline className="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Mobile view"
                      onClick={() => setIsSceneSelectionOpen(true)}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110"
                    >
                      <PiDevices className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Preview Area */}
            <div className="relative w-full h-full bg-[#26272B]">
              {/* Stream or placeholder */}
              {hasPermissions ? (
                <>
                  {/* Main video - screen share when active, camera otherwise */}
                  {isScreenSharing ? (
                    <video
                      ref={setScreenVideoElement}
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      ref={setVideoElement}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Camera PiP overlay when screen sharing */}
                  {isScreenSharing && (
                    <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 w-32 h-32 lg:w-40 lg:h-40 rounded-2xl lg:rounded-3xl overflow-hidden border-2 lg:border-4 border-white/20 shadow-2xl">
                      <video
                        ref={setVideoElement}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-start justify-center px-6 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-start">
                      Camera & Mic <br /> Permissions
                    </h2>
                    <p className="text-white/60 text-base md:text-lg mb-8 text-start max-w-md">
                      Grant permissions and start streaming using your devices.
                    </p>
                    <button
                      onClick={checkAndInitializeCamera}
                      className="px-8 py-4 rounded-full w-full bg-white text-black font-semibold text-base md:text-lg hover:bg-white/90 transition"
                    >
                      Grant permissions
                    </button>
                  </div>
                </div>
              )}

              {/* Go Live Countdown Overlay */}
              <GoLiveCountdown
                isActive={isCountdownActive}
                onComplete={handleCountdownComplete}
              />

              {/* Mobile Chat Overlay - Only on Mobile when streaming */}
              {isStreaming && (
                <div className="lg:hidden absolute bottom-20 left-0 right-0 px-4 pb-4 pointer-events-none">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pointer-events-auto">
                    {chatMessages.slice(-3).map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-black/60 backdrop-blur-md rounded-2xl p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs">
                                {msg.user}
                              </span>
                              {msg.isHost && (
                                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
                                  Host
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/90 break-words">
                              {msg.message} {msg.emoji}
                            </p>
                            {msg.giftText && (
                              <p className="text-[10px] text-white/60 mt-0.5">
                                {msg.giftText}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Bar - Bottom fixed on mobile, centered on desktop */}
          <div className="w-full flex justify-center shrink-0 lg:mt-4 lg:relative absolute bottom-0 left-0 right-0 z-30 lg:bottom-auto pb-6 lg:pb-0">
            <div className="w-full lg:w-auto flex items-center justify-between gap-4 bg-[#131316]/90 lg:bg-[#131316] backdrop-blur-xl lg:backdrop-blur-none lg:rounded-full px-6 py-4 lg:py-3 lg:shadow-[0_8px_20px_rgba(0,0,0,0.25)] lg:max-w-fit">
              {/* Mobile Left Controls - Only visible on mobile */}
              <div className="flex lg:hidden items-center gap-3">
                <button
                  aria-label="Screen share"
                  onClick={() => {
                    if (isScreenSharing) {
                      // Stop screen sharing
                      if (displayStream) {
                        displayStream
                          .getTracks()
                          .forEach((track) => track.stop());
                      }
                      setIsScreenSharing(false);
                      setDisplayStream(null);
                    } else {
                      handleShareScreen();
                    }
                  }}
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-110 ${
                    isScreenSharing
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "hover:bg-white/10"
                  }`}
                >
                  <PiMonitorArrowUp className="w-7 h-7" />
                </button>
                <button
                  aria-label="Settings"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
                >
                  <HiAdjustmentsHorizontal className="w-7 h-7" />
                </button>
              </div>

              {/* Desktop Left Controls - Only visible on desktop */}
              <div className="hidden lg:flex flex-wrap items-center gap-3">
                <button
                  aria-label="Screen share"
                  onClick={() => {
                    if (isScreenSharing) {
                      // Stop screen sharing
                      if (displayStream) {
                        displayStream
                          .getTracks()
                          .forEach((track) => track.stop());
                      }
                      setIsScreenSharing(false);
                      setDisplayStream(null);
                    } else {
                      handleShareScreen();
                    }
                  }}
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-110 ${
                    isScreenSharing
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "hover:bg-white/10"
                  }`}
                >
                  <PiMonitorArrowUp className="w-7 h-7" />
                </button>
                <div className="w-px h-6 bg-white/20"></div>
                <button
                  aria-label="Settings"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
                >
                  <HiAdjustmentsHorizontal className="w-7 h-7" />
                </button>

                <div className="flex items-center gap-2.5 px-2">
                  <HiOutlineSpeakerXMark className="w-6 h-6 text-white/70" />
                  <div
                    className="flex items-center gap-1"
                    aria-hidden="true"
                  >
                    {[...Array(5)].map((_, idx) => (
                      <span
                        key={`vol-${idx}`}
                        className={`h-1 w-4 rounded-full ${
                          idx < volumeSegments ? "bg-orange-500" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 px-2">
                  <HiOutlineMicrophone className="w-6 h-6 text-white/70" />
                  <div
                    className="flex items-center gap-1"
                    aria-hidden="true"
                  >
                    {[...Array(5)].map((_, idx) => (
                      <span
                        key={`mic-${idx}`}
                        className={`h-1 w-4 rounded-full ${
                          idx < micSegments ? "bg-orange-500" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Controls - Status + Go Live (visible on both) */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${isStreaming ? "bg-red-500 animate-pulse" : "bg-gray-500"}`}
                  ></span>
                  {isStreaming ? "Live" : "Offline"}
                </span>
                <button
                  onClick={async () => {
                    if (isStreaming) {
                      // End stream
                      await endStream();
                      setIsStreaming(false);
                      setIsLiveEndedModalOpen(true);
                    } else {
                      handleGoLive();
                    }
                  }}
                  disabled={
                    !hasPermissions ||
                    isCountdownActive ||
                    isCreatingStream ||
                    (!isWalletConnected && !isStreaming)
                  }
                  className={`px-8 py-3 lg:py-2.5 rounded-full font-semibold text-sm transition ${
                    isStreaming
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : !hasPermissions ||
                          isCountdownActive ||
                          isCreatingStream ||
                          !isWalletConnected
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-[#FF9100] text-black hover:bg-[#FF9100]/90"
                  }`}
                >
                  {isCreatingStream
                    ? "Creating..."
                    : isStreaming
                      ? "Stop"
                      : "Go Live"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar - Live Chat */}
        <aside className="hidden lg:flex w-full lg:w-[420px] bg-[#0D0D0D] border border-white/5 rounded-[28px] overflow-hidden flex-col shadow-[0_25px_50px_rgba(0,0,0,0.35)] lg:max-h-full lg:min-h-0">
          {/* Stats Header */}
          <div className="p-5 md:p-6 border-b border-white/5 shrink-0">
            <h2 className="text-xl font-bold mb-4 px-6">Live Chat</h2>
            <div className="flex items-center justify-between text-sm bg-[#0000001F] w-full py-2 px-2">
              <span className="flex items-center gap-1.5">
                <FaBitcoin className="text-orange-500 w-5 h-5" />
                <span className="font-medium">
                  {streamData.stats.sats >= 1000
                    ? `${(streamData.stats.sats / 1000).toFixed(0)}K`
                    : streamData.stats.sats}
                </span>
              </span>
              <div className="w-px h-4 bg-white/20"></div>
              <span className="flex items-center gap-1.5">
                <HiOutlineEye className="w-5 h-5" />
                <span className="font-medium">
                  {streamData.stats.views >= 1000
                    ? `${(streamData.stats.views / 1000).toFixed(0)}k`
                    : streamData.stats.views}
                </span>
              </span>
              <div className="w-px h-4 bg-white/20"></div>
              <span className="flex items-center gap-1.5">
                <HiOutlineGift className="w-5 h-5" />
                <span className="font-medium">{streamData.stats.gifts}</span>
              </span>
              <div className="w-px h-4 bg-white/20"></div>
              <span className="flex items-center gap-1.5">
                <RiHeartsLine className="w-5 h-5" />
                <span className="font-medium">
                  {streamData.stats.subscribers >= 1000000
                    ? `${(streamData.stats.subscribers / 1000000).toFixed(1)}M`
                    : streamData.stats.subscribers >= 1000
                      ? `${(streamData.stats.subscribers / 1000).toFixed(0)}K`
                      : streamData.stats.subscribers}
                </span>
              </span>
            </div>
          </div>

          {/* Gifts & Subscriptions Area */}
          <div className="flex-1 p-5 md:p-6 flex flex-col items-center justify-center text-center gap-4 border-b border-white/5 min-h-0 overflow-y-auto">
            <div className="w-56 h-32 rounded-2xl bg-black flex items-center justify-center">
              <HiOutlineGift className="w-12 h-12 md:w-14 md:h-14 text-white/20" />
            </div>
            <p className="text-white/40 text-sm max-w-[280px]">
              Gift and subscriptions will appear here
            </p>
          </div>

          {/* Chat Messages Area */}
          <div className="p-5 md:p-6 border-b border-white/5 flex-1 overflow-y-auto">
            {isStreaming ? (
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {msg.user}
                        </span>
                        {msg.isHost && (
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                            Host
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/90 break-words">
                        {msg.message} {msg.emoji}
                      </p>
                      {msg.giftText && (
                        <p className="text-xs text-white/60 mt-1">
                          {msg.giftText}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full min-h-[120px] rounded-2xl bg-black flex items-center justify-center px-4 py-6 text-white/40 text-sm">
                Chats would be shown when you start streaming.
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          <div className="p-5 md:p-6 flex flex-col gap-4 shrink-0">
            {/* Comment Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Add Comment..."
                className="w-full bg-transparent border border-white/10 text-white text-sm pl-5 pr-14 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/40"
              />
              <button
                aria-label="Add emoji"
                className="absolute right-2 w-10 h-10 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200"
              >
                <HiOutlineFaceSmile className="w-6 h-6" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                aria-label="Add co-host"
                onClick={() => setIsCoHostModalOpen(true)}
                disabled={!isStreaming}
                className="w-11 h-11 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2A2A2A]"
              >
                <PiUserPlus className="w-6 h-6" />
              </button>
              <button
                aria-label="Mobile view"
                className="w-11 h-11 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-white/10 transition-all duration-200"
              >
                <RiChatOffLine className="w-6 h-6" />
              </button>
              <button
                aria-label="Settings"
                className="w-11 h-11 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-white/10 transition-all duration-200"
              >
                <IoSettingsOutline className="w-6 h-6" />
              </button>
              <button className="px-8 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition">
                Chat
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Stream Settings Modal */}
      <StreamSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfirm={handleSettingsConfirm}
        currentSettings={deviceSettings}
      />

      {/* Scene Selection Modal */}
      <SceneSelectionModal
        isOpen={isSceneSelectionOpen}
        onClose={() => setIsSceneSelectionOpen(false)}
        onConfirm={handleSceneLayoutChange}
        currentLayout={sceneLayout}
      />

      {/* Go Live Countdown Modal */}
      {isCountdownActive && (
        <GoLiveCountdown isActive={isCountdownActive} onComplete={handleCountdownComplete} />
      )}

      {/* Share Screen Modal */}
      <ShareScreenModal
        isOpen={isShareScreenOpen}
        onClose={() => setIsShareScreenOpen(false)}
        onShare={handleShareScreen}
      />

      {/* Share Copied Toast */}
      {showShareCopied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-semibold">Stream link copied!</span>
        </div>
      )}

      {/* Co-Host Modal */}
      <CoHostModal
        isOpen={isCoHostModalOpen}
        onClose={() => setIsCoHostModalOpen(false)}
      />

      {/* Live Ended Modal */}
      <LiveEndedModal
        isOpen={isLiveEndedModalOpen}
        onClose={() => setIsLiveEndedModalOpen(false)}
        onContinue={() => {
          setIsLiveEndedModalOpen(false);
          // Reset stream stats
          setLiveTime(0);
        }}
        stats={endStreamStats}
      />
    </div>
  );
}
