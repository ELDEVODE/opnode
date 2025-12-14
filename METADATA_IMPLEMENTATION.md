# Metadata & SEO Implementation

## Summary
Complete metadata setup for OPNODE live streaming platform including favicons, Open Graph tags, Twitter cards, and dynamic stream metadata for social sharing.

## Changes Made

### 1. Root Layout Metadata (`/app/layout.tsx`)
- ✅ Added comprehensive site-wide metadata
- ✅ Configured favicon using `/images/Logo.svg` and `/images/Logo.png`
- ✅ Added Open Graph tags for social sharing
- ✅ Added Twitter Card metadata
- ✅ Set up proper SEO robots configuration
- ✅ Added site description and keywords

**Favicon Sources:**
- Icon: `/images/Logo.svg` (SVG format - scalable)
- Apple Touch Icon: `/images/Logo.png`
- Shortcut icon: `/images/Logo.png`

### 2. Stream Page Metadata (`/app/stream/[id]/layout.tsx`)
- ✅ Created dynamic metadata generator for individual streams
- ✅ Fetches stream data from Convex database
- ✅ Shows stream title, description, and thumbnail in social shares
- ✅ Includes host username in metadata
- ✅ Adds video-specific Open Graph tags
- ✅ Shows live status and viewer count
- ✅ Uses stream thumbnail or defaults to `/images/500l.png`

**Social Share Preview:**
When someone shares a stream link, it will show:
- Stream title
- Stream description or "Watch [host] live on OPNODE"
- Stream thumbnail image
- Host username
- Live status indicator
- Video metadata (resolution, type)

### 3. Dashboard Metadata (`/app/dashboard/page.tsx`)
- ✅ Added page-specific metadata
- ✅ SEO-optimized title and description
- ✅ Social sharing preview image

### 4. Stream Broadcast Metadata (`/app/stream/metadata.ts`)
- ✅ Metadata for "Go Live" page
- ✅ Describes streaming functionality

### 5. SEO Files

**Sitemap (`/app/sitemap.ts`):**
- ✅ Dynamic sitemap generation
- ✅ Includes main pages with priorities
- ✅ Update frequencies set for search engines
- ✅ Accessible at `/sitemap.xml`

**Robots.txt (`/public/robots.txt`):**
- ✅ Allows all search engines
- ✅ Blocks API routes from indexing
- ✅ Points to sitemap location

### 6. Convex Backend (`/convex/streams.ts`)
- ✅ Added `getStorageUrl` query for fetching file URLs
- ✅ Enables thumbnail retrieval for metadata

## How It Works

### Stream Sharing Flow:
1. User shares a stream URL (e.g., `/stream/abc123`)
2. Next.js `generateMetadata` function runs server-side
3. Function fetches stream data from Convex
4. Generates dynamic Open Graph and Twitter Card tags
5. Social platforms (Twitter, Facebook, Discord, etc.) show rich preview

### Metadata Template System:
- All pages follow this pattern: `"[Page Title] | OPNODE"`
- Ensures brand consistency across all pages
- Uses default metadata from root layout if page-specific not found

## Testing Social Shares

To test how your streams will appear when shared:

1. **Facebook Debugger:** https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

## Environment Variables Required

Add to `.env.local`:
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

This is used for:
- Canonical URLs
- Open Graph URLs
- Sitemap generation
- Absolute image URLs in metadata

## Social Media Examples

### Twitter Share:
```
🎥 Amazing Gaming Stream
Watch eldevode live on OPNODE
👥 287 viewers | ⚡ Earn sats while watching
[Large preview image]
```

### Discord/Telegram:
```
OPNODE - Live Stream
[Preview image]
Amazing Gaming Stream
Stream live, earn sats. Watch eldevode live on OPNODE.
```

## Favicon Formats

The app serves favicons in multiple formats for maximum compatibility:
- **SVG** - Modern browsers, scales perfectly
- **PNG** - Legacy browsers and bookmark icons
- **Apple Touch Icon** - iOS home screen shortcuts

## Performance Notes

- Metadata generation is server-side only (no client bundle impact)
- Images are served from `/public` directory
- Convex queries are optimized for metadata fetching
- Fallback to default images if stream thumbnail unavailable

## Future Enhancements

Consider adding:
- [ ] Custom OG image generator (dynamic images with stream info)
- [ ] Structured data (JSON-LD) for rich search results
- [ ] AMP versions of stream pages
- [ ] PWA manifest with custom icons
- [ ] Multi-language meta tags
- [ ] Verification meta tags (Google, Bing, etc.)
