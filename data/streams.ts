export const streamCategories = [
  "Following",
  "Live",
  "Recommended",
  "Popular",
  "New Arrivals",
] as const;

export type StreamCategory = (typeof streamCategories)[number];

export type Stream = {
  id: string;
  title: string;
  description: string;
  host: string;
  hostAvatar: string;
  engagementLabel: string;
  tags: string[];
  viewerCount: number;
  isLive: boolean;
  thumbnail: string;
  category: StreamCategory;
  isVerified?: boolean;
};

export const streams: Stream[] = [
  {
    id: "hadestown-reaction-1",
    title: "HADES IS A BASS?! | Way Down Hadestown",
    description: "Reaction / Analysis",
    host: "CF Entertainment",
    hostAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop",
    engagementLabel: "20+",
    tags: ["Musical", "Mythology", "History"],
    viewerCount: 243000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop",
    category: "Live",
    isVerified: true,
  },
  {
    id: "avatar-the-last-airbender-panel",
    title: "Avatar 2x19 | The Guru - Group Reaction",
    description: "Episode Breakdown",
    host: "The Normies",
    hostAvatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=160&auto=format&fit=crop",
    engagementLabel: "20+",
    tags: ["Anime", "Reaction", "Group"],
    viewerCount: 243000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop",
    category: "Recommended",
    isVerified: true,
  },
  {
    id: "music-producer-breakdown",
    title: "Breaking a Hit Song Live",
    description: "Studio Session",
    host: "Audio Lab",
    hostAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop",
    engagementLabel: "18+",
    tags: ["Music", "Production", "Live"],
    viewerCount: 180000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop",
    category: "Popular",
  },
  {
    id: "storyteller-session-updated",
    title: "Ancient Myths Retold with Modern Twist",
    description: "Interactive Storytelling Hour",
    host: "Lore Masters",
    hostAvatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=160&auto=format&fit=crop",
    engagementLabel: "12+",
    tags: ["Storytelling", "Live", "Interactive"],
    viewerCount: 135000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&auto=format&fit=crop",
    category: "Live",
  },
  {
    id: "new-artist-discovery",
    title: "Discover 5 Underground Artists",
    description: "Curation Stream",
    host: "Floyd Miko",
    hostAvatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=160&auto=format&fit=crop",
    engagementLabel: "15+",
    tags: ["Discovery", "Music", "Culture"],
    viewerCount: 155000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop",
    category: "New Arrivals",
    isVerified: true,
  },
  {
    id: "creator-roundtable-v2",
    title: "Creators Roundtable | Building Your Brand",
    description: "Expert Panel Advice",
    host: "Content Forge",
    hostAvatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=160&auto=format&fit=crop",
    engagementLabel: "25+",
    tags: ["Business", "Content", "Panel"],
    viewerCount: 265000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?w=1200&auto=format&fit=crop",
    category: "Popular",
    isVerified: true,
  },
  {
    id: "afrobeats-unplugged",
    title: "Afrobeats Unplugged | Live Loop Session",
    description: "Dance + Live Production",
    host: "Pulse Theory",
    hostAvatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=160&auto=format&fit=crop",
    engagementLabel: "32+",
    tags: ["Afrobeats", "Live", "Production"],
    viewerCount: 320000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=1200&auto=format&fit=crop",
    category: "Live",
    isVerified: true,
  },
  {
    id: "sports-hyperbreakdown",
    title: "World Cup Moments | Hyper Breakdown",
    description: "Sports Analytics",
    host: "Pitch Masters",
    hostAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop",
    engagementLabel: "45+",
    tags: ["Football", "History", "Analysis"],
    viewerCount: 450000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1461897104016-0b3b0d59c0f8?w=1200&auto=format&fit=crop",
    category: "Popular",
  },
  {
    id: "creative-coding-lab-updated",
    title: "Creative Coding Lab | AI-Generated Art",
    description: "Live Coding Workshop + Q&A",
    host: "Code Canvas",
    hostAvatar:
      "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=160&auto=format&fit=crop",
    engagementLabel: "19+",
    tags: ["Coding", "AI", "Art"],
    viewerCount: 210000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop",
    category: "Recommended",
  },
  {
    id: "street-food-diaries",
    title: "Street Food Diaries | Live in Seoul",
    description: "IRL Stream",
    host: "Nomad Plates",
    hostAvatar:
      "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?w=160&auto=format&fit=crop",
    engagementLabel: "28+",
    tags: ["Travel", "Food", "Culture"],
    viewerCount: 280000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop",
    category: "New Arrivals",
  },
  {
    id: "gaming-tournament-live",
    title: "Epic Esports Tournament Finals",
    description: "Live Matches and Commentary",
    host: "GameZone Pro",
    hostAvatar:
      "https://images.unsplash.com/photo-1542744173-8e7f7497bb05?w=160&auto=format&fit=crop",
    engagementLabel: "16+",
    tags: ["Gaming", "Esports", "Tournament"],
    viewerCount: 350000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop",
    category: "Popular",
    isVerified: true,
  },
  {
    id: "tech-gadget-unboxing",
    title: "Latest Tech Gadgets Unboxing & Review",
    description: "Hands-On Demo",
    host: "Tech Insider",
    hostAvatar:
      "https://images.unsplash.com/photo-1556155099-870a9010d4e4?w=160&auto=format&fit=crop",
    engagementLabel: "13+",
    tags: ["Tech", "Gadgets", "Review"],
    viewerCount: 175000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop",
    category: "Recommended",
  },
  {
    id: "yoga-fitness-session",
    title: "Morning Yoga Flow Live",
    description: "Guided Fitness Class",
    host: "Zen Wellness",
    hostAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop",
    engagementLabel: "10+",
    tags: ["Fitness", "Yoga", "Wellness"],
    viewerCount: 90000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop",
    category: "Live",
    isVerified: true,
  },
  {
    id: "cooking-masterclass",
    title: "Italian Cuisine Masterclass",
    description: "Live Cooking Demo",
    host: "Chef's Kitchen",
    hostAvatar:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=160&auto=format&fit=crop",
    engagementLabel: "14+",
    tags: ["Cooking", "Food", "Recipe"],
    viewerCount: 140000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&auto=format&fit=crop",
    category: "New Arrivals",
  },
  {
    id: "space-exploration-talk",
    title: "Mars Mission Updates & Discussion",
    description: "Science Panel Live",
    host: "Cosmic Insights",
    hostAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop",
    engagementLabel: "21+",
    tags: ["Science", "Space", "Exploration"],
    viewerCount: 220000,
    isLive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop",
    category: "Popular",
    isVerified: true,
  },
];
