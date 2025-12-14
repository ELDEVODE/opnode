# OPNode Development Testing Guide

## Quick Start

### 1. Start Development Environment
```bash
# Terminal 1: Convex Backend
bunx convex dev

# Terminal 2: Next.js Frontend  
bun dev
```

### 2. Create Test Data
Visit: `http://localhost:3000/api/dev/seed-streams`

This creates 3 test streams in your Convex database.

### 3. Test Checklist

#### ✅ Wallet Integration
- [ ] Open app at `http://localhost:3000`
- [ ] Click "Connect Wallet" button
- [ ] Verify wallet connects and shows real balance (starts at 0)
- [ ] Open wallet drawer (click balance component)
- [ ] Verify payment history section displays

#### ✅ Stream Discovery
- [ ] Navigate to `/dashboard`
- [ ] Verify test streams appear in feed
- [ ] Click on different category filters
- [ ] Click on a stream card
- [ ] Verify redirects to `/stream/[id]`

#### ✅ Stream Viewing
- [ ] On stream page, verify Mux player placeholder shows
- [ ] Check real-time stats display (viewers, earnings, gifts)
- [ ] Click "Share" button
- [ ] Copy link from modal
- [ ] Test chat input (requires wallet connection)

#### ✅ Notifications
- [ ] Click notification bell icon in navbar
- [ ] Verify panel slides in from right
- [ ] Check "Today" and "Older" tabs
- [ ] Click "Mark all read" button
- [ ] Close panel by clicking X or backdrop

#### ✅ Real-time Features
- [ ] Open stream in two browser windows
- [ ] Send chat message from one
- [ ] Verify appears in both (Convex real-time)

---

## Testing Actual Streaming

### Create Your First Live Stream

1. **Grant Permissions**
   - Navigate to `/stream`
   - Click "Go Live"
   - Grant camera/microphone access

2. **Configure Stream**
   - Enter title (e.g., "My First OPNode Stream")
   - Add tags (e.g., ["test", "bitcoin", "live"])
   - Select category

3. **Start Broadcast**
   - Click "Start Streaming"
   - App creates Mux stream via `/api/stream/create`
   - Stream key generated and encrypted
   - Mux Player initialized

4. **Verify Stream**
   - Open `/dashboard` in another browser
   - Your stream should appear with "LIVE" badge
   - Click to view
   - Send test chat messages

5. **End Stream**
   - Click "Stop Stream" button
   - Verify final stats modal appears
   - Check Convex dashboard for saved data

---

## Troubleshooting

### No Streams Showing
- Run seed endpoint: `/api/dev/seed-streams`
- Check Convex dashboard for data
- Verify `bunx convex dev` is running

### Notification Panel Not Opening
- ✅ **FIXED** - Now uses provider hook correctly

### Wallet Balance Shows "..."
- Breez SDK still syncing
- Check browser console for errors
- Verify wallet connection status

### Mux Player Shows "Stream not yet started"
- Normal for test streams (no real Mux stream created)
- To test real streaming, use "Go Live" flow
- Verify Mux credentials in `.env.local`

---

## Environment Variables Needed

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_EMBEDDED_WALLET_KEY=your-secret-key

# Mux (for live streaming)
MUX_TOKEN_ID=your-mux-token-id
MUX_TOKEN_SECRET=your-mux-token-secret
```

---

## Key Endpoints

### API Routes
- `POST /api/stream/create` - Create Mux + Convex stream
- `POST /api/stream/start` - Mark stream as live
- `POST /api/stream/end` - End stream, get final stats
- `GET /api/dev/seed-streams` - Create test data

### Convex Webhooks (Production)
- `/muxWebhook` - Mux stream status updates
- `/paymentWebhook` - Lightning payment notifications

---

## What's Working

✅ Real-time Convex queries
✅ Wallet balance from Breez SDK
✅ Stream discovery and navigation
✅ Notifications panel
✅ Chat interface
✅ Share functionality
✅ Payment history display
✅ Stream stats tracking

## What Needs Completion

🟡 Lightning invoice generation
🟡 Real broadcast setup (camera → Mux)
🟡 Production webhook configuration

---

## Success Indicators

🎯 **Platform is working when:**
- Streams appear in dashboard feed
- Clicking stream opens view page
- Notifications panel slides in/out
- Wallet shows real balance
- Chat messages can be typed
- Share modal copies link

---

## Next Steps

1. ✅ Test notification panel (FIXED)
2. Test stream creation flow
3. Implement Lightning invoices
4. Test with real Mux credentials
5. Deploy to production
6. Configure webhooks

**Happy streaming! 🎥⚡**
