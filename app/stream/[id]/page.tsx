"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MuxPlayer from "@mux/mux-player-react";
import { useState, useEffect, useRef } from "react";
import { IoShareOutline } from "react-icons/io5";
import { HiOutlineGift, HiOutlineEye, HiOutlinePaperAirplane, HiOutlineFaceSmile } from "react-icons/hi2";
import { FaBitcoin } from "react-icons/fa";
import Navbar from "@/components/nav";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useWalletModal } from "@/components/providers/WalletModalProvider";
import { getOrCreateWalletUserId } from "@/lib/userId";
import Image from "next/image";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import GiftModal from "@/components/GiftModal";


// Dynamic import for emoji picker (client-side only)
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function StreamViewPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as Id<"streams">;
  
  const stream = useQuery(api.streams.getStream, { streamId });
  const updateViewers = useMutation(api.streams.updateViewers);
  const addEarnings = useMutation(api.streams.addEarnings);
  
  // Fetch host profile
  const hostProfile = useQuery(
    api.users.getProfile,
    stream ? { userId: stream.hostUserId } : "skip"
  );
  
  // Get host's wallet info for payments
  const hostWallet = useQuery(
    api.users.getProfile,
    stream ? { userId: stream.hostUserId } : "skip"
  );
  
  const messages = useQuery(api.chat.getRecentMessages, { streamId, count: 50 });
  const sendMessage = useMutation(api.chat.sendMessage);
  const sendGift = useMutation(api.chat.sendGift);
  const updateGiftStatus = useMutation(api.chat.updateGiftStatus);
  
  const { status, sdk, publicKey } = useEmbeddedWallet();
  const isWalletConnected = status === "ready";
  const { openModal } = useWalletModal();
  
  const [chatInput, setChatInput] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isProcessingGift, setIsProcessingGift] = useState(false);
  
  // Viewer tracking
  const [viewerCount, setViewerCount] = useState(0);
  const viewerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedRef = useRef(false); // Track if we've already joined

  // Only get userId after mount to avoid SSR issues
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(getOrCreateWalletUserId());
    }
  }, []);
  
  // Fetch current user's profile for chat
  const myProfile = useQuery(
    api.users.getProfile,
    isWalletConnected && userId ? { userId } : "skip"
  );
  
  
  // Viewer count tracking - Poll Mux Data API for real-time counts
  useEffect(() => {
    if (!stream?.muxPlaybackId || !stream.isLive) {
      setViewerCount(0);
      return;
    }

    // Fetch viewer count from Mux Data API
    const fetchViewerCount = async () => {
      try {
        const response = await fetch(
          `/api/mux/viewers?playbackId=${stream.muxPlaybackId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const count = data.viewers || 0;
          setViewerCount(count);
          
          // Also update Convex database for consistency
          await updateViewers({ streamId, viewers: count }).catch(console.error);
        }
      } catch (error) {
        console.error("Failed to fetch viewer count:", error);
      }
    };

    // Initial fetch
    fetchViewerCount();

    // Poll every 15 seconds for live updates
    viewerIntervalRef.current = setInterval(fetchViewerCount, 15000);

    return () => {
      if (viewerIntervalRef.current) {
        clearInterval(viewerIntervalRef.current);
      }
    };
  }, [stream?.muxPlaybackId, stream?.isLive, streamId]);
  
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
  
  // Chat auto-scroll
  const chatEndRef = useRef<HTMLDivElement>(null);
 const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Redirect host to broadcast page if they visit their own stream
  useEffect(() => {
    if (stream && userId && stream.hostUserId === userId) {
      console.log("Host detected, redirecting to broadcast page...");
      router.push("/stream-obs");
    }
  }, [stream, userId, router]);

  // Optimistic UI for chat
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !isWalletConnected || !userId || !myProfile) return;

    // Store message for optimistic UI
    const messageText = chatInput;
    setOptimisticMessage(messageText);
    setChatInput("");

    try {
      await sendMessage({
        streamId,
        userId,
        username: myProfile.username || userId.substring(0, 8),
        userAvatar: myProfile.avatarUrl,
        message: messageText,
        isHost: stream?.hostUserId === userId,
      });
      // Clear optimistic message after successful send
      setTimeout(() => setOptimisticMessage(null), 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message on error
      setChatInput(messageText);
      setOptimisticMessage(null);
    }
  };

  const handleSendGift = async (giftAmount: number) => {
    if (!isWalletConnected || !stream || !myProfile || isProcessingGift) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!sdk) {
      toast.error("Wallet not ready. Please try again.");
      return;
    }
    
    // Check if host has a public key to receive payments
    if (!hostProfile?.publicKey && !hostWallet?.publicKey) {
      toast.error("Streamer hasn't set up their wallet to receive gifts yet.");
      return;
    }

    setIsProcessingGift(true);
    
    let giftId: any = null;
    
    try {
      console.log("Sending Lightning gift:", { 
        amount: giftAmount, 
        toUser: stream.hostUserId,
      });
      
      // Step 1: Generate invoice from streamer's wallet (server-side)
      toast.info("Preparing gift payment...");
      
      const invoiceResponse = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: stream.hostUserId,
          amountSats: giftAmount,
        }),
      });

      if (!invoiceResponse.ok) {
        const error = await invoiceResponse.json();
        throw new Error(error.error || "Failed to generate invoice");
      }

      const { invoice } = await invoiceResponse.json();
      console.log("Generated invoice for streamer:", invoice);

      // Step 2: Parse and prepare payment
      const parsed = await sdk.parse(invoice);
      console.log("Parsed invoice:", parsed);

      if (parsed.type !== "bolt11Invoice") {
        throw new Error("Invalid invoice type");
      }

      // Step 3: Prepare payment
      toast.info(`Sending ${giftAmount} sats as a gift...`);
      
      const prepareResponse = await sdk.prepareSendPayment({
        paymentRequest: invoice,
      });

      console.log("Payment prepared:", prepareResponse);

      // Step 4: Send the payment
      const paymentResult = await sdk.sendPayment({
        prepareResponse,
      });

      const payment = paymentResult.payment as any;
      const paymentHash = payment.id || payment.paymentHash || payment.hash;
      
      console.log("Payment sent successfully:", paymentResult);

      // Step 5: Create gift record with real payment hash
      giftId = await sendGift({
        streamId,
        fromUserId: userId!,
        fromUsername: myProfile.username || userId!.substring(0, 8),
        toUserId: stream.hostUserId,
        amountSats: giftAmount,
        giftType: "gift",
        paymentHash,
      });

      
      // Update gift status to completed
      if (giftId) {
        await updateGiftStatus({
          giftId,
          status: "completed",
        });
      }
      
      // Update stream earnings
      await addEarnings({
        streamId,
        amountSats: giftAmount,
      });

      // Show success
      toast.success(`⚡ Successfully sent ${giftAmount} sats gift!`);
      setShowGiftModal(false);
      
    } catch (error: any) {
      console.error("Gift payment failed:", error);
      
      // Update gift status to failed if we created a record
      if (giftId) {
        await updateGiftStatus({
          giftId,
          status: "failed",
        }).catch(console.error);
      }
      
      const errorMessage = error?.message || "Failed to send gift. Please try again.";
      toast.error(`Payment failed: ${errorMessage}`);
    } finally {
      setIsProcessingGift(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  if (!stream) {
    return (
      <div className="h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        <div className="text-xl">Loading stream...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0F0F0F] text-white flex flex-col overflow-hidden">
      <div className="block sticky top-0 z-50 shrink-0">
        <Navbar />
      </div>

      <main className="flex-1 w-full lg:px-4 lg:pb-6 flex flex-col lg:flex-row lg:gap-6 overflow-hidden min-h-0">
        {/* Video Player Section */}
        <section className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Stream Header */}
          <div className="flex items-center justify-between gap-4 bg-[#131316] px-6 py-4 rounded-none lg:rounded-[10px]">
            <div>
              <h1 className="text-xl font-bold">{stream.title}</h1>
              <div className="flex gap-2 mt-2">
                {stream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF9100] text-black rounded-full font-semibold hover:bg-[#FF9100]/90 transition"
            >
              <IoShareOutline className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Mux Player */}
          <div className="flex-1 bg-black rounded-none lg:rounded-[14px] overflow-hidden relative">
            {stream.muxPlaybackId ? (
              <>
                <MuxPlayer
                  streamType="live"
                  playbackId={stream.muxPlaybackId}
                  metadata={{
                    video_title: stream.title,
                    viewer_user_id: userId || "anonymous",
                  }}
                  primaryColor="#FF9100"
                  secondaryColor="#FFFFFF"
                />
                {!stream.isLive && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="text-6xl mb-4">📡</div>
                      <h3 className="text-xl font-bold mb-2">Stream Starting Soon</h3>
                      <p className="text-white/60">The broadcaster is setting up. Check back in a moment!</p>
                    </div>
                  </div>
                )}
                
                {/* Create Account Overlay - Shows when not connected */}
                {!isWalletConnected && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 shadow-2xl max-w-sm backdrop-blur-sm border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">⚡</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">Join the conversation!</h4>
                          <p className="text-white/90 text-sm mb-3">Create an account to chat and send sats to the streamer.</p>
                          <button
                            onClick={openModal}
                            className="w-full px-4 py-2 bg-white text-black rounded-full font-semibold text-sm hover:bg-white/90 transition"
                          >
                            Create Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-[#1A1A1F]">
                <div className="text-center px-6">
                  <div className="text-6xl mb-4">🎥</div>
                  <h3 className="text-xl font-bold mb-2">Setting Up Stream</h3>
                  <p className="text-white/60">The stream is being configured...</p>
                </div>
              </div>
            )}
          </div>

          {/* Stream Stats */}
          <div className="flex items-center gap-6 px-6 py-4 bg-[#131316] rounded-[10px]">
            <div className="flex items-center gap-2">
              <HiOutlineEye className="w-5 h-5" />
              <span className="font-semibold">{viewerCount || stream.viewers || 0}</span>
              <span className="text-white/60">viewers</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBitcoin className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">{stream.totalEarnings?.toLocaleString() || 0}</span>
              <span className="text-white/60">sats</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineGift className="w-5 h-5" />
              <span className="font-semibold">{stream.totalGifts || 0}</span>
              <span className="text-white/60">gifts</span>
            </div>
          </div>
        </section>

        {/* Chat Sidebar */}
        <aside className="flex w-full lg:w-[420px] bg-[#0D0D0D] border border-white/5 rounded-none lg:rounded-[28px] overflow-hidden flex-col">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold">Live Chat</h2>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages?.map((msg) => (
              msg.isGift ? (
                <div
                  key={msg._id}
                  className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3"
                >
                  {msg.userAvatar ? (
                    <Image
                      src={msg.userAvatar}
                      alt={msg.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {msg.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{msg.username}</span>
                      {msg.isHost && (
                        <span className="px-2 py-0.5 bg-white text-black text-xs rounded font-semibold">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/90">{msg.message}</p>
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
                  {msg.userAvatar ? (
                    <Image
                      src={msg.userAvatar}
                      alt={msg.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {msg.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">{msg.username}</span>
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
            ))}
            
            {/* Optimistic message (shown while sending) */}
            {optimisticMessage && (
              <div className="flex gap-3 p-3 rounded-2xl bg-white/5 opacity-60">
                {myProfile?.avatarUrl ? (
                  <Image
                    src={myProfile.avatarUrl}
                    alt={myProfile.username || "You"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {myProfile?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {myProfile?.username || userId?.substring(0, 8)}
                    </span>
                    <span className="text-xs text-white/40">Sending...</span>
                  </div>
                  <p className="text-sm">{optimisticMessage}</p>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2 items-end">
              <button
                onClick={() => setShowGiftModal(true)}
                disabled={!isWalletConnected}
                className="p-3 bg-orange-500 rounded-full hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <HiOutlineGift className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={isWalletConnected ? "Add Comment..." : "Connect wallet to chat"}
                  disabled={!isWalletConnected}
                  className="w-full bg-transparent border border-white/10 text-white pl-4 pr-12 py-3 rounded-full focus:outline-none focus:border-orange-500 disabled:opacity-50 placeholder:text-white/40"
                />
                {/* Emoji Picker Button - Inside Input */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 hover:bg-white/10 rounded-full transition"
                    type="button"
                    disabled={!isWalletConnected}
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
                disabled={!isWalletConnected || !chatInput.trim()}
                className="p-3 bg-orange-500 hover:bg-orange-600 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                aria-label="Send message"
              >
                <HiOutlinePaperAirplane className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1F1F25] rounded-3xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Share Stream</h3>
            <p className="text-white/60 mb-6">
              Copy the link below to share this live stream
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm"
              />
              <button
                onClick={copyShareLink}
                className="px-6 py-3 bg-[#FF9100] text-black rounded-lg font-semibold hover:bg-[#FF9100]/90"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      <GiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        onSendGift={handleSendGift}
        hostUsername={hostProfile?.username}
        isProcessing={isProcessingGift}
      />
    </div>
  );
}
