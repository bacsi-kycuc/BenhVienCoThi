/**
 * Types for Viện Tâm Thần Cố Thị (Hospital Zone)
 */

export interface PromptCategory {
  id: string;
  icon: string;
  name: string;
  description?: string;
  location?: string;
}

export interface Prompt {
  id: number;
  name: string;
  category: string; // references PromptCategory.id
  icon: string;
  url: string;
  description: string;
  tags: string[];
  hasPassword?: boolean;
  hint?: string | null;
  password?: string | null;
  votes?: number;
  khoa?: string;
  passwordFailLimit?: number;
  passwordFailGifUrl?: string;
  passwordFailSoundUrl?: string;
  plotUrl?: string;
  updatedAt?: string;
  isNew?: boolean;
  views?: number;
}

export interface MedicalRecord {
  id: number;
  name: string;
  age: string;
  cat: string; // references PromptCategory.id
  note: string;
  symptoms: string[];
  date: string;
}

export interface Sticker {
  id: string;
  x: number;
  y: number;
  emoji: string;
  rotation: number;
  scale: number;
  driftX: number;
  driftY: number;
  stickerIndex?: number;
}

export interface Feedback {
  id: string;
  promptId: number;
  author: string;
  comment: string;
  rating: number; // 1 to 5 stars
  timestamp: string;
  isReported?: boolean;
  reportedReason?: string;
  reportedAt?: string;
  adminReply?: string;
  adminReplyAt?: string;
  adminReplyAuthor?: string;
}

export interface AdminNotification {
  id: string;
  type: "feedback" | "report" | "system";
  title: string;
  message: string;
  promptId?: number | string;
  promptName?: string;
  author?: string;
  rating?: number;
  timestamp: string;
  read: boolean;
}

export interface WeeklyVotesDoc {
  weekKey: string; // e.g. "2026-W45"
  votes: Record<string, number>; // characterId -> vote count
  winnerId?: string;
  winnerName?: string;
  winnerVotes?: number;
  updatedAt?: string;
}

export interface LoungePost {
  id: string;
  author: string;
  content: string; // Up to 1000 words
  nurseName?: string; // Target nurse/doctor mentioned in post
  tag?: string;
  images?: string[]; // Up to 4 compressed images
  reactions?: Record<string, number>;
  commentsCount?: number;
  isPinned?: boolean;
  createdAt: string;
}

export interface LoungeComment {
  id: string;
  postId: string;
  author: string;
  content: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface QrConfig {
  enabled: boolean;
  imageUrl: string;
  title?: string;
  note: string;
  updatedAt?: string;
}


