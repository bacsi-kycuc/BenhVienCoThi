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
