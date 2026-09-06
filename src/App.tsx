import React, { useState, useEffect } from 'react';
import { AppScreen, MainTab, UserWallet, Order, CoinPackage, AdminConfig, UserAccount, ActivityLog } from './types';
import { 
  loadAdminConfig, 
  saveAdminConfig, 
  loadOrders, 
  saveOrders, 
  loadUserWallet, 
  saveUserWallet, 
  loadUsersList, 
  saveUsersList,
  loadActivityLogs,
  saveActivityLogs,
  fetchServerAdminConfig,
  fetchServerOrders,
  fetchServerUsers,
  fetchServerActivityLogs,
  syncUserDeviceWithServer,
  setUserOfflinePresence,
  subscribeToFirestore,
  claimReferralBonus,
  checkAndAutoClaimReferral,
  traceReferralClick,
  initAutoDeviceRestore,
  getApiUrl
} from './utils/storage';
import { DEFAULT_ADMIN_CONFIG } from './utils/defaultAdminConfig';
import { submitOrderToSmmApi } from './utils/smmService';

import { TopBar } from './components/TopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { AdBanner } from './components/AdBanner';
import { TopSlidingAd } from './components/TopSlidingAd';
import { PopunderHandler } from './components/PopunderHandler';
import { AdModal } from './components/AdModal';
import { PaymentModal } from './components/PaymentModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { SupportModal } from './components/SupportModal';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';
import { Toast } from './components/Toast';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AnnouncementModal } from './components/AnnouncementModal';
import { NotificationPermissionModal } from './components/NotificationPermissionModal';
import { ReferralModal } from './components/ReferralModal';
import { getNotificationPermission, sendDeviceNotification, NotificationPayload } from './utils/notifications';
import { saveAdSession, getActiveAdSession, processAdSession } from './utils/adSessionManager';
import { openExternalAdLink, openAdsterraPopunder, showRewardedAd } from './utils/openAdLink';
import { checkAndApplyBranchDeferredAttribution } from './utils/branch';

import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { HashtagsScreen } from './screens/HashtagsScreen';
import { CoinsScreen } from './screens/CoinsScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AdminScreen } from './screens/AdminScreen';
import { MaintenanceScreen } from './screens/MaintenanceScreen';
import { BlockedScreen } from './screens/BlockedScreen';
import { RainBackground } from './components/RainBackground';
import { ForceUpdateModal } from './components/ForceUpdateModal';
import { isUpdateRequired } from './utils/versionCheck';
import { CURRENT_APP_VERSION } from './types';
import { 
  isGoogleAuthActive, 
  onAuthStatusChange, 
  checkGoogleRedirectResult, 
  handleExternalVerifiedUser,
  restoreUserByMemberId,
  getAppReturnIntentUrl
} from './utils/authService';

export function App() {
  const [isAdminAllowed, setIsAdminAllowed] = useState<boolean>(() => {
    try {
      const initialWallet = loadUserWallet();
      return initialWallet.email?.toLowerCase().trim() === 'nayakhardayal4@gmail.com';
    } catch (e) {
      return false;
    }
  });

  // Always require Admin Password by default until entered in session
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    try {
      const initialWallet = loadUserWallet();
      const isAuth = isGoogleAuthActive(initialWallet);
      return isAuth ? 'MAIN_APP' : 'LOGIN';
    } catch {
      return 'LOGIN';
    }
  });

  // Atmosphere & Theme Preference (Pink Monsoon Theme by default with live rain)
  const [themeMode, setThemeMode] = useState<'pink-monsoon' | 'classic-dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('roxyefollow_theme');
      if (saved === 'classic-dark' || saved === 'light' || saved === 'pink-monsoon') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'pink-monsoon';
  });

  const [isRainEnabled, setIsRainEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('roxyefollow_rain');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleRain = () => {
    setIsRainEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('roxyefollow_rain', next ? 'true' : 'false');
      } catch {}
      return next;
    });
  };

  const handleSelectTheme = (theme: 'pink-monsoon' | 'classic-dark' | 'light') => {
    setThemeMode(theme);
    try {
      localStorage.setItem('roxyefollow_theme', theme);
    } catch {}
  };

  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view')?.toUpperCase();
      const validTabs: MainTab[] = ['HOME', 'HASHTAGS', 'COINS', 'ORDERS', 'SETTINGS'];
      if (viewParam && validTabs.includes(viewParam as MainTab)) {
        return viewParam as MainTab;
      }

      const pendingSession = getActiveAdSession();
      if (pendingSession && pendingSession.screen) {
        if (validTabs.includes(pendingSession.screen as MainTab)) {
          return pendingSession.screen as MainTab;
        }
      }
      const saved = localStorage.getItem('roxyefollow_active_tab');
      if (saved && validTabs.includes(saved as MainTab)) {
        return saved as MainTab;
      }
    } catch (e) {
      // ignore
    }
    return 'HOME';
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Loaded Storage State
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(loadAdminConfig);
  const [wallet, setWallet] = useState<UserWallet>(loadUserWallet);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [users, setUsers] = useState<UserAccount[]>(loadUsersList);
  const [logs, setLogs] = useState<ActivityLog[]>(loadActivityLogs);

  // Modal & Admin Lock States
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);
  const [hasDismissedAnnouncement, setHasDismissedAnnouncement] = useState<boolean>(true);
  const [showNotifPermModal, setShowNotifPermModal] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);

  useEffect(() => {
    const handleCustomWalletUpdate = (e: any) => {
      if (e?.detail) {
        setWallet(e.detail);
      } else {
        const fresh = loadUserWallet();
        setWallet(fresh);
      }
    };
    window.addEventListener('instaboost_wallet_updated', handleCustomWalletUpdate);

    return () => {
      window.removeEventListener('instaboost_wallet_updated', handleCustomWalletUpdate);
    };
  }, []);

  // Real-Time Server & Firebase Firestore Sync across all devices
  useEffect(() => {
    // 0. Auto-Restore Check for fresh reinstalls & clear cache
    initAutoDeviceRestore().then((res) => {
      if (res.restored && res.memberId) {
        const freshWallet = loadUserWallet();
        const freshOrders = loadOrders();
        setWallet(freshWallet);
        setOrders(freshOrders);
        setToastMsg(`🎉 Account #${res.memberId} auto-restored! (${res.coins || 0} Coins)`);
      }

      // Check for automatic deferred referral link handshake on first launch
      const activeMemberId = res.memberId || wallet.memberId;
      if (activeMemberId) {
        checkAndAutoClaimReferral(activeMemberId).then((claimResult) => {
          if (claimResult.claimed) {
            const updatedWallet = loadUserWallet();
            setWallet(updatedWallet);
            setToastMsg(claimResult.message || `🎉 Referral Bonus Claimed! +${claimResult.rewardCoins || 50} Coins`);
          }
        }).catch(() => {});
      }
    });

    // 1. Initial server fetch & low-bandwidth adaptive sync
    const syncServer = async () => {
      if (document.hidden) return;
      try {
        const serverConfig = await fetchServerAdminConfig();
        if (serverConfig) {
          setAdminConfig(serverConfig);
        }
        const serverOrders = await fetchServerOrders();
        if (serverOrders) {
          setOrders(serverOrders);
        }
        const serverUsers = await fetchServerUsers();
        if (serverUsers && serverUsers.length > 0) {
          setUsers(serverUsers);
        }
        const serverLogs = await fetchServerActivityLogs();
        if (serverLogs && serverLogs.length > 0) {
          setLogs(serverLogs);
        }
        syncUserDeviceWithServer();
      } catch (err) {
        // graceful fallback on slow networks
      }
    };

    // Run initial sync once
    syncServer();

    // Low-bandwidth presence heartbeat (every 30s instead of aggressive 5s)
    const interval = setInterval(() => {
      if (!document.hidden) {
        syncUserDeviceWithServer();
      }
    }, 30000);

    // Full server sync backup every 60s
    const fullSyncInterval = setInterval(() => {
      if (!document.hidden) {
        syncServer();
      }
    }, 60000);

    // Real-time tab visibility & app exit presence listeners
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncUserDeviceWithServer();
      }
    };

    const handleFocus = () => {
      syncUserDeviceWithServer();
    };

    const handleBeforeUnload = () => {
      setUserOfflinePresence(wallet.memberId);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    // 2. Real-time Firebase Firestore listener
    const unsubscribeFirestore = subscribeToFirestore(
      (newConfig) => setAdminConfig(newConfig),
      (newOrders) => setOrders(newOrders),
      (newUsers) => {
        setUsers(newUsers);
        const currentUserInList = newUsers.find((u) => u.memberId === wallet.memberId);
        if (currentUserInList) {
          if (currentUserInList.status) {
            localStorage.setItem('roxyefollow_user_status', currentUserInList.status);
          }
          setWallet((prev) => {
            let changed = false;
            const updated = { ...prev };
            if (currentUserInList.status && updated.status !== currentUserInList.status) {
              updated.status = currentUserInList.status;
              changed = true;
            }
            // Only adopt remote coins if admin explicitly updated it and remote updatedAt is newer than local mutation
            const localMutationTime = updated.lastLocalCoinMutationAt || 0;
            const remoteUpdateTime = currentUserInList.updatedAt || currentUserInList.lastSeenAt || 0;
            if (
              typeof currentUserInList.coins === 'number' &&
              currentUserInList.coinsUpdatedByAdmin === true &&
              remoteUpdateTime > localMutationTime
            ) {
              if (updated.coins !== currentUserInList.coins) {
                updated.coins = currentUserInList.coins;
                updated.lastLocalCoinMutationAt = remoteUpdateTime;
                changed = true;
              }
            }
            if (changed) {
              saveUserWallet(updated);
              return updated;
            }
            return prev;
          });
        }
      },
      (newCoins, newAdsWatched, newStatus, coinsUpdatedByAdmin, updatedAt) => {
        if (newStatus) {
          localStorage.setItem('roxyefollow_user_status', newStatus);
          setUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.memberId === wallet.memberId) {
                return { ...u, status: newStatus as 'ACTIVE' | 'BLOCKED' };
              }
              return u;
            })
          );
        }
        setWallet((prev) => {
          let hasChange = false;
          const updated = { ...prev };
          if (newStatus && updated.status !== newStatus) {
            updated.status = newStatus as 'ACTIVE' | 'BLOCKED';
            hasChange = true;
          }
          // Only adopt remote coins if admin explicitly updated it and remote updatedAt is newer than local mutation
          const localMutationTime = updated.lastLocalCoinMutationAt || 0;
          const remoteUpdateTime = updatedAt || 0;
          if (
            coinsUpdatedByAdmin === true &&
            newCoins !== undefined &&
            typeof newCoins === 'number' &&
            remoteUpdateTime > localMutationTime
          ) {
            if (updated.coins !== newCoins) {
              updated.coins = newCoins;
              updated.lastLocalCoinMutationAt = remoteUpdateTime;
              hasChange = true;
            }
          }
          if (newAdsWatched !== undefined && newAdsWatched > updated.dailyAdsWatched) {
            updated.dailyAdsWatched = newAdsWatched;
            hasChange = true;
          }
          if (hasChange) {
            saveUserWallet(updated);
            return updated;
          }
          return prev;
        });
      },
      wallet.memberId,
      (newLogs) => setLogs(newLogs)
    );

    return () => {
      clearInterval(interval);
      clearInterval(fullSyncInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      setUserOfflinePresence(wallet.memberId);
      unsubscribeFirestore();
    };
  }, [wallet.memberId]);
  
  // Ad Modal state
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [isAutoTimerAd, setIsAutoTimerAd] = useState<boolean>(false);
  const [tabClicks, setTabClicks] = useState<Record<string, number>>({
    HOME: 0,
    HASHTAGS: 0,
    COINS: 0,
    ORDERS: 0,
    SETTINGS: 0
  });

  // Restore active tab on boot (never auto-open ad modal on app startup)
  useEffect(() => {
    try {
      localStorage.removeItem('roxyefollow_ad_modal_open');
      const savedTab = localStorage.getItem('roxyefollow_active_tab');
      if (savedTab && ['HOME', 'HASHTAGS', 'COINS', 'ORDERS', 'SETTINGS'].includes(savedTab)) {
        setActiveTab(savedTab as MainTab);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Branch.io Smart Deep Link & Deferred Attribution Check on Launch
  useEffect(() => {
    if (!wallet.memberId) return;
    const hasClaimed = localStorage.getItem('instaboost_referral_claimed') === 'true' || wallet.referralClaimed;
    if (hasClaimed) return;

    checkAndApplyBranchDeferredAttribution(wallet.memberId, (msg, bonusCoins) => {
      setToastMsg(msg);
      setWallet((prev) => {
        const updated = { ...prev, coins: prev.coins + bonusCoins, referralClaimed: true };
        saveUserWallet(updated);
        syncUserDeviceWithServer(updated);
        return updated;
      });
    });
  }, [wallet.memberId, wallet.referralClaimed]);

  const handleSelectTab = (tab: MainTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('roxyefollow_active_tab', tab);
    } catch (e) {
      // ignore
    }
    window.scrollTo(0, 0);
  };

  const handleCloseAnnouncement = () => {
    setShowAnnouncementModal(false);
    setHasDismissedAnnouncement(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('roxyefollow_announcement_date', todayStr);
    } catch (e) {
      // ignore
    }
  };

  const handleClaimAnnouncementBonus = (bonusCoins: number) => {
    setShowAnnouncementModal(false);
    setHasDismissedAnnouncement(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('roxyefollow_announcement_date', todayStr);
    } catch (e) {
      // ignore
    }

    if (bonusCoins > 0) {
      const updatedWallet = {
        ...wallet,
        coins: wallet.coins + bonusCoins
      };
      handleUpdateWallet(updatedWallet);
      setToastMsg(`🎁 Claimed ${bonusCoins} Free Bonus Coins!`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // Other Modals
  const [selectedPaymentPackage, setSelectedPaymentPackage] = useState<CoinPackage | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [activeDialog, setActiveDialog] = useState<'SUPPORT' | 'PRIVACY' | 'TERMS' | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showReturnToAppBanner, setShowReturnToAppBanner] = useState<boolean>(false);

  // Handle boot redirect check & admin mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from_app') === '1') {
      setShowReturnToAppBanner(true);
    }
    const isStandaloneAdminMode = urlParams.get('mode') === 'admin' || urlParams.get('app') === 'admin';

    if (isStandaloneAdminMode) {
      setShowAdminLoginModal(true);
      setCurrentScreen('ADMIN');
      return;
    }

    // Check if user returned via Custom Scheme or Deep Link with memberId
    const extMemberId = urlParams.get('memberId') || urlParams.get('member_id');
    if (extMemberId) {
      restoreUserByMemberId(extMemberId).then((res) => {
        if (res.success && res.wallet) {
          setWallet(res.wallet);
          setCurrentScreen('MAIN_APP');
          handleShowToast(res.message || `🎉 Welcome back #${res.wallet.memberId}!`);
        }
      });
      return;
    }

    // Check if Appcreator24 or external source provided user credentials via URL
    const extEmail = urlParams.get('email') || urlParams.get('user_email') || urlParams.get('google_email');
    if (extEmail && extEmail.includes('@')) {
      const extName = urlParams.get('name') || urlParams.get('user_name') || urlParams.get('nick');
      const extUid = urlParams.get('uid') || urlParams.get('id') || urlParams.get('user_id');
      handleExternalVerifiedUser(
        { email: extEmail, name: extName || undefined, uid: extUid || undefined },
        adminConfig.pricing?.googleWelcomeBonusCoins ?? 10
      ).then((res) => {
        if (res.success && res.wallet) {
          setWallet(res.wallet);
          setCurrentScreen('MAIN_APP');
          handleShowToast(res.message || `🎉 Welcome ${res.wallet.displayName || res.wallet.email}!`);
        }
      });
      return;
    }

    // Listen for custom external auth events
    const handleCustomAuthEvent = (e: any) => {
      const res = e?.detail;
      if (res && res.success && res.wallet) {
        setWallet(res.wallet);
        setCurrentScreen('MAIN_APP');
        handleShowToast(res.message || '🎉 Signed In Successfully!');
      }
    };
    window.addEventListener('user-auth-success', handleCustomAuthEvent);
    return () => {
      window.removeEventListener('user-auth-success', handleCustomAuthEvent);
    };
  }, []);

  // Request Notification Permission / Register SW on App Load
  useEffect(() => {
    if (currentScreen === 'MAIN_APP') {
      const perm = getNotificationPermission();
      if (perm === 'default') {
        const timer = setTimeout(() => {
          setShowNotifPermModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      } else if (perm === 'granted') {
        import('./utils/notifications').then(m => m.registerServiceWorker());
      }
    }
  }, [currentScreen]);

  // 5-Minute Bonus Ad Reminder Toast (Only shows non-intrusive toast, no auto popups)
  useEffect(() => {
    if (currentScreen !== 'MAIN_APP' || !adminConfig.ads.enabled) return;

    const FIVE_MINUTES_MS = 5 * 60 * 1000; // 5 minutes = 300,000 ms

    const interval = setInterval(() => {
      const maxAds = adminConfig.ads?.maxDailyAdsPerUser ?? wallet.maxDailyAds ?? 10;
      if (wallet.dailyAdsWatched < maxAds) {
        handleShowToast('🎁 Bonus Ad Ready! Tap Watch Ad in Coins tab (+10 Coins)');
      }
    }, FIVE_MINUTES_MS);

    return () => clearInterval(interval);
  }, [currentScreen, adminConfig.ads.enabled, wallet.dailyAdsWatched, wallet.maxDailyAds]);



  // Listen for admin push notification broadcasts
  useEffect(() => {
    const handlePushNotif = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationPayload>;
      if (customEvent.detail) {
        sendDeviceNotification(customEvent.detail.title, {
          body: customEvent.detail.message
        });
      }
    };

    window.addEventListener('roxyefollow_push_notification', handlePushNotif);
    return () => window.removeEventListener('roxyefollow_push_notification', handlePushNotif);
  }, []);

  // Save State updates to LocalStorage & broadcast
  const handleUpdateAdminConfig = (newConfig: AdminConfig) => {
    setAdminConfig(newConfig);
    saveAdminConfig(newConfig);
  };

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveOrders(newOrders);
  };

  const handleUpdateWallet = (newWallet: UserWallet) => {
    const mutationTime = newWallet.lastLocalCoinMutationAt || Date.now();
    const walletWithMutation: UserWallet = {
      ...newWallet,
      lastLocalCoinMutationAt: mutationTime
    };
    setWallet(walletWithMutation);
    saveUserWallet(walletWithMutation);
    syncUserDeviceWithServer(walletWithMutation);

    setUsers((prevUsers) => {
      let found = false;
      const updated = prevUsers.map((u) => {
        if (u.memberId === walletWithMutation.memberId) {
          found = true;
          return {
            ...u,
            coins: walletWithMutation.coins,
            coinsUpdatedByAdmin: false,
            updatedAt: mutationTime,
            lastLocalCoinMutationAt: mutationTime
          };
        }
        return u;
      });
      if (!found) {
        updated.push({
          id: `usr_${walletWithMutation.memberId}`,
          memberId: walletWithMutation.memberId,
          name: `User #${walletWithMutation.memberId}`,
          coins: walletWithMutation.coins,
          ordersCount: 0,
          status: walletWithMutation.status || 'ACTIVE',
          joinedDate: 'Today',
          isOnline: true,
          lastActive: 'Just now',
          deviceType: 'Mobile App',
          currentScreen: 'User App View',
          totalCoinsSpent: 0,
          location: 'India',
          coinsUpdatedByAdmin: false,
          updatedAt: mutationTime,
          lastLocalCoinMutationAt: mutationTime
        });
      }
      saveUsersList(updated);
      return updated;
    });
  };

  const handleUpdateUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    saveUsersList(newUsers);

    const activeUserInList = newUsers.find((u) => u.memberId === wallet.memberId);
    if (activeUserInList) {
      if (activeUserInList.status) {
        localStorage.setItem('roxyefollow_user_status', activeUserInList.status);
      }
      const localMutationTime = wallet.lastLocalCoinMutationAt || 0;
      const remoteUpdateTime = activeUserInList.updatedAt || 0;
      if (
        activeUserInList.coinsUpdatedByAdmin === true &&
        typeof activeUserInList.coins === 'number' &&
        remoteUpdateTime > localMutationTime &&
        activeUserInList.coins !== wallet.coins
      ) {
        const updatedWallet: UserWallet = {
          ...wallet,
          coins: activeUserInList.coins,
          status: activeUserInList.status,
          lastLocalCoinMutationAt: remoteUpdateTime
        };
        setWallet(updatedWallet);
        saveUserWallet(updatedWallet);
      }
    }
  };

  // Sync state on broadcast events
  useEffect(() => {
    const handleUsersUpdated = () => {
      const reloadedUsers = loadUsersList();
      setUsers(reloadedUsers);
      const activeUserInList = reloadedUsers.find((u) => u.memberId === wallet.memberId);
      const localMutationTime = wallet.lastLocalCoinMutationAt || 0;
      const remoteUpdateTime = activeUserInList?.updatedAt || 0;
      if (
        activeUserInList &&
        activeUserInList.coinsUpdatedByAdmin === true &&
        typeof activeUserInList.coins === 'number' &&
        remoteUpdateTime > localMutationTime &&
        activeUserInList.coins !== wallet.coins
      ) {
        setWallet((w) => ({
          ...w,
          coins: activeUserInList.coins,
          lastLocalCoinMutationAt: remoteUpdateTime
        }));
      }
    };

    window.addEventListener('instaboost_users_updated', handleUsersUpdated);

    return () => {
      window.removeEventListener('instaboost_users_updated', handleUsersUpdated);
    };
  }, [wallet.coins, wallet.memberId]);

  const handleAddActivityLog = (newLog: ActivityLog) => {
    const updated = [newLog, ...logs];
    setLogs(updated);
    saveActivityLogs(updated);
  };

  // Global listener for app refocus / return from ad browsing (e.g. Click & Earn banner or watched ad)
  useEffect(() => {
    const handleReturnFromAd = () => {
      if (document.visibilityState === 'visible' || document.hasFocus()) {
        const res = processAdSession((earnedCoins, screen, adType) => {
          const isBanner = adType === 'BANNER_CLICK';
          handleRewardEarned(earnedCoins, !isBanner);
        });

        // If a video ad session is still pending (remaining time), reopen the ad modal so countdown continues!
        if (res.status === 'PENDING' && res.session?.type === 'WATCH_AD') {
          setShowAdModal(true);
        }
      }
    };

    const handleBannerClicked = (e: Event) => {
      const customEvent = e as CustomEvent<{ coins?: number }>;
      const coins = customEvent.detail?.coins || adminConfig.ads?.coinsPerBannerClick || 5;
      handleShowToast(`⏳ Ad opened! Return to app anytime to collect +${coins} Coins.`);
    };

    // Check immediately on mount in case app reloaded from background
    handleReturnFromAd();

    window.addEventListener('visibilitychange', handleReturnFromAd);
    window.addEventListener('focus', handleReturnFromAd);
    window.addEventListener('pageshow', handleReturnFromAd);
    window.addEventListener('roxyefollow_banner_clicked', handleBannerClicked);

    return () => {
      window.removeEventListener('visibilitychange', handleReturnFromAd);
      window.removeEventListener('focus', handleReturnFromAd);
      window.removeEventListener('pageshow', handleReturnFromAd);
      window.removeEventListener('roxyefollow_banner_clicked', handleBannerClicked);
    };
  }, [wallet.coins, wallet.dailyAdsWatched, adminConfig.ads]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (currentScreen === 'LOADING') {
        setCurrentScreen('MAIN_APP');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentScreen]);

  const handleShowToast = (msg: string) => {
    setToastMsg(msg);
  };

  const handleRewardEarned = (earnedCoins: number, isVideoAd: boolean = true) => {
    const maxAds = adminConfig.ads?.maxDailyAdsPerUser ?? wallet.maxDailyAds ?? 10;
    if (isVideoAd && wallet.dailyAdsWatched >= maxAds) {
      handleShowToast(`⚠️ Today's ad limit reached (${wallet.dailyAdsWatched}/${maxAds})! Resets at midnight.`);
      return;
    }
    const currentWallet = loadUserWallet();
    const baseCoins = Math.max(wallet.coins, currentWallet.coins);
    const updated = {
      ...wallet,
      coins: Math.round((baseCoins + earnedCoins) * 100) / 100,
      dailyAdsWatched: isVideoAd ? wallet.dailyAdsWatched + 1 : wallet.dailyAdsWatched,
      maxDailyAds: maxAds
    };
    handleUpdateWallet(updated);
    handleShowToast(`🎉 +${earnedCoins} Free Coins Credited! Total: ${updated.coins}`);

    // Log real-time activity
    handleAddActivityLog({
      id: `log_${Date.now()}`,
      type: 'AD_WATCHED',
      title: isVideoAd ? 'Rewarded Ad View' : 'Picture Ad Reward',
      detail: `Member #${wallet.memberId} claimed ${isVideoAd ? 'AdMob video' : 'Picture Banner'} (+${earnedCoins} Coins)`,
      timestamp: 'Just now',
      userMemberId: wallet.memberId,
      badgeColor: 'pink'
    });
  };

  const handleOpenAdModal = () => {
    const maxAds = adminConfig.ads?.maxDailyAdsPerUser ?? wallet.maxDailyAds ?? 10;
    if (wallet.dailyAdsWatched >= maxAds) {
      handleShowToast(`⚠️ Daily ad limit reached (${wallet.dailyAdsWatched}/${maxAds})! Resets at midnight.`);
      return;
    }

    const coinsToEarn = adminConfig.ads?.coinsPerRewardAd || 50;

    // 1. Save ad session with target coins
    saveAdSession(coinsToEarn, activeTab.toUpperCase(), 15, 'WATCH_AD');

    // 2. Open Adsterra Popunder / Direct SmartLink
    openAdsterraPopunder(adminConfig.ads?.directSmartlinkUrl);

    // 3. Open Video Ad countdown modal inside the app
    setIsAutoTimerAd(false);
    setShowAdModal(true);
  };

  const handleResetDailyAdLimits = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      localStorage.removeItem(`rox_sliding_ad_claims_${todayStr}`);
    } catch {
      // ignore
    }
    const updatedWallet = {
      ...wallet,
      dailyAdsWatched: 0,
      lastAdResetDate: todayStr
    };
    handleUpdateWallet(updatedWallet);

    try {
      await fetch(getApiUrl('/api/users/reset-daily-ads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchServerUsers().then((uList) => {
        if (uList && Array.isArray(uList)) {
          setUsers(uList);
        }
      });
    } catch {
      // ignore
    }

    handleShowToast('✅ All users daily ad limits reset to 0!');
  };

  const handlePaymentSuccess = (coinsBought: number) => {
    const updated = {
      ...wallet,
      coins: wallet.coins + coinsBought
    };
    handleUpdateWallet(updated);
    handleShowToast(`Successfully added +${coinsBought} Coins to your wallet!`);

    // Log real-time activity
    handleAddActivityLog({
      id: `log_${Date.now()}`,
      type: 'COIN_PURCHASE',
      title: 'Coin Package Purchase',
      detail: `Member #${wallet.memberId} bought +${coinsBought} Coins`,
      timestamp: 'Just now',
      userMemberId: wallet.memberId,
      badgeColor: 'blue'
    });
  };

  // Place order with instant SMM API auto-forwarding!
  const handlePlaceOrder = async (newOrder: Order) => {
    const activeMemberId = String(newOrder.userMemberId || wallet.memberId || '100001').trim();

    // 1. Deduct exact decimal coins from wallet
    const now = Date.now();
    const updatedWallet: UserWallet = {
      ...wallet,
      coins: Math.max(0, Math.round((wallet.coins - newOrder.coinsSpent) * 100) / 100),
      lastLocalCoinMutationAt: now
    };
    handleUpdateWallet(updatedWallet);

    // 2. Prepend order with verified userMemberId
    let finalOrder: Order = {
      ...newOrder,
      userMemberId: activeMemberId
    };

    // 3. Auto-Forward to SMM API if enabled in Admin Panel
    if (adminConfig.smmApi.enabled && adminConfig.smmApi.autoForward) {
      const apiRes = await submitOrderToSmmApi(finalOrder, adminConfig.smmApi);
      if (apiRes.success) {
        finalOrder = {
          ...finalOrder,
          status: 'IN_PROGRESS',
          smmOrderId: apiRes.orderId,
          smmResponse: apiRes.rawResponse
        };
        handleShowToast(`Order auto-sent to SMM API! Order ID: ${apiRes.orderId}`);
      }
    }

    const updatedOrdersList = [finalOrder, ...orders];
    handleUpdateOrders(updatedOrdersList);
    setLastPlacedOrder(finalOrder);

    // Log real-time activity for Admin Panel live stream!
    handleAddActivityLog({
      id: `log_${Date.now()}`,
      type: 'ORDER_PLACED',
      title: 'Real-Time Order Placed',
      detail: `Member #${activeMemberId} ordered ${finalOrder.quantity} ${finalOrder.serviceType} (${finalOrder.coinsSpent} Coins) [Order #${finalOrder.id}]`,
      timestamp: 'Just now',
      userMemberId: activeMemberId,
      badgeColor: 'amber'
    });

    // Update active user count, coins, and stats
    setUsers((prevUsers) => {
      let found = false;
      const updated = prevUsers.map((u) => {
        if (u.memberId === activeMemberId) {
          found = true;
          return {
            ...u,
            ordersCount: (u.ordersCount || 0) + 1,
            coins: updatedWallet.coins,
            totalCoinsSpent: (u.totalCoinsSpent || 0) + (newOrder.coinsSpent || 0),
            lastActive: '🟢 Just ordered',
            isOnline: true,
            updatedAt: Date.now(),
            coinsUpdatedByAdmin: false
          };
        }
        return u;
      });
      if (!found) {
        updated.push({
          id: `usr_${activeMemberId}`,
          memberId: activeMemberId,
          name: `User #${activeMemberId}`,
          coins: updatedWallet.coins,
          ordersCount: 1,
          status: 'ACTIVE',
          joinedDate: 'Today',
          isOnline: true,
          lastActive: '🟢 Just ordered',
          deviceType: 'Mobile App',
          currentScreen: 'User App View',
          totalCoinsSpent: newOrder.coinsSpent || 0,
          location: 'India',
          updatedAt: Date.now(),
          coinsUpdatedByAdmin: false
        });
      }
      saveUsersList(updated);
      return updated;
    });
  };

  const handleRefundUser = (coinsToRefund: number) => {
    const updatedWallet = {
      ...wallet,
      coins: wallet.coins + coinsToRefund
    };
    handleUpdateWallet(updatedWallet);
  };

  const handleOpenAdminClick = () => {
    // Strictly require Admin Password for access
    setShowAdminLoginModal(true);
  };

  // Simulate Live Activity for testing
  const handleSimulateLiveActivity = () => {
    const sampleMembers = ['100001', '100002'];
    const randomMember = sampleMembers[Math.floor(Math.random() * sampleMembers.length)];
    const services = [
      'Instagram Followers',
      'Instagram Likes',
      'Reels Views',
      'Custom Comments',
      'Reels Shares & Boost',
      'Instagram Repost',
      'Instagram Saves',
      'Instagram Reach + Impressions + Profile visits (≈10%)'
    ];
    const randomService = services[Math.floor(Math.random() * services.length)];
    const coins = (Math.floor(Math.random() * 5) + 1) * 20;

    const newSimulatedOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 899)}`,
      userMemberId: randomMember,
      serviceType: randomService,
      targetUrl: randomService.includes('Follower') 
        ? `https://instagram.com/user_${Math.random().toString(36).substr(2, 5)}`
        : `https://instagram.com/p/${Math.random().toString(36).substr(2, 6)}`,
      quantity: coins * 5,
      coinsSpent: coins,
      status: 'IN_PROGRESS',
      dateFormatted: 'Just now'
    };

    handleUpdateOrders([newSimulatedOrder, ...orders]);
    handleAddActivityLog({
      id: `log_${Date.now()}`,
      type: 'ORDER_PLACED',
      title: 'Real-Time Order Placed',
      detail: `Member ${randomMember} ordered ${newSimulatedOrder.quantity} ${randomService}`,
      timestamp: 'Just now',
      userMemberId: randomMember,
      badgeColor: 'amber'
    });

    // Toggle user online
    const updatedUsers = users.map((u) => {
      if (u.memberId === randomMember) {
        return {
          ...u,
          isOnline: true,
          lastActive: 'Just now',
          ordersCount: u.ordersCount + 1
        };
      }
      return u;
    });
    handleUpdateUsers(updatedUsers);
    handleShowToast(`Simulated live activity for member ${randomMember}!`);
  };

  const userOrders = orders.filter((o) => o.userMemberId === wallet.memberId);
  const pendingOrdersCount = userOrders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'PROCESSING').length;

  // Screen Conditionals
  const isGoogleAuthenticated = isGoogleAuthActive(wallet);

  // Google Login Gate Screen - Required before entry into main app
  if (currentScreen === 'LOGIN' || (!isGoogleAuthenticated && currentScreen !== 'ADMIN')) {
    return (
      <>
        <LoginScreen
          welcomeBonusCoins={adminConfig.pricing?.googleWelcomeBonusCoins ?? 10}
          onLoginSuccess={(updatedWallet, isNewUser, welcomeMsg) => {
            setWallet(updatedWallet);
            setCurrentScreen('MAIN_APP');
            handleShowToast(welcomeMsg || (isNewUser ? `🎉 Welcome! +${adminConfig.pricing?.googleWelcomeBonusCoins ?? 10} Coins Credited` : '👋 Welcome Back!'));
          }}
          onOpenDialog={(type) => setActiveDialog(type)}
          onShowToast={handleShowToast}
        />
        <SupportModal
          isOpen={activeDialog === 'SUPPORT'}
          onClose={() => setActiveDialog(null)}
        />
        <PrivacyTermsModal
          type={activeDialog === 'PRIVACY' || activeDialog === 'TERMS' ? activeDialog : null}
          isOpen={activeDialog === 'PRIVACY' || activeDialog === 'TERMS'}
          onClose={() => setActiveDialog(null)}
        />
        <Toast
          message={toastMsg}
          onDismiss={() => setToastMsg(null)}
        />
      </>
    );
  }

  if (currentScreen === 'LOADING') {
    if (!isOnline) {
      return (
        <LoadingScreen
          isOnline={isOnline}
          onRetry={() => {
            setIsOnline(true);
            setCurrentScreen('MAIN_APP');
          }}
        />
      );
    }
    // If online, don't display "Connecting to Server..." screen
  }

  // Admin Screen Mode
  if (currentScreen === 'ADMIN') {
    return (
      <AdminScreen
        config={adminConfig}
        orders={orders}
        users={users}
        logs={logs}
        onUpdateConfig={handleUpdateAdminConfig}
        onUpdateOrders={handleUpdateOrders}
        onUpdateUsers={handleUpdateUsers}
        onRefundUser={handleRefundUser}
        onResetDefaults={() => handleUpdateAdminConfig(DEFAULT_ADMIN_CONFIG)}
        onBackToApp={() => setCurrentScreen('MAIN_APP')}
        onTriggerTestAd={() => {
          setIsAutoTimerAd(false);
          setShowAdModal(true);
        }}
        onSimulateLiveActivity={handleSimulateLiveActivity}
        onResetDailyAdLimits={handleResetDailyAdLimits}
        isRainEnabled={isRainEnabled}
        onToggleRain={handleToggleRain}
        onShowToast={handleShowToast}
      />
    );
  }

  // App Maintenance Screen (when maintenanceMode is active and not in Admin)
  if (adminConfig.maintenanceMode) {
    return (
      <>
        <MaintenanceScreen onAdminLoginClick={() => setShowAdminLoginModal(true)} />
        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={() => {
            setIsAdminUnlocked(true);
            setShowAdminLoginModal(false);
            setCurrentScreen('ADMIN');
          }}
          correctPassword={adminConfig.adminPassword}
        />
      </>
    );
  }

  // Force App Update Screen (when admin publishes an update)
  const isUpdateMandatory = isUpdateRequired(CURRENT_APP_VERSION, adminConfig.appUpdate);
  if (isUpdateMandatory) {
    return (
      <>
        <ForceUpdateModal
          updateConfig={adminConfig.appUpdate}
          adminPassword={adminConfig.adminPassword}
          onOpenAdmin={() => {
            setIsAdminUnlocked(true);
            setCurrentScreen('ADMIN');
          }}
        />
      </>
    );
  }

  // Active User Blocked Screen (when user is BLOCKED by Admin)
  const activeUser = users.find((u) => u.memberId === wallet.memberId || u.id === 'usr_current');
  const storedBlockedStatus = localStorage.getItem('roxyefollow_user_status');
  const isUserBlocked = activeUser?.status === 'BLOCKED' || wallet.status === 'BLOCKED' || storedBlockedStatus === 'BLOCKED';

  if (isUserBlocked && currentScreen === 'MAIN_APP') {
    return (
      <>
        <BlockedScreen
          memberId={wallet.memberId}
          onContactSupportClick={() => setActiveDialog('SUPPORT')}
          onAdminLoginClick={() => setShowAdminLoginModal(true)}
          onUnlockSuccess={() => {
            localStorage.setItem('roxyefollow_user_status', 'ACTIVE');
            setWallet((w) => {
              const updated = { ...w, status: 'ACTIVE' as const };
              saveUserWallet(updated);
              return updated;
            });
            setUsers((prev) =>
              prev.map((u) =>
                u.memberId === wallet.memberId ? { ...u, status: 'ACTIVE' as const } : u
              )
            );
          }}
        />
        {activeDialog === 'SUPPORT' && (
          <SupportModal isOpen={true} onClose={() => setActiveDialog(null)} />
        )}
        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={() => {
            setIsAdminUnlocked(true);
            setShowAdminLoginModal(false);
            setCurrentScreen('ADMIN');
          }}
          correctPassword={adminConfig.adminPassword}
        />
      </>
    );
  }

  // Ensure wallet has authUid and isGoogleLinked safely in useEffect
  const themeClass = themeMode === 'light' 
    ? 'theme-light' 
    : themeMode === 'classic-dark' 
    ? 'theme-classic-dark' 
    : 'theme-pink-monsoon';

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-clip ${themeMode === 'light' ? 'bg-slate-100' : 'bg-[#080209]'} text-slate-100 font-sans antialiased relative selection:bg-pink-500 selection:text-white ${themeClass}`}>
      {/* Live Animated Monsoon Rain Canvas */}
      <RainBackground enabled={isRainEnabled} intensity="monsoon" />

      {/* Centered App Viewport */}
      <div className={`max-w-md mx-auto min-h-screen w-full overflow-x-clip ${themeMode === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#0f0412] text-slate-100 border-pink-500/25'} relative shadow-2xl shadow-pink-950/40 flex flex-col border-x z-10`}>
        {/* Solution 2: Return to Rox Follow Native App if launched from App/Chrome intent */}
        {showReturnToAppBanner && (
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-3 py-2 text-xs flex items-center justify-between shadow-lg sticky top-0 z-50">
            <div className="flex items-center gap-1.5 font-bold truncate">
              <span>🎉 Logged in as #{wallet.memberId}!</span>
            </div>
            <a
              href={getAppReturnIntentUrl(wallet.memberId, wallet.email)}
              className="px-3 py-1 bg-white text-slate-900 font-bold rounded-lg text-[11px] shadow hover:bg-slate-100 transition-all shrink-0 ml-2"
            >
              Open Rox App ➔
            </a>
          </div>
        )}

        <TopBar
          wallet={wallet}
          onOpenCoins={() => setActiveTab('COINS')}
          onOpenAdmin={handleOpenAdminClick}
          isOnline={isOnline}
        />

        {/* Banner Ad placed at top under TopBar with Click & Earn Coins */}
        <AdBanner
          id="top_bar_banner"
          className="my-2 px-2"
          rewardCoins={adminConfig.ads?.coinsPerBannerClick ?? 5}
          smartlinkUrl={adminConfig.ads?.directSmartlinkUrl}
          onRewardClaim={(coins) => handleRewardEarned(coins, false)}
        />

        {/* Top Sliding Social Banner Ad (AppCreator24 style) */}
        <TopSlidingAd
          smartlinkUrl={adminConfig.ads?.directSmartlinkUrl}
          adminConfig={adminConfig}
          wallet={wallet}
          onRewardClaim={handleRewardEarned}
          onShowToast={handleShowToast}
        />

        <main className="flex-1 w-full max-w-full overflow-x-clip pb-24">
          {activeTab === 'HOME' && (
            <HomeScreen
              wallet={wallet}
              pricing={adminConfig.pricing}
              adminConfig={adminConfig}
              onOpenAdModal={handleOpenAdModal}
              onRewardClaim={handleRewardEarned}
              onPlaceOrder={handlePlaceOrder}
              onOpenCoins={() => setActiveTab('COINS')}
              onShowToast={handleShowToast}
            />
          )}

          {activeTab === 'TAGS' && (
            <HashtagsScreen
              wallet={wallet}
              adminConfig={adminConfig}
              onOpenAdModal={handleOpenAdModal}
              onRewardClaim={handleRewardEarned}
              onShowToast={handleShowToast}
            />
          )}

          {activeTab === 'COINS' && (
            <CoinsScreen
              wallet={wallet}
              adminConfig={adminConfig}
              onOpenAdModal={handleOpenAdModal}
              onRewardClaim={handleRewardEarned}
              onSelectPaymentPackage={(pkg) => setSelectedPaymentPackage(pkg)}
              onOpenOrders={() => setActiveTab('ORDERS')}
            />
          )}

          {activeTab === 'ORDERS' && (
            <OrdersScreen
              orders={orders.filter((o) => o.userMemberId === wallet.memberId)}
              onShowToast={handleShowToast}
              onGoToOrderForm={() => setActiveTab('HOME')}
              wallet={wallet}
              adminConfig={adminConfig}
              onOpenAdModal={handleOpenAdModal}
              onRewardClaim={handleRewardEarned}
            />
          )}

          {activeTab === 'SETTINGS' && (
            <SettingsScreen
              wallet={wallet}
              welcomeBonusCoins={adminConfig.pricing?.googleWelcomeBonusCoins ?? 10}
              onOpenDialog={(type) => setActiveDialog(type)}
              onShowToast={handleShowToast}
              onOpenAdmin={handleOpenAdminClick}
              isAdminAllowed={isAdminAllowed}
              onUpdateWallet={(updated) => setWallet(updated)}
              onLogout={() => {
                const refreshed = loadUserWallet();
                setWallet(refreshed);
                setCurrentScreen('LOGIN');
                handleShowToast('👋 Signed out of account.');
              }}
            />
          )}
        </main>

        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          pendingOrdersCount={pendingOrdersCount}
          smartlinkUrl={adminConfig.ads?.directSmartlinkUrl}
        />

        {/* Modals & Popups */}
        <ReferralModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          wallet={wallet}
          adminConfig={adminConfig}
          onUpdateWallet={handleUpdateWallet}
          onShowToast={handleShowToast}
        />
        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={() => {
            setIsAdminUnlocked(true);
            setIsAdminAllowed(true);
            localStorage.setItem('roxyefollow_is_admin', 'true');
            setShowAdminLoginModal(false);
            setCurrentScreen('ADMIN');
          }}
          correctPassword={adminConfig.adminPassword}
        />

        <AnnouncementModal
          announcement={adminConfig.announcement}
          isOpen={showAnnouncementModal && !hasDismissedAnnouncement}
          onClose={handleCloseAnnouncement}
          onClaimBonus={handleClaimAnnouncementBonus}
        />

        <NotificationPermissionModal
          isOpen={showNotifPermModal}
          onClose={() => setShowNotifPermModal(false)}
        />

        <PopunderHandler
          enabled={adminConfig.ads.enabled && currentScreen === 'MAIN_APP'}
          intervalMinutes={adminConfig.ads?.autoAdIntervalMinutes || 4}
          userId={wallet.memberId}
          smartlinkUrl={adminConfig.ads?.directSmartlinkUrl}
        />

        <AdModal
          isOpen={showAdModal}
          onClose={() => setShowAdModal(false)}
          onRewardClaim={handleRewardEarned}
          rewardCoins={adminConfig.ads.coinsPerRewardAd}
          adProvider={adminConfig.ads.provider}
          adUnitId={adminConfig.ads.rewardedAdId}
          isAutoTimerAd={isAutoTimerAd}
          smartlinkUrl={adminConfig.ads.directSmartlinkUrl}
        />

        <PaymentModal
          pkg={selectedPaymentPackage}
          isOpen={!!selectedPaymentPackage}
          onClose={() => setSelectedPaymentPackage(null)}
          onPaymentSuccess={handlePaymentSuccess}
          config={adminConfig}
          userWallet={wallet}
        />

        <OrderSuccessModal
          order={lastPlacedOrder}
          isOpen={!!lastPlacedOrder}
          onClose={() => setLastPlacedOrder(null)}
          onGoToOrders={() => {
            setLastPlacedOrder(null);
            setActiveTab('ORDERS');
          }}
          smartlinkUrl={adminConfig.ads.directSmartlinkUrl}
        />

        <SupportModal
          isOpen={activeDialog === 'SUPPORT'}
          onClose={() => setActiveDialog(null)}
        />

        <PrivacyTermsModal
          type={activeDialog === 'PRIVACY' || activeDialog === 'TERMS' ? activeDialog : null}
          isOpen={activeDialog === 'PRIVACY' || activeDialog === 'TERMS'}
          onClose={() => setActiveDialog(null)}
        />

        <Toast
          message={toastMsg}
          onDismiss={() => setToastMsg(null)}
        />
      </div>
    </div>
  );
}
