export type ChannelId = "linkedin" | "instagram" | "twitter" | "facebook" | "tiktok" | "newsletter" | "blog";

export interface ChannelConfig {
  id: ChannelId;
  name: string;
  active: boolean;
  color: string;
  iconName: string;
}

export type PostStatus = "idea" | "draft" | "review" | "scheduled" | "published";

export interface PostStatusConfig {
  id: PostStatus;
  label: string;
  color: string;
  bgClass: string;
}

export type EditorialPillar = "Education" | "Annonce" | "Blog / Valeur" | "B2B" | "Formation";

export interface Post {
  id: string;
  title: string;
  content: string;
  channel: ChannelId;
  status: PostStatus;
  pillar: EditorialPillar;
  campaign?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  author?: string;
  commentsCount?: number;
  likesCount?: number;
  format?: string;
  phase?: string;
  tags?: string[];
  visuals?: string[];
}

export interface CurationItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  importance: number; // 0.0 to 1.0
  tweetsCount: number;
  category: "USE-CASE" | "RELEASE" | "DEBATE" | "TUTORIAL";
  daysAgo: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  isNewUser?: boolean;
}
