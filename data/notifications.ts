import { Notification } from '@/types/notification';

export const mockNotifications: Notification[] = [
  // New notifications
  {
    id: '1',
    type: 'follow',
    user: {
      name: 'Theresa Webb',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      verified: true,
      isLive: true,
    },
    action: 'just invited you',
    timestamp: '2 hours ago',
    actionButton: {
      label: 'Join Stream',
      variant: 'primary',
    },
  },
  {
    id: '2',
    type: 'follow',
    user: {
      name: 'Tatyana',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      verified: true,
    },
    action: 'started following you',
    timestamp: '2 hours ago',
  },
  {
    id: '3',
    type: 'follow',
    user: {
      name: 'James',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      verified: true,
      isLive: true,
    },
    action: 'started following you',
    timestamp: '2 hours ago',
  },
  {
    id: '4',
    type: 'milestone',
    user: {
      name: '500 followers!',
      avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop',
    },
    action: 'Milestone achieved',
    timestamp: '2 hours ago',
    actionButton: {
      label: 'Insights',
      variant: 'secondary',
    },
    milestoneDetails: {
      count: '500 followers!',
      achievement: 'Milestone achieved',
    },
  },
  {
    id: '5',
    type: 'crypto',
    user: {
      name: 'Received BTC',
      avatar: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=100&fit=crop',
    },
    action: 'Theresa Webb: Gifted you 1.25 Sats',
    timestamp: '2 hours ago',
    actionButton: {
      label: 'Balance',
      variant: 'crypto',
    },
    cryptoDetails: {
      amount: '1.25 Sats',
      type: 'BTC',
    },
  },
  {
    id: '6',
    type: 'follow',
    user: {
      name: 'Josephine',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      verified: true,
      isLive: true,
    },
    action: 'started following you',
    timestamp: '2 hours ago',
  },
  {
    id: '7',
    type: 'follow',
    user: {
      name: 'Kristina',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      verified: true,
    },
    action: 'started following you',
    timestamp: '2 hours ago',
  },
];

export const mockOlderNotifications: Notification[] = [
  {
    id: '8',
    type: 'milestone',
    user: {
      name: '100 followers!',
      avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop',
    },
    action: 'Milestone achieved',
    timestamp: '2 hours ago',
    actionButton: {
      label: 'Insights',
      variant: 'secondary',
    },
    milestoneDetails: {
      count: '100 followers!',
      achievement: 'Milestone achieved',
    },
  },
  {
    id: '9',
    type: 'crypto',
    user: {
      name: 'Received your first SQL',
      avatar: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=100&fit=crop',
    },
    action: 'Theresa Webb: Gifted you 1.25 Sats',
    timestamp: '2 hours ago',
    actionButton: {
      label: 'Balance',
      variant: 'crypto',
    },
    cryptoDetails: {
      amount: '1.25 Sats',
      type: 'SQL',
    },
  },
  {
    id: '10',
    type: 'follow',
    user: {
      name: 'James',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      verified: true,
      isLive: true,
    },
    action: 'started following you',
    timestamp: 'about 9 hours ago',
  },
];
