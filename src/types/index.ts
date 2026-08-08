export type AppScreen = 'SPLASH' | 'LOADING' | 'MAIN_APP' | 'ADMIN';

export type MainTab = 'HOME' | 'TAGS' | 'COINS' | 'ORDERS' | 'SETTINGS';

export type OrderStatus = 'PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface UserWallet {
  coins: number;
  memberId: string;
  dailyAdsWatched: number;
  maxDailyAds: number;
  lastAdResetDate?: string;
}

export interface UserAccount {
  id: string;
  memberId: string;
  name: string;
  coins: number;
  ordersCount: number;
  status: 'ACTIVE' | 'BLOCKED';
  joinedDate: string;
  isOnline?: boolean;
  lastActive?: string;
  deviceType?: string;
  currentScreen?: string;
  totalCoinsSpent?: number;
  location?: string;
}

export interface ActivityLog {
  id: string;
  type: 'ORDER_PLACED' | 'AD_WATCHED' | 'COIN_PURCHASE' | 'USER_LOGIN' | 'ADMIN_ACTION';
  title: string;
  detail: string;
  timestamp: string;
  userMemberId?: string;
  badgeColor?: string;
}

export interface Order {
  id: string;
  userMemberId?: string;
  serviceType: string;
  serviceId?: string;
  targetUrl: string;
  quantity: number;
  coinsSpent: number;
  status: OrderStatus;
  dateFormatted: string;
  smmOrderId?: string;
  smmResponse?: string;
}

export interface HashtagCategory {
  id: string;
  name: string;
  iconName: string;
  hashtags: string[];
}

export interface CoinPackage {
  id: string;
  coins: number;
  priceINR: string;
  priceNum: number;
  isSubscription?: boolean;
  badge?: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  icon: string;
  coinsPerUnit: number;
  minQuantity: number;
  maxQuantity: number;
  description: string;
}

export interface SmmServiceConfig {
  serviceId: string;
  apiKey?: string;
}

export interface SmmApiSettings {
  enabled: boolean;
  autoForward: boolean;
  apiUrl: string;
  globalApiKey: string;
  services: {
    followers: SmmServiceConfig;
    likes: SmmServiceConfig;
    views: SmmServiceConfig;
    comments: SmmServiceConfig;
    shares: SmmServiceConfig;
  };
}

export interface AdsSettings {
  enabled: boolean;
  provider: 'AdMob' | 'UnityAds' | 'AppLovin' | 'CustomBanners';
  adMobAppId: string;
  bannerAdId: string;
  interstitialAdId: string;
  rewardedAdId: string;
  appOpenAdId?: string;
  directSmartlinkUrl?: string;
  adSensePublisherId?: string;
  autoAdIntervalMinutes: number; // e.g., 2 minutes active time trigger
  coinsPerRewardAd: number;
  maxDailyAdsPerUser: number;
}

export interface AnnouncementSettings {
  enabled: boolean;
  title: string;
  message: string;
  bannerUrl: string;
  actionUrl: string;
  buttonText: string;
  bonusCoins?: number;
}

export interface PricingSettings {
  coinsPerFollower: number;
  coinsPerLike: number;
  coinsPerView: number;
  coinsPerComment: number;
  coinsPerShare: number;
  dailyCheckinReward: number;
}

export interface AdminConfig {
  adminPassword: string;
  maintenanceMode: boolean;
  announcement: AnnouncementSettings;
  smmApi: SmmApiSettings;
  ads: AdsSettings;
  pricing: PricingSettings;
  lastUpdated?: number;
}

export interface SmmPanelProviderInfo {
  name: string;
  url: string;
  isFreeOrDemo: boolean;
  description: string;
  features: string;
}

