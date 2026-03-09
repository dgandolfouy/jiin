export type GiftStatus = 'available' | 'reserved' | 'completed';

export interface PaymentMethod {
  id: string;
  type: 'paypal' | 'mercadopago' | 'bank' | 'debit' | 'other';
  label: string;
  details: string;
}

export interface PaymentInfo {
  methods: PaymentMethod[];
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  avatar?: string;
}

export interface Gift {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status: GiftStatus;
  category: string;
  isGroupGift: boolean;
  contributions: number;
  targetAmount: number;
  reservedBy?: string;
  comments: Comment[];
  contributionHistory?: Contribution[];
  isSurprise?: boolean;
  revealed?: boolean;
  addedBy?: string; // UID of the friend who added it
  buyUrl?: string;
  suggestedStore?: {
    name: string;
    logo: string;
    affiliateUrl: string;
  };
}

export interface Contribution {
  id: string;
  userName: string;
  amount: number;
  timestamp: string;
  voiceMessageUrl?: string; // Base64 or URL
}

export interface Wishlist {
  id: string;
  title: string;
  creator: string;
  ownerId: string;
  description: string;
  vibe: string;
  gifts: Gift[];
  coverImage: string;
  participantCount: number;
  isFavorite?: boolean;
  isArchived?: boolean;
  magicCode: string;
  paymentInfo?: PaymentInfo;
}
