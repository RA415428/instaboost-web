import { ActivityLog, AdminConfig, Order, UserAccount, UserWallet } from '../types';
import { DEFAULT_ADMIN_CONFIG } from './defaultAdminConfig';
import { initialOrders } from '../data/appData';

const ADMIN_CONFIG_KEY = 'instaboost_admin_config';
const ORDERS_KEY = 'instaboost_orders';
const WALLET_KEY = 'instaboost_user_wallet';
const USERS_KEY = 'instaboost_users_list';
const ACTIVITY_LOGS_KEY = 'instaboost_activity_logs';

/**
 * Resolves the backend server API URL dynamically.
 * Works seamlessly in both web browsers and native APK/WebView apps on any mobile device.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (
      (origin.startsWith('http://') || origin.startsWith('https://')) &&
      !origin.startsWith('file://') &&
      !origin.includes('capacitor://')
    ) {
      return `${origin}${cleanPath}`;
    }
  }
  // Central Cloud Server URL fallback for standalone APKs
  return `https://instaboost-web.onrender.com${cleanPath}`;
}

export function loadAdminConfig(): AdminConfig {
  try {
    const data = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const loadedAds = { ...DEFAULT_ADMIN_CONFIG.ads, ...(parsed.ads || {}) };
      
      // Fallback defaults if empty
      if (!loadedAds.adMobAppId) loadedAds.adMobAppId = DEFAULT_ADMIN_CONFIG.ads.adMobAppId;
      if (!loadedAds.bannerAdId) loadedAds.bannerAdId = DEFAULT_ADMIN_CONFIG.ads.bannerAdId;
      if (!loadedAds.interstitialAdId) loadedAds.interstitialAdId = DEFAULT_ADMIN_CONFIG.ads.interstitialAdId;
      if (!loadedAds.rewardedAdId) loadedAds.rewardedAdId = DEFAULT_ADMIN_CONFIG.ads.rewardedAdId;
      if (!loadedAds.appOpenAdId) loadedAds.appOpenAdId = DEFAULT_ADMIN_CONFIG.ads.appOpenAdId;
      if (!loadedAds.directSmartlinkUrl) loadedAds.directSmartlinkUrl = DEFAULT_ADMIN_CONFIG.ads.directSmartlinkUrl;

      return {
        ...DEFAULT_ADMIN_CONFIG,
        ...parsed,
        announcement: { ...DEFAULT_ADMIN_CONFIG.announcement, ...(parsed.announcement || {}) },
        smmApi: { ...DEFAULT_ADMIN_CONFIG.smmApi, ...(parsed.smmApi || {}) },
        ads: loadedAds,
        pricing: { ...DEFAULT_ADMIN_CONFIG.pricing, ...(parsed.pricing || {}) }
      };
    }
  } catch (err) {
    console.warn('Failed to load admin config from localStorage:', err);
  }
  return DEFAULT_ADMIN_CONFIG;
}

export function saveAdminConfig(config: AdminConfig): void {
  try {
    const configToSave: AdminConfig = {
      ...config,
      lastUpdated: Date.now()
    };
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(configToSave));
    window.dispatchEvent(new Event('instaboost_config_updated'));
    // Sync immediately to central real-time server
    fetch(getApiUrl('/api/config'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configToSave)
    }).catch((e) => console.warn('Server config sync offline', e));
  } catch (err) {
    console.error('Failed to save admin config:', err);
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('instaboost_orders_updated'));
    // Sync to central server
    fetch(getApiUrl('/api/orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders)
    }).catch((e) => console.warn('Server orders sync offline', e));
  } catch (err) {
    console.error('Failed to save orders:', err);
  }
}

// Sync with central real-time server across devices
export async function fetchServerAdminConfig(): Promise<AdminConfig | null> {
  try {
    const res = await fetch(getApiUrl('/api/config'));
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.config) {
        const serverConfig: AdminConfig = data.config;
        const localData = localStorage.getItem(ADMIN_CONFIG_KEY);
        if (localData) {
          try {
            const localConfig: AdminConfig = JSON.parse(localData);
            const localTime = localConfig.lastUpdated || 0;
            const serverTime = serverConfig.lastUpdated || 0;

            // If local storage has a custom config saved by Admin (newer or equal timestamp)
            if (localTime >= serverTime && localTime > 0) {
              // Push local config to server to restore custom admin rates
              fetch(getApiUrl('/api/config'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localConfig)
              }).catch(() => {});
              return localConfig;
            }
          } catch {
            // ignore parse errors
          }
        }

        localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(serverConfig));
        window.dispatchEvent(new Event('instaboost_config_updated'));
        return serverConfig;
      }
    }
  } catch (err) {
    // server unreachable / offline fallback
  }
  return null;
}

export async function fetchServerOrders(): Promise<Order[] | null> {
  try {
    const res = await fetch(getApiUrl('/api/orders'));
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.orders)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
        window.dispatchEvent(new Event('instaboost_orders_updated'));
        return data.orders;
      }
    }
  } catch (err) {
    // server unreachable / offline fallback
  }
  return null;
}

export async function fetchServerUsers(): Promise<UserAccount[] | null> {
  try {
    const res = await fetch(getApiUrl('/api/users'));
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.users)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
        window.dispatchEvent(new Event('instaboost_users_updated'));
        return data.users;
      }
    }
  } catch (err) {
    // server unreachable / offline fallback
  }
  return null;
}

export async function syncUserDeviceWithServer(wallet: UserWallet): Promise<void> {
  try {
    const res = await fetch(getApiUrl('/api/users/sync'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: wallet.memberId,
        coins: wallet.coins,
        dailyAdsWatched: wallet.dailyAdsWatched,
        lastActive: 'Just now',
        isOnline: true,
        deviceType: /Android/i.test(navigator.userAgent) ? 'Android App (APK)' : 'Mobile Web',
        location: 'India'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.user) {
        // If server admin modified coin balance, sync back to local user wallet
        if (data.user.coins !== undefined && data.user.coins !== wallet.coins) {
          const updatedWallet = { ...wallet, coins: data.user.coins };
          localStorage.setItem(WALLET_KEY, JSON.stringify(updatedWallet));
          window.dispatchEvent(new Event('instaboost_wallet_updated'));
        }
      }
    }
  } catch (err) {
    // ignore offline
  }
}

export function loadOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    if (data) {
      const parsed: Order[] = JSON.parse(data);
      // Filter out any known mock/fake/simulated orders
      const realOrders = parsed.filter(
        (o) =>
          !o.id.startsWith('ord_fake_') &&
          !o.targetUrl.includes('example.com') &&
          !(!o.userMemberId && o.targetUrl.includes('instagram.com/p/'))
      );
      // Ensure unique IDs
      const seen = new Set<string>();
      const sanitizedOrders: Order[] = [];
      realOrders.forEach((o, index) => {
        let uniqueId = o.id;
        if (seen.has(uniqueId)) {
          uniqueId = `ORD-${Date.now().toString().slice(-4)}${index}${Math.floor(Math.random() * 90 + 10)}`;
        }
        seen.add(uniqueId);
        sanitizedOrders.push({ ...o, id: uniqueId });
      });
      return sanitizedOrders;
    }
  } catch (err) {
    console.warn('Failed to load orders:', err);
  }
  return initialOrders;
}

export function getCurrentMemberId(): string {
  try {
    const existingId = localStorage.getItem('roxyefollow_user_member_id');
    if (existingId) {
      return existingId;
    }
    const oldCounter = localStorage.getItem('roxyefollow_user_counter');
    if (oldCounter && oldCounter !== '1') {
      localStorage.setItem('roxyefollow_user_member_id', oldCounter);
      return oldCounter;
    }
    // Assign a unique 6-digit member ID for every fresh app download
    const newMemberId = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('roxyefollow_user_member_id', newMemberId);
    return newMemberId;
  } catch (err) {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export function loadUserWallet(): UserWallet {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const data = localStorage.getItem(WALLET_KEY);
    if (data) {
      const parsed: UserWallet = JSON.parse(data);
      // Migrate old format (e.g. MEM-88942) to sequential format (e.g. 1, 2, 3)
      if (!parsed.memberId || parsed.memberId.startsWith('MEM-') || parsed.memberId.startsWith('usr_')) {
        parsed.memberId = getCurrentMemberId();
      }
      // Check for daily reset (if date changed / midnight passed)
      if (!parsed.lastAdResetDate || parsed.lastAdResetDate !== todayStr) {
        parsed.dailyAdsWatched = 0;
        parsed.lastAdResetDate = todayStr;
      }
      saveUserWallet(parsed);
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load user wallet:', err);
  }

  // Fresh app download / install on this device
  const assignedMemberId = getCurrentMemberId();
  const defaultWallet: UserWallet = {
    coins: 0,
    memberId: assignedMemberId,
    dailyAdsWatched: 0,
    maxDailyAds: 10,
    lastAdResetDate: todayStr
  };
  saveUserWallet(defaultWallet);
  return defaultWallet;
}

export function saveUserWallet(wallet: UserWallet): void {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    window.dispatchEvent(new Event('instaboost_wallet_updated'));
  } catch (err) {
    console.error('Failed to save wallet:', err);
  }
}

export function loadUsersList(): UserAccount[] {
  const currentWallet = loadUserWallet();
  const currentUser: UserAccount = {
    id: `usr_${currentWallet.memberId}`,
    memberId: currentWallet.memberId,
    name: `User #${currentWallet.memberId}`,
    coins: currentWallet.coins,
    ordersCount: 0,
    status: 'ACTIVE',
    joinedDate: 'Today',
    isOnline: true,
    lastActive: 'Just now',
    deviceType: 'Mobile App',
    currentScreen: 'User Main App View',
    totalCoinsSpent: 0,
    location: 'India'
  };

  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
      const parsed: UserAccount[] = JSON.parse(data);
      // Keep only real active user accounts
      const realUsers = parsed.filter(
        (u) =>
          u.memberId === currentWallet.memberId ||
          (!u.id.startsWith('usr_mock') &&
            !u.id.startsWith('usr_demo') &&
            u.name !== 'Rohan Sharma' &&
            u.name !== 'Priya Patel' &&
            u.name !== 'Vikram Singh' &&
            u.name !== 'Ananya Roy' &&
            u.name !== 'Rahul Verma')
      );
      if (realUsers.length > 0) {
        return realUsers.map((u) => {
          if (u.memberId === currentWallet.memberId) {
            return {
              ...u,
              memberId: currentWallet.memberId,
              name: `User #${currentWallet.memberId}`,
              coins: currentWallet.coins
            };
          }
          return u;
        });
      }
    }
  } catch (err) {
    console.warn('Failed to load users list:', err);
  }
  return [currentUser];
}

export function saveUsersList(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('instaboost_users_updated'));
    fetch(getApiUrl('/api/users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users)
    }).catch((e) => console.warn('Server users sync offline', e));
  } catch (err) {
    console.error('Failed to save users list:', err);
  }
}

export function loadActivityLogs(): ActivityLog[] {
  try {
    const data = localStorage.getItem(ACTIVITY_LOGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed to load activity logs:', err);
  }
  return [];
}

export function saveActivityLogs(logs: ActivityLog[]): void {
  try {
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(logs));
    window.dispatchEvent(new Event('instaboost_logs_updated'));
  } catch (err) {
    console.error('Failed to save activity logs:', err);
  }
}
