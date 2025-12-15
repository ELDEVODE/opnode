"use client";

import { useState, useEffect } from "react";
import { IoClose, IoNotifications } from "react-icons/io5";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getOrCreateWalletUserId } from "@/lib/userId";
import { useEmbeddedWallet } from "@/components/providers/EmbeddedWalletProvider";
import { useNotificationPanel } from "@/components/providers/NotificationPanelProvider";

export default function NotificationsPanel() {
  const [activeTab, setActiveTab] = useState<"today" | "older">("today");
  const { isOpen, closePanel } = useNotificationPanel();
  
  const { status } = useEmbeddedWallet();
  const isReady = status === "ready";
  
  // Only get userId after mount to avoid SSR issues
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(getOrCreateWalletUserId());
    }
  }, []);

  // Fetch notifications from Convex
  const notifications = useQuery(
    api.users.getNotifications,
    isReady && userId ? { userId, limit: 50 } : "skip"
  );

  const markAsRead = useMutation(api.users.markNotificationsRead);

  const handleMarkAllRead = async () => {
    if (isReady && userId) {
      await markAsRead({ userId });
    }
  };

  if (!isOpen) return null;

  // Separate today vs older notifications (within last 24 hours vs older)
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const todayNotifications =
    notifications?.filter((n) => n.timestamp > oneDayAgo) || [];
  const olderNotifications =
    notifications?.filter((n) => n.timestamp <= oneDayAgo) || [];

  const displayedNotifications =
    activeTab === "today" ? todayNotifications : olderNotifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "gift":
        return "🎁";
      case "follow":
        return "👤";
      case "stream_start":
        return "📺";
      case "mention":
        return "💬";
      case "payment_received":
        return "⚡";
      case "payment_sent":
        return "💸";
      default:
        return "🔔";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closePanel}
        aria-hidden="true"
      />

      <aside className="relative h-full w-full max-w-[480px] bg-[#0B0B10] text-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0B0B10]/90 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-6">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <button
              onClick={closePanel}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 px-6 pb-4">
            <button
              onClick={() => setActiveTab("today")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "today"
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab("older")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "older"
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Older
            </button>
            <button
              onClick={handleMarkAllRead}
              className="ml-auto px-4 py-2 text-sm text-white/60 hover:text-white transition"
            >
              Mark all read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-6 space-y-4">
          {!notifications ? (
            <div className="text-center py-12 text-white/40">
              Loading notifications...
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <IoNotifications className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-2xl border transition ${
                  notification.isRead
                    ? "bg-white/5 border-white/5"
                    : "bg-[#FF9100]/10 border-[#FF9100]/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-1">{notification.title}</h4>
                    <p className="text-sm text-white/70 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-white/40">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#FF9100]" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
