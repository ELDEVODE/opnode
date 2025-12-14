export type NotificationType = 
  | 'follow'
  | 'milestone'
  | 'crypto'
  | 'stream';

export interface Notification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
    isLive?: boolean;
  };
  action: string;
  timestamp: string;
  actionButton?: {
    label: string;
    variant: 'primary' | 'secondary' | 'crypto';
  };
  cryptoDetails?: {
    amount: string;
    type: string;
  };
  milestoneDetails?: {
    count: string;
    achievement: string;
  };
}
