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
  syncUserDeviceWithServer
} from './utils/storage';
import { DEFAULT_ADMIN_CONFIG } from './utils/defaultAdminConfig';
import {
  loadAdminConfigFirestore,
  saveAdminConfigFirestore
} from './firebaseService';
import { submitOrderToSmmApi } from './utils/smmService';

import { TopBar } from './components/TopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { AdBanner } from './components/AdBanner';
import { PopunderHandler } from './components/PopunderHandler';
import { AdModal } from './components/AdModal';
import { PaymentModal } from './components/PaymentModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { SupportModal } from './components/SupportModal';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';
import { Toast } from './components/Toast';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AnnouncementModal } from './components/AnnouncementModal';
import { SideSlidingAd } from './components/SideSlidingAd';
import { NotificationPermissionModal } from './components/NotificationPermissionModal';
import { getNotificationPermission, sendDeviceNotification, NotificationPayload } from './utils/notifications';

import { SplashScreen } from './screens/SplashScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { HashtagsScreen } from './screens/HashtagsScreen';
import { CoinsScreen } from './screens/CoinsScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AdminScreen } from './screens/AdminScreen';
import { MaintenanceScreen } from './screens/MaintenanceScreen';
import { BlockedScreen } from './screens/BlockedScreen';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('MAIN_APP');
  const [activeTab, setActiveTab] = useState<MainTab>('HOME');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Loaded Storage State
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(loadAdminConfig);


const [wallet, setWallet] = useState<UserWallet>(loadUserWallet);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [users, setUsers] = useState<UserAccount[]>(loadUsersList);
  const [logs, setLogs] = useState<ActivityLog[]>(loadActivityLogs);
useEffect(() => {
  async function loadFirebaseConfig() {
    const firebaseConfig = await loadAdminConfigFirestore();

    if (firebaseConfig) {
      setAdminConfig({
        ...DEFAULT_ADMIN_CONFIG,
        ...firebaseConfig
      });
    }
  }

  loadFirebaseConfig();
}, []);
  // Modal & Admin Lock States
  const [isAdminAllowed, setIsAdminAllowed] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isParamAdmin = urlParams.get('mode') === 'admin' || urlParams.get('app') === 'admin';
      const storedAdmin = localStorage.getItem('roxyefollow_is_admin') === 'true';
      return isParamAdmin || storedAdmin;
    } catch (e) {
      return false;
    }
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(true);
  const [hasDismissedAnnouncement, setHasDismissedAnnouncement] = useState<boolean>(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastShownDate = localStorage.getItem('roxyefollow_announcement_date');
      return lastShownDate === todayStr;
    } catch {
      return false;
    }
  });
  const [showNotifPermModal, setShowNotifPermModal] = useState<boolean>(false);

  // Real-Time Server Sync across all devices (your phone & friend's phone)
  useEffect(() => {
    const syncServer = async () => {
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
      syncUserDeviceWithServer(wallet);
    };

    syncServer();
    const interval = setInterval(syncServer, 3000); // Poll real-time central server every 3s
    return () => clearInterval(interval);
  }, [wallet]);
  
  // Ad Modal state
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [isAutoTimerAd, setIsAutoTimerAd] = useState<boolean>(false);
  const [navClickCount, setNavClickCount] = useState<number>(0);

  const handleSelectTab = (tab: MainTab) => {
    setActiveTab(tab);
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

    if (adminConfig.ads.enabled && adminConfig.ads.directSmartlinkUrl) {
      try {
        window.open(adminConfig.ads.directSmartlinkUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // popup handled
      }
    }
  };

  // Other Modals
  const [selectedPaymentPackage, setSelectedPaymentPackage] = useState<CoinPackage | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [activeDialog, setActiveDialog] = useState<'SUPPORT' | 'PRIVACY' | 'TERMS' | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Initial Boot Splash -> Main App directly
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isStandaloneAdminMode = urlParams.get('mode') === 'admin' || urlParams.get('app') === 'admin';

    const splashTimer = setTimeout(() => {
      if (isStandaloneAdminMode) {
        setShowAdminLoginModal(true);
      }
      setCurrentScreen('MAIN_APP');
    }, 1000);

    return () => clearTimeout(splashTimer);
  }, []);

  // Request Notification Permission on App Load / Launch
  useEffect(() => {
    if (currentScreen === 'MAIN_APP') {
      if (getNotificationPermission() === 'default') {
        const timer = setTimeout(() => {
          setShowNotifPermModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [currentScreen]);

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
saveAdminConfigFirestore(newConfig);  
};

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveOrders(newOrders);
  };

  const handleUpdateWallet = (newWallet: UserWallet) => {
    setWallet(newWallet);
    saveUserWallet(newWallet);

    setUsers((prevUsers) => {
      const updated = prevUsers.map((u) => {
        if (u.memberId === newWallet.memberId) {
          return { ...u, coins: newWallet.coins };
        }
        return u;
      });
      saveUsersList(updated);
      return updated;
    });
  };

  const handleUpdateUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    saveUsersList(newUsers);

    const activeUserInList = newUsers.find((u) => u.memberId === wallet.memberId);
    if (activeUserInList && activeUserInList.coins !== wallet.coins) {
      const updatedWallet = { ...wallet, coins: activeUserInList.coins };
      setWallet(updatedWallet);
      saveUserWallet(updatedWallet);
    }
  };

  // Sync state on broadcast events
  useEffect(() => {
    const handleUsersUpdated = () => {
      const reloadedUsers = loadUsersList();
      setUsers(reloadedUsers);
      const activeUserInList = reloadedUsers.find((u) => u.memberId === wallet.memberId);
      if (activeUserInList && activeUserInList.coins !== wallet.coins) {
        setWallet((w) => ({ ...w, coins: activeUserInList.coins }));
      }
    };

    const handleWalletUpdated = () => {
      const reloadedWallet = loadUserWallet();
      setWallet(reloadedWallet);
    };

    window.addEventListener('instaboost_users_updated', handleUsersUpdated);
    window.addEventListener('instaboost_wallet_updated', handleWalletUpdated);

    return () => {
      window.removeEventListener('instaboost_users_updated', handleUsersUpdated);
      window.removeEventListener('instaboost_wallet_updated', handleWalletUpdated);
    };
  }, [wallet.coins, wallet.memberId]);

  const handleAddActivityLog = (newLog: ActivityLog) => {
    const updated = [newLog, ...logs];
    setLogs(updated);
    saveActivityLogs(updated);
  };

  // Auto timer disabled as requested - ads only trigger on Watch Ad button click or popup banner claim
  useEffect(() => {
    // Periodic auto ad popup removed
  }, []);

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

  // Handlers
  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleShowToast = (msg: string) => {
    setToastMsg(msg);
  };

  const handleRewardEarned = (earnedCoins: number) => {
    const maxAds = adminConfig.ads?.maxDailyAdsPerUser ?? wallet.maxDailyAds ?? 10;
    if (wallet.dailyAdsWatched >= maxAds) {
      handleShowToast(`⚠️ Today's ad limit reached (${wallet.dailyAdsWatched}/${maxAds})! Resets at midnight.`);
      return;
    }
    const updated = {
      ...wallet,
      coins: Math.round((wallet.coins + earnedCoins) * 100) / 100,
      dailyAdsWatched: wallet.dailyAdsWatched + 1,
      maxDailyAds: maxAds
    };
    handleUpdateWallet(updated);
    handleShowToast(`Earned +${earnedCoins} Free Coins! Balance updated.`);

    // Log real-time activity
    handleAddActivityLog({
      id: `log_${Date.now()}`,
      type: 'AD_WATCHED',
      title: 'Rewarded Ad View',
      detail: `Member #${wallet.memberId} watched AdMob video (+${earnedCoins} Coins)`,
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
    setIsAutoTimerAd(false);
    setShowAdModal(true);
    if (adminConfig.ads.directSmartlinkUrl) {
      try {
        window.open(adminConfig.ads.directSmartlinkUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // popup handled
      }
    }
  };

  const handleResetDailyAdLimits = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
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
      fetchServerUsers().then((uList) => setUsers(uList));
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
    // 1. Deduct exact decimal coins from wallet
    const updatedWallet = {
      ...wallet,
      coins: Math.max(0, Math.round((wallet.coins - newOrder.coinsSpent) * 100) / 100)
    };
    handleUpdateWallet(updatedWallet);

    // 2. Prepend order
    let finalOrder = { ...newOrder };

    // 3. Auto-Forward to SMM API if enabled in Admin Panel
    if (adminConfig.smmApi.enabled && adminConfig.smmApi.autoForward) {
      const apiRes = await submitOrderToSmmApi(newOrder, adminConfig.smmApi);
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
      detail: `Member #${wallet.memberId} ordered ${finalOrder.quantity} ${finalOrder.serviceType} (${finalOrder.coinsSpent} Coins)`,
      timestamp: 'Just now',
      userMemberId: wallet.memberId,
      badgeColor: 'amber'
    });

    // Trigger Smartlink Ad on Successful Order Placement as requested
    if (adminConfig.ads.enabled && adminConfig.ads.directSmartlinkUrl) {
      try {
        window.open(adminConfig.ads.directSmartlinkUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // popup blocker handled
      }
    }

    // Update active user count and stats
    const updatedUsers = users.map((u) => {
      if (u.memberId === wallet.memberId) {
        return {
          ...u,
          ordersCount: u.ordersCount + 1,
          coins: updatedWallet.coins,
          lastActive: 'Just now',
          isOnline: true
        };
      }
      return u;
    });
    handleUpdateUsers(updatedUsers);
  };

  const handleRefundUser = (coinsToRefund: number) => {
    const updatedWallet = {
      ...wallet,
      coins: wallet.coins + coinsToRefund
    };
    handleUpdateWallet(updatedWallet);
  };

  const handleOpenAdminClick = () => {
    if (isAdminUnlocked) {
      setCurrentScreen('ADMIN');
    } else {
      setShowAdminLoginModal(true);
    }
  };

  // Simulate Live Activity for testing
  const handleSimulateLiveActivity = () => {
    const sampleMembers = ['2', '3', '4'];
    const randomMember = sampleMembers[Math.floor(Math.random() * sampleMembers.length)];
    const services = ['Instagram Followers', 'Reel Likes', 'Story Views', 'Post Comments'];
    const randomService = services[Math.floor(Math.random() * services.length)];
    const coins = (Math.floor(Math.random() * 5) + 1) * 20;

    const newSimulatedOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 899)}`,
      userMemberId: randomMember,
      serviceType: randomService,
      targetUrl: `https://instagram.com/p/${Math.random().toString(36).substr(2, 6)}`,
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
  if (currentScreen === 'SPLASH') {
    return <SplashScreen onStart={() => setCurrentScreen('MAIN_APP')} />;
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

  // Active User Blocked Screen (when user is BLOCKED by Admin)
  const activeUser = users.find((u) => u.memberId === wallet.memberId || u.id === 'usr_current');
  const isUserBlocked = activeUser?.status === 'BLOCKED';

  if (isUserBlocked && currentScreen === 'MAIN_APP') {
    return (
      <>
        <BlockedScreen
          memberId={wallet.memberId}
          onContactSupportClick={() => setActiveDialog('SUPPORT')}
          onAdminLoginClick={() => setShowAdminLoginModal(true)}
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

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'} font-sans antialiased relative selection:bg-purple-500 selection:text-white`}>
      {/* Ambient Radial Gradient Mesh Backdrops */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-pink-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Centered App Viewport */}
      <div className="max-w-md mx-auto min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100 relative shadow-2xl shadow-purple-950/30 flex flex-col border-x border-slate-800/80 z-10">
        <TopBar
          wallet={wallet}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenCoins={() => setActiveTab('COINS')}
          onOpenAdmin={handleOpenAdminClick}
          isOnline={isOnline}
        />

        {/* Banner Ad placed at top under TopBar */}
        <AdBanner className="my-2 px-2" />

        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {activeTab === 'HOME' && (
            <HomeScreen
              wallet={wallet}
              pricing={adminConfig.pricing}
              adminConfig={adminConfig}
              onOpenAdModal={handleOpenAdModal}
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
              onShowToast={handleShowToast}
            />
          )}

          {activeTab === 'COINS' && (
            <CoinsScreen
              wallet={wallet}
              adminConfig={adminConfig}
              onOpenAdModal={handleOpenAdModal}
              onSelectPaymentPackage={(pkg) => setSelectedPaymentPackage(pkg)}
            />
          )}

          {activeTab === 'ORDERS' && (
            <OrdersScreen
              orders={orders.filter((o) => o.userMemberId === wallet.memberId)}
              onShowToast={handleShowToast}
              onGoToOrderForm={() => setActiveTab('HOME')}
            />
          )}

          {activeTab === 'SETTINGS' && (
            <SettingsScreen
              wallet={wallet}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
              onOpenDialog={(type) => setActiveDialog(type)}
              onShowToast={handleShowToast}
              onOpenAdmin={handleOpenAdminClick}
              isAdminAllowed={isAdminAllowed}
            />
          )}
        </main>

        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          pendingOrdersCount={pendingOrdersCount}
        />

        {/* Modals & Popups */}
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
          directSmartlinkUrl={adminConfig.ads.directSmartlinkUrl}
        />

        <NotificationPermissionModal
          isOpen={showNotifPermModal}
          onClose={() => setShowNotifPermModal(false)}
        />

        <PopunderHandler
          smartlinkUrl={adminConfig.ads.directSmartlinkUrl}
          enabled={adminConfig.ads.enabled && activeTab !== 'ADMIN'}
        />

        <SideSlidingAd
          smartlinkUrl={adminConfig.ads.directSmartlinkUrl}
          adminConfig={adminConfig}
          wallet={wallet}
          onOpenAdModal={handleOpenAdModal}
        />

        <AdModal
          isOpen={showAdModal}
          onClose={() => setShowAdModal(false)}
          onRewardClaim={handleRewardEarned}
          rewardCoins={adminConfig.ads.coinsPerRewardAd}
          adProvider={adminConfig.ads.provider}
          isAutoTimerAd={isAutoTimerAd}
          smartlinkUrl={adminConfig.ads.directSmartlinkUrl}
        />

        <PaymentModal
          pkg={selectedPaymentPackage}
          isOpen={!!selectedPaymentPackage}
          onClose={() => setSelectedPaymentPackage(null)}
          onPaymentSuccess={handlePaymentSuccess}
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
