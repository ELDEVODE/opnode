"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { usePrepStream } from "@/components/providers/PrepStreamProvider";
import { getOrCreateWalletUserId } from "@/lib/userId";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  HiX,
  HiOutlineEye,
  HiOutlineGift,
  HiOutlineUserGroup,
} from "react-icons/hi";
import {
  HiOutlineMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiOutlinePaperAirplane,
  HiOutlineFaceSmile,
} from "react-icons/hi2";
import { PiPencilSimple, PiUserPlus, PiDevices } from "react-icons/pi";
import { FaBitcoin } from "react-icons/fa";
import { RiChatOffLine, RiHeartsLine } from "react-icons/ri";
import { IoShareOutline, IoSettingsOutline } from "react-icons/io5";
import { FiCopy, FiCheck } from "react-icons/fi";
import Navbar from "@/components/nav";
import CoHostModal from "@/components/CoHostModal";
import LiveEndedModal from "@/components/LiveEndedModal";
import StreamSettingsModal from "@/components/StreamSettingsModal";
import SceneSelectionModal from "@/components/SceneSelectionModal";

// Dynamic import for emoji picker (client-side only)
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function StreamOBSPage() {
  // Wallet and user
  const { status } = useEmbeddedWallet();
  const isWalletConnected = status === "ready";
  const router = useRouter();

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
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [rtmpUrl, setRtmpUrl] = useState<string | null>(null);

  // UI state
  const [isStreaming, setIsStreaming] = useState(false);
  const [showShareCopied, setShowShareCopied] = useState(false);
  const [isCoHostModalOpen, setIsCoHostModalOpen] = useState(false);
  const [isLiveEndedModalOpen, setIsLiveEndedModalOpen] = useState(false);
  const [liveTime, setLiveTime] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [sceneLayout, setSceneLayout] = useState<"chat" | "general">("chat");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Chat functionality
  const sendMessage = useMutation(api.chat.sendMessage);
  const [isSceneSelectionOpen, setIsSceneSelectionOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Mux viewer tracking
  const [muxViewers, setMuxViewers] = useState<number | null>(null);
  const muxViewerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        category: "Live",
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
  
  // Check for existing active stream
  const activeStream = useQuery(
    api.streams.getActiveStream,
    isWalletConnected && userId ? { userId } : "skip"
  );

  // Mutations
  const updateStreamDetails = useMutation(api.streams.updateStreamDetails);

  // Use real stream data or defaults
  const streamData = currentStream
    ? {
        title: currentStream.title,
        thumbnail: "/images/500l.png",
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

  // Chat messages (will come from Convex in real implementation)
  const chatMessages =
    useQuery(
      api.chat.getRecentMessages,
      streamSessionId ? { streamId: streamSessionId, count: 50 } : "skip"
    ) || [];

  // Create stream session with Mux
  const createStreamSession = async () => {
    if (!isWalletConnected || isCreatingStream) return;

    setIsCreatingStream(true);
    try {
      const response = await fetch("/api/stream/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: streamMetadata.title,
          description: "OBS Live stream",
          tags: streamMetadata.tags,
          category: streamMetadata.category,
          thumbnailStorageId: prepStreamMetadata?.thumbnailStorageId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create stream");
      }

      const data = await response.json();
      setStreamSessionId(data.streamId);
      setMuxPlaybackId(data.muxPlaybackId);
      
      // Show message if stream was reused
      if (data.reused) {
        console.log("✅ Reusing existing stream - your OBS configuration remains the same!");
      }
      
      // Reset viewer count to 0 when creating stream
      if (data.streamId) {
        await fetch("/api/stream/reset-viewers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streamId: data.streamId }),
        }).catch(console.error);
      }

      // Get stream key
      const keyResponse = await fetch("/api/stream/get-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId: data.streamId,
          userId,
        }),
      });

      if (keyResponse.ok) {
        const keyData = await keyResponse.json();
        setStreamKey(keyData.streamKey);
        setRtmpUrl(keyData.rtmpUrl);
      }

      console.log("Stream session created:", data);
    } catch (error) {
      console.error("Error creating stream:", error);
      alert("Failed to create stream. Please try again.");
    } finally {
      setIsCreatingStream(false);
    }
  };
  
  // Handle sending chat messages
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !streamSessionId || !userId || !userProfile) return;
    
    const messageText = chatInput;
    setChatInput("");
    
    try {
      await sendMessage({
        streamId: streamSessionId,
        userId,
        username: userProfile.username || userId.substring(0, 8),
        userAvatar: userProfile.avatarUrl,
        message: messageText,
        isHost: true,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatInput(messageText); // Restore on error
    }
  };

  // Start stream (mark as live)
  const startStream = async () => {
    if (!streamSessionId) return;

    try {
      const response = await fetch("/api/stream/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId: streamSessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start stream");
      }

      setIsStreaming(true);
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

      if (data.finalStats) {
        setEndStreamStats({
          viewers: data.finalStats.viewers.toString(),
          followers: userProfile?.followers || 0,
          earnings: data.finalStats.totalEarnings / 1000,
          gifts: data.finalStats.totalGifts,
          streamDuration: formatDuration(liveTime),
          streamedTime: `${Math.floor(liveTime / 60)}m`,
        });
      }

      setIsStreaming(false);
      setLiveTime(0);
      setIsLiveEndedModalOpen(true);

      // Clear stream session after showing stats
      setTimeout(() => {
        setStreamSessionId(null);
        setStreamKey(null);
        setRtmpUrl(null);
        setMuxPlaybackId(null);
      }, 500);
    } catch (error) {
      console.error("Error ending stream:", error);
      alert("Failed to end stream. Please try again.");
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Title editing handlers
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/stream/${streamSessionId}`;
    navigator.clipboard.writeText(shareUrl);
    setShowShareCopied(true);
    setTimeout(() => setShowShareCopied(false), 2000);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setLiveTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-create stream session on mount if we have metadata
  useEffect(() => {
    if (isWalletConnected && userId && prepStreamMetadata && !streamSessionId) {
      createStreamSession();
    }
  }, [isWalletConnected, userId, prepStreamMetadata]);
  
  // Auto-load existing active stream if found
  useEffect(() => {
    if (!activeStream || streamSessionId) return;
    
    // Found an existing active stream, load it
    console.log("Found existing active stream:", activeStream._id);
    setStreamSessionId(activeStream._id);
    setMuxPlaybackId(activeStream.muxPlaybackId || null);
    
    // Set stream metadata from existing stream
    setStreamMetadata({
      title: activeStream.title,
      category: activeStream.category,
      tags: activeStream.tags,
      thumbnailUrl: "/images/500l.png",
    });
    
    // Mark as streaming if already live
    if (activeStream.isLive) {
      setIsStreaming(true);
    }
    
    // Fetch stream key for this stream
    if (userId) {
      fetch("/api/stream/get-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId: activeStream._id,
          userId,
        }),
      })
        .then(r => r.json())
        .then(data => {
          setStreamKey(data.streamKey);
          setRtmpUrl(data.rtmpUrl);
        })
        .catch(console.error);
    }
  }, [activeStream, streamSessionId, userId]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Poll Mux for real viewer data when streaming
  useEffect(() => {
    if (!isStreaming || !currentStream?.muxStreamId) {
      // Clear interval if not streaming
      if (muxViewerIntervalRef.current) {
        clearInterval(muxViewerIntervalRef.current);
        muxViewerIntervalRef.current = null;
      }
      setMuxViewers(null);
      return;
    }
    
    // Function to fetch Mux viewer data
    const fetchMuxViewers = async () => {
      try {
        const response = await fetch("/api/stream/mux-viewers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liveStreamId: currentStream.muxStreamId }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setMuxViewers(data.currentViewers);
          
          // Note: Database viewer sync is disabled since Mux API is not configured
        }
      } catch (error) {
        console.error("Failed to fetch Mux viewers:", error);
      }
    };
    
    // Initial fetch
    fetchMuxViewers();
    
    // Poll every 30 seconds for real-time data
    muxViewerIntervalRef.current = setInterval(fetchMuxViewers, 30000);
    
    return () => {
      if (muxViewerIntervalRef.current) {
        clearInterval(muxViewerIntervalRef.current);
      }
    };
  }, [isStreaming, currentStream?.muxStreamId, streamSessionId]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="block sticky top-0 z-50">
        <Navbar />
      </div>

      <main className="w-full lg:px-4 lg:pb-6 flex flex-col lg:flex-row lg:gap-6">
        {/* Main Content - OBS Instructions & Chat */}
        <div className="flex-1 flex flex-col gap-4 lg:gap-6">
          {/* Stream Header */}
          <div className="bg-[#131316] px-4 lg:px-6 py-4 lg:rounded-[10px]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:border-[#FF9100]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="px-4 py-2 bg-[#FF9100] text-black rounded-lg font-semibold hover:bg-[#FF9100]/90"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditTitle}
                      className="px-4 py-2 bg-white/10 rounded-lg font-semibold hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h1 className="text-xl lg:text-2xl font-bold truncate">
                    {streamData.title}
                  </h1>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {streamData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label="Edit stream"
                  onClick={handleEditTitle}
                  disabled={isEditingTitle}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PiPencilSimple className="w-7 h-7" />
                </button>

                <button
                  onClick={handleShare}
                  disabled={!streamSessionId}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF9100] text-black rounded-full font-semibold hover:bg-[#FF9100]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IoShareOutline className="w-5 h-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                {isStreaming && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-sm">Live</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-[#131316] p-4 lg:rounded-[14px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSceneSelectionOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition"
              >
                <PiDevices className="w-5 h-5" />
                <span className="text-sm font-medium">Scenes</span>
              </button>

              <button
                onClick={() => setIsCoHostModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition"
              >
                <PiUserPlus className="w-5 h-5" />
                <span className="text-sm font-medium">Co-host</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition"
              >
                <IoSettingsOutline className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>

          {/* OBS Setup Instructions */}
          <div className="bg-[#131316] p-6 lg:rounded-[14px]">
            <h2 className="text-2xl font-bold mb-4">OBS Studio Setup</h2>

            {!streamSessionId ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚙️</div>
                {activeStream ? (
                  <>
                    <p className="text-white/60 mb-4">
                      Loading your active stream...
                    </p>
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9100]"></div>
                  </>
                ) : (
                  <>
                    <p className="text-white/60 mb-4">
                      Initializing stream session...
                    </p>
                    <button
                      onClick={createStreamSession}
                      disabled={isCreatingStream}
                      className="px-6 py-3 bg-[#FF9100] text-black rounded-full font-semibold hover:bg-[#FF9100]/90 disabled:opacity-50"
                    >
                      {isCreatingStream ? "Creating..." : "Create Stream"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stream Key Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-white/60">
                      RTMP Server URL
                    </label>
                    <button
                      onClick={() => copyToClipboard(rtmpUrl || "", "rtmp")}
                      className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
                    >
                      {copiedField === "rtmp" ? (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm break-all">
                    {rtmpUrl || "Loading..."}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-white/60">
                      Stream Key
                    </label>
                    <button
                      onClick={() => copyToClipboard(streamKey || "", "key")}
                      className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
                    >
                      {copiedField === "key" ? (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm break-all blur-sm hover:blur-none transition cursor-pointer">
                    {streamKey || "Loading..."}
                  </div>
                  <p className="text-xs text-white/40">
                    ⚠️ Keep your stream key private. Hover to reveal.
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-black/20 border border-white/10 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-[#FF9100]">
                    Setup Instructions:
                  </h3>
                  <ol className="space-y-2 text-sm text-white/80 list-decimal list-inside">
                    <li>Open OBS Studio</li>
                    <li>Go to Settings → Stream</li>
                    <li>Select "Custom" as Service</li>
                    <li>Copy the RTMP Server URL above and paste it</li>
                    <li>Copy the Stream Key above and paste it</li>
                    <li>Click "Start Streaming" in OBS</li>
                    <li>Click "Go Live" button below once OBS is streaming</li>
                  </ol>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  {!isStreaming ? (
                    <>
                      <button
                        onClick={startStream}
                        className="flex-1 px-6 py-4 bg-[#FF9100] text-black rounded-full font-bold text-lg hover:bg-[#FF9100]/90 transition"
                      >
                        Go Live
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to close this stream session? You'll need to create a new one to stream again."
                            )
                          ) {
                            setStreamSessionId(null);
                            setStreamKey(null);
                            setRtmpUrl(null);
                            setMuxPlaybackId(null);
                          }
                        }}
                        className="px-6 py-4 bg-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/20 transition"
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={endStream}
                      className="flex-1 px-6 py-4 bg-red-500 text-white rounded-full font-bold text-lg hover:bg-red-600 transition"
                    >
                      End Stream
                    </button>
                  )}
                </div>

                {/* Live Stats */}
                {isStreaming && (
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {streamData.stats.views}
                      </div>
                      <div className="text-xs text-white/60">Viewers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {streamData.stats.sats}
                      </div>
                      <div className="text-xs text-white/60">Sats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {streamData.stats.gifts}
                      </div>
                      <div className="text-xs text-white/60">Gifts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatDuration(liveTime)}
                      </div>
                      <div className="text-xs text-white/60">Duration</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        <aside className="w-full lg:w-96 bg-[#0D0D0D] lg:rounded-[28px] flex flex-col h-[calc(100vh-120px)] lg:sticky lg:top-20 overflow-hidden border border-white/5">
          {/* Stats Header */}
          <div className="p-6 border-b border-white/5">
            <h2 className="font-bold text-xl mb-4">Live Chat</h2>
            {isStreaming && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <FaBitcoin className="text-orange-500 w-5 h-5" />
                  <span className="font-bold text-base">
                    {streamData.stats.sats >= 1000
                      ? `${(streamData.stats.sats / 1000).toFixed(0)}K`
                      : streamData.stats.sats}
                  </span>
                </span>
                <div className="w-px h-4 bg-white/20"></div>
                <span className="flex items-center gap-1.5">
                  <HiOutlineEye className="w-5 h-5" />
                  <span className="font-bold text-base">
                    {/* Use Mux viewers if available, otherwise use database */}
                    {muxViewers !== null ? muxViewers : (currentStream?.viewers || 0)}
                    {muxViewers !== null && (
                      <span className="text-xs text-green-400 ml-1" title="Real-time from Mux">●</span>
                    )}
                  </span>
                </span>
                <div className="w-px h-4 bg-white/20"></div>
                <span className="flex items-center gap-1.5">
                  <HiOutlineGift className="w-5 h-5" />
                  <span className="font-bold text-base">
                    {streamData.stats.gifts}
                  </span>
                </span>
                <div className="w-px h-4 bg-white/20"></div>
                <span className="flex items-center gap-1.5">
                  <RiHeartsLine className="w-5 h-5" />
                  <span className="font-bold text-base">
                    {streamData.stats.subscribers >= 1000
                      ? `${(streamData.stats.subscribers / 1000).toFixed(1)}M`
                      : streamData.stats.subscribers}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatMessages.length === 0 ? (
              <div className="text-center text-white/40 py-8">
                <RiChatOffLine className="w-12 h-12 mx-auto mb-2" />
                <p>No messages yet</p>
                <p className="text-sm">Start streaming to see chat!</p>
              </div>
            ) : (
              chatMessages.map((msg: any) => (
                msg.isGift ? (
                  <div
                    key={msg._id}
                    className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10"
                  >
                    <Image
                      src={msg.userAvatar || "/images/default-avatar.png"}
                      alt={msg.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {msg.username}
                      </div>
                      <p className="text-sm text-white/70">{msg.message}</p>
                    </div>
                    {msg.giftAmount && (
                      <div className="text-2xl">🎁</div>
                    )}
                  </div>
                ) : (
                  <div
                    key={msg._id}
                    className="flex gap-3 p-3 hover:bg-white/5 rounded-2xl transition"
                  >
                    <Image
                      src={msg.userAvatar || "/images/default-avatar.png"}
                      alt={msg.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm truncate">
                          {msg.username}
                        </span>
                        {msg.isHost && (
                          <span className="px-2 py-0.5 bg-white text-black text-xs rounded font-semibold shrink-0">
                            Host
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/90 break-words">{msg.message}</p>
                    </div>
                  </div>
                )
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Add Comment..."
                  disabled={!streamSessionId}
                  aria-label="Chat message input"
                  className="w-full bg-transparent border border-white/10 text-white pl-4 pr-12 py-3 rounded-full focus:outline-none focus:border-[#FF9100] disabled:opacity-50 placeholder:text-white/40"
                />
                {/* Emoji Picker Button - Inside Input */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 hover:bg-white/10 rounded-full transition"
                    type="button"
                  >
                    <HiOutlineFaceSmile className="w-5 h-5 text-white/60 hover:text-white" />
                  </button>
                  
                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setChatInput(prev => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        theme={"dark" as any}
                        width={320}
                        height={400}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Send Button - Outside */}
              <button
                onClick={handleSendMessage}
                disabled={!streamSessionId || !chatInput.trim()}
                className="p-3 bg-[#FF9100] hover:bg-[#FF9100]/90 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <HiOutlinePaperAirplane className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Modals */}
      <CoHostModal
        isOpen={isCoHostModalOpen}
        onClose={() => setIsCoHostModalOpen(false)}
      />
      <LiveEndedModal
        isOpen={isLiveEndedModalOpen}
        onClose={() => {
          setIsLiveEndedModalOpen(false);
          router.push("/dashboard");
        }}
        onContinue={() => {
          setIsLiveEndedModalOpen(false);
          // Reset for new stream
          setStreamSessionId(null);
          setStreamKey(null);
          setRtmpUrl(null);
          setMuxPlaybackId(null);
          clearStreamMetadata();
        }}
        stats={endStreamStats}
      />
      <StreamSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfirm={() => setIsSettingsOpen(false)}
        currentSettings={{
          microphone: "",
          speaker: "",
          camera: "",
          micVolume: 60,
          speakerVolume: 60,
        }}
      />
      <SceneSelectionModal
        isOpen={isSceneSelectionOpen}
        onClose={() => setIsSceneSelectionOpen(false)}
        onConfirm={(layout) => {
          setSceneLayout(layout);
          setIsSceneSelectionOpen(false);
        }}
        currentLayout={sceneLayout}
      />

      {/* Share Copied Toast */}
      {showShareCopied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-70 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <FiCheck className="w-5 h-5" />
          <span className="font-semibold">Share link copied!</span>
        </div>
      )}
    </div>
  );
}
