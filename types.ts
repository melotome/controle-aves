
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
}

export interface AppSheetConfig {
  appId: string;
  accessKey: string;
  tableName: string;
  isEnabled: boolean;
}

export interface EggRecord {
  id: string;
  date: string;
  birdCount: number;
  totalEggs: number;
  brokenEggs: number;
  feedAm: number; // in kg
  feedPm: number; // in kg
  responsible: string;
  notes: string;
  // Computed values
  postureRate: number; // %
  lossRate: number; // %
  totalFeed: number; // kg
  synced?: boolean; // AppSheet sync status
}

export interface DashboardStats {
  totalBirds: number;
  avgPostureRate: number;
  avgLossRate: number;
  totalFeedConsumed: number;
}
