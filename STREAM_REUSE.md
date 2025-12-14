# Stream Reuse Feature

## Overview
The stream reuse feature automatically reuses existing inactive streams to avoid creating unnecessary Mux live streams, helping you stay within your Mux plan limits and maintaining the same RTMP URL/stream key for OBS.

## How It Works

### Automatic Stream Reuse
When a user clicks "Go Live" or creates a new stream:

1. **Check for Reusable Streams**
   - System checks if the user has any previous inactive streams
   - Looks for streams that have Mux credentials already configured
   - Finds the most recent inactive stream

2. **Reuse or Create**
   - **If reusable stream found**: 
     - Resets metadata (title, description, tags, stats)
     - Keeps Mux stream ID, playback ID, and stream key intact
     - User can use the same OBS configuration
   - **If no reusable stream**:
     - Creates a new Mux live stream
     - Generates new RTMP URL and stream key

### What Gets Reset
When reusing a stream:
- ✅ Title and description
- ✅ Tags and category
- ✅ Thumbnail
- ✅ Viewer count, earnings, and gift stats
- ✅ Timestamps (createdAt, startedAt, endedAt)

### What Gets Preserved
- ✅ **Mux Stream ID** - Same underlying Mux stream
- ✅ **Mux Playback ID** - Same viewing URL
- ✅ **Stream Key** - Same RTMP credentials for OBS
- ✅ **RTMP URL** - Same server endpoint

## Benefits

### 1. Cost Savings
- Reduces number of Mux live streams created
- Helps stay within Mux plan limits
- No need to clean up old streams manually

### 2. Better UX for Streamers
- **No OBS Reconfiguration Needed**
  - RTMP URL stays the same
  - Stream key remains unchanged
  - One-time OBS setup

### 3. Faster Stream Setup
- Reusing is faster than creating new Mux streams
- No API calls to Mux needed
- Instant stream session ready

## Technical Implementation

### Backend Files Modified

**`/app/api/stream/create/route.ts`**
```typescript
// 1. Check for existing inactive streams
const existingStreams = await convex.query(api.streams.getUserStreams, { userId });

// 2. Find most recent reusable stream
const reusableStream = existingStreams
  .filter((stream) => !stream.isLive && stream.muxStreamId && stream.muxPlaybackId)
  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];

// 3. Reuse if found, otherwise create new
if (reusableStream) {
  await convex.mutation(api.streams.resetStreamForReuse, {...});
  return { streamId, muxStreamId, muxPlaybackId, reused: true };
}
```

**`/convex/streams.ts`**
- Added `resetStreamForReuse` mutation
- Resets all user-visible data while preserving Mux credentials

### Frontend Integration

**`/app/stream-obs/page.tsx`**
```typescript
const data = await response.json();

if (data.reused) {
  console.log("✅ Reusing existing stream - your OBS configuration remains the same!");
}
```

## Stream Lifecycle

### First Stream
```
User clicks "Go Live"
  ↓
No existing streams
  ↓
Create new Mux stream
  ↓
Generate RTMP URL + Key
  ↓
User configures OBS
  ↓
Stream ends
```

### Subsequent Streams
```
User clicks "Go Live" again
  ↓
Found inactive stream
  ↓
Reuse existing Mux stream
  ↓
Same RTMP URL + Key
  ↓
OBS already configured ✅
  ↓
Start streaming immediately
```

## User Experience

### For New Streamers
1. First stream: Configure OBS with RTMP URL and key
2. End stream when done
3. Next stream: Just click "Go Live" and start streaming
4. **No need to reconfigure OBS ever again!**

### Console Messages
- New stream: `"Creating new stream for user [userId]"`
- Reused stream: `"Reusing stream [streamId] for user [userId]"`
- Client side: `"✅ Reusing existing stream - your OBS configuration remains the same!"`

## API Response

### New Stream
```json
{
  "success": true,
  "streamId": "j97...",
  "muxStreamId": "abc123...",
  "muxPlaybackId": "xyz789...",
  "reused": false
}
```

### Reused Stream
```json
{
  "success": true,
  "streamId": "j97...",
  "muxStreamId": "abc123...",
  "muxPlaybackId": "xyz789...",
  "reused": true
}
```

## Mux Plan Optimization

### Without Stream Reuse
- User streams 10 times = 10 Mux live streams created
- Could exceed plan limits quickly
- Manual cleanup required

### With Stream Reuse
- User streams 10 times = 1 Mux live stream created
- Stays well within plan limits
- Automatic efficient resource usage

## Edge Cases Handled

1. **Multiple Inactive Streams**: Uses most recent one
2. **No Inactive Streams**: Creates new stream normally
3. **Stream Still Live**: Doesn't reuse active streams
4. **Missing Mux Credentials**: Creates new stream
5. **Different Users**: Each user has their own reusable stream

## Future Enhancements

Potential improvements:
- [ ] Option to manually create new stream (bypass reuse)
- [ ] Stream template system (save common configurations)
- [ ] Stream archiving (mark streams to not reuse)
- [ ] Analytics on stream reuse rate
- [ ] Auto-cleanup very old streams (6+ months)

## Testing

To verify stream reuse:
1. Create first stream and note RTMP URL/key
2. End the stream
3. Create second stream
4. Verify same RTMP URL/key returned
5. Check console for "Reusing stream" message
6. Confirm OBS works without reconfiguration

## Notes

- Stream reuse is transparent to viewers
- Playback URLs remain stable
- Chat history from previous streams is preserved in database
- Stream stats are reset for each new session
