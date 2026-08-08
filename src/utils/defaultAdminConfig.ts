import { AdminConfig, SmmPanelProviderInfo } from '../types';

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  adminPassword: 'admin123',
  maintenanceMode: false,
  announcement: {
    enabled: true,
    title: '🚀 Special 2x Bonus Active!',
    message: 'Get double coins on every video watch and daily reward claim today!',
    bannerUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    actionUrl: '',
    buttonText: 'Claim Bonus',
    bonusCoins: 50
  },
  smmApi: {
    enabled: true,
    autoForward: true,
    apiUrl: 'https://demo-smm-panel.com/api/v2',
    globalApiKey: 'demo_key_982347101928374',
    services: {
      followers: { serviceId: '101', apiKey: '' },
      likes: { serviceId: '102', apiKey: '' },
      views: { serviceId: '103', apiKey: '' },
      comments: { serviceId: '104', apiKey: '' },
      shares: { serviceId: '105', apiKey: '' }
    }
  },
  ads: {
    enabled: true,
    provider: 'AdMob',
    adMobAppId: 'ca-app-pub-7534769036423854~9595348595',
    bannerAdId: 'ca-app-pub-7534769036423854/9072604412',
    interstitialAdId: 'ca-app-pub-7534769036423854/3078307632',
    rewardedAdId: 'ca-app-pub-7534769036423854/5224354917',
    appOpenAdId: 'ca-app-pub-7534769036423854/5377167919',
    directSmartlinkUrl: 'https://doubtfulimpatient.com/bhetpw4me?key=b10856b9df41e998764e3e76a118f915',
    adSensePublisherId: 'ca-pub-5869373074081897',
    autoAdIntervalMinutes: 5, // 5 minutes active usage ad trigger
    coinsPerRewardAd: 5,
    maxDailyAdsPerUser: 10
  },
  pricing: {
    coinsPerFollower: 0.1,
    coinsPerLike: 0.05,
    coinsPerView: 0.02,
    coinsPerComment: 0.2,
    coinsPerShare: 0.15,
    dailyCheckinReward: 20
  },
  lastUpdated: 0
};

export const POPULAR_SMM_PROVIDERS: SmmPanelProviderInfo[] = [
  {
    name: 'SMM Main (Free Test Panel)',
    url: 'https://smmmain.com',
    isFreeOrDemo: true,
    description: 'Popular SMM panel with free trial API keys & low cost Instagram followers & likes.',
    features: 'API v2 compatible, instant start, auto refill.'
  },
  {
    name: 'SMM Rush API',
    url: 'https://smmrush.net',
    isFreeOrDemo: true,
    description: 'Offers demo API endpoint for testing Reels views & Likes integration.',
    features: 'Fast response, detailed JSON status API, low drop rates.'
  },
  {
    name: 'SMM Follower Hub',
    url: 'https://smmfollowerhub.com',
    isFreeOrDemo: false,
    description: 'High speed real looking Instagram engagement panel with full API support.',
    features: 'Supports custom comments, targeted locations, instant order status.'
  },
  {
    name: 'JustAnotherPanel (JAP)',
    url: 'https://justanotherpanel.com',
    isFreeOrDemo: false,
    description: 'One of the largest global SMM API providers for all social platforms.',
    features: 'Cheapest API rates, automated balance topup, standard API v2.'
  }
];
