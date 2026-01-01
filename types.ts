// Core Entities
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AllegroAccount {
  id: string;
  login: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image: string;
  orderId?: string;
}

export interface Order {
  id: string;
  buyer: string;
  total: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  carrier: 'inpost' | 'dpd' | 'allegro_one';
  products: Product[];
}

export interface MessageSetting {
  id: string;
  autoResponderEnabled: boolean;
  workHoursStart: string;
  workHoursEnd: string;
  delayMinutes: number;
  excludedKeywords: string[];
}

// New Modules Types

export interface Dispute {
  id: string;
  orderId: string;
  buyer: string;
  reason: 'not_received' | 'damaged' | 'incomplete';
  status: 'opened' | 'escalated' | 'resolved';
  openedAt: string;
  daysRemaining: number;
  autoResolveEnabled: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  realStock: number;
  virtualBuffer: number; // The "Safety Margin"
  allegroStatus: 'active' | 'ended';
}

export interface RepricingItem {
  id: string;
  name: string;
  myPrice: number;
  competitorPrice: number;
  competitorStock: number;
  strategy: 'undercut' | 'surge' | 'match';
  lastUpdate: string;
}

export interface SeoAudit {
  originalTitle: string;
  suggestedTitle: string;
  score: number;
  keywords: string[];
}

export interface DraftItem {
  id: string;
  aiTitle: string;
  category: string;
  ean: string;
  allegroQty: number;
  stockQty: number;
  status: 'draft' | 'publishing' | 'published';
  qualityScore: number; // 0-100%
  price: number;
}

export interface SeoSuggestion {
  id: string;
  img: string;
  currentTitle: string;
  suggestedTitle: string;
  newKeywords: string[];
  reason: string;
  confidenceScore: number;
  status: 'pending' | 'accepted' | 'rejected';
}

// Frontend specific types
export interface KPI {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendDirection: 'up' | 'down' | 'neutral';
  icon: any; // Lucide Icon
}

export interface ActivityLog {
  id: string;
  type: 'ORDER' | 'SYSTEM' | 'MESSAGE' | 'ERROR';
  message: string;
  timestamp: string;
}