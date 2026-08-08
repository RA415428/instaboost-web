import React, { useState } from 'react';
import { 
  Shield, 
  Zap, 
  Globe, 
  Tv, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Bell, 
  Settings, 
  Smartphone,
  ChevronDown,
  Menu,
  X,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { ActivityLog, AdminConfig, Order, UserAccount } from '../types';
import { AdminOverview } from '../components/Admin/AdminOverview';
import { AdminSmmApi } from '../components/Admin/AdminSmmApi';
import { AdminAdsConfig } from '../components/Admin/AdminAdsConfig';
import { AdminPricing } from '../components/Admin/AdminPricing';
import { AdminOrders } from '../components/Admin/AdminOrders';
import { AdminUsers } from '../components/Admin/AdminUsers';
import { AdminAnnouncements } from '../components/Admin/AdminAnnouncements';
import { AdminSettings } from '../components/Admin/AdminSettings';

interface AdminScreenProps {
  config: AdminConfig;
  orders: Order[];
  users: UserAccount[];
  logs?: ActivityLog[];
  onUpdateConfig: (newConfig: AdminConfig) => void;
  onUpdateOrders: (updatedOrders: Order[]) => void;
  onUpdateUsers: (updatedUsers: UserAccount[]) => void;
  onRefundUser: (coins: number) => void;
  onResetDefaults: () => void;
  onBackToApp: () => void;
  onTriggerTestAd: () => void;
  onSimulateLiveActivity?: () => void;
  onResetDailyAdLimits?: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  config,
  orders,
  users,
  logs = [],
  onUpdateConfig,
  onUpdateOrders,
  onUpdateUsers,
  onRefundUser,
  onResetDefaults,
  onBackToApp,
  onTriggerTestAd,
  onSimulateLiveActivity,
  onResetDailyAdLimits
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const onlineCount = users.filter((u) => u.isOnline !== false).length;

  const menuGroups = [
    {
      group: 'Core Control',
      items: [
        { id: 'overview', label: 'Overview & Realtime', desc: 'Live stats, activity feed & stats', icon: Zap },
        { id: 'smm_api', label: 'SMM API Provider', desc: 'Connect PerfectPanel / SMM services', icon: Globe },
      ]
    },
    {
      group: 'Monetization',
      items: [
        { id: 'ads_admob', label: 'Ads & AdMob', desc: 'Manage Banner, Interstitial, Popunder', icon: Tv },
        { id: 'pricing', label: 'Pricing & Coin Rates', desc: 'Adjust Coin cost per follower/like', icon: DollarSign },
      ]
    },
    {
      group: 'User Management',
      items: [
        { id: 'orders', label: 'Orders', desc: 'Track & auto-sync order status', icon: ShoppingBag, badge: orders.length.toString() },
        { id: 'users', label: 'User Accounts', desc: 'Manage user coins, block/unblock', icon: Users, badge: onlineCount ? `${onlineCount} Live` : users.length.toString() },
        { id: 'announcements', label: 'In-App Popup Banner', desc: 'Push notices & link updates to app', icon: Bell },
      ]
    },
    {
      group: 'System',
      items: [
        { id: 'settings', label: 'Security & Backup', desc: 'Reset defaults & Admin pass key', icon: Settings },
      ]
    }
  ];

  const allNavItems = menuGroups.flatMap(g => g.items);
  const currentItem = allNavItems.find(i => i.id === activeTab) || allNavItems[0];
  const CurrentIcon = currentItem.icon;

  return (
    <div data-admin-panel="true" className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 font-sans pb-12 select-none">
      {/* Top Header Switcher */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-base tracking-wide">Admin Control Panel</h1>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              RoxyeFollow SMM forwarding, monetization, live orders & users
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToApp}
            className="px-3.5 py-2 bg-gradient-to-r from-slate-800 to-slate-800 hover:from-purple-900/60 hover:to-pink-900/60 text-slate-200 border border-slate-700/80 hover:border-pink-500/50 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors active:opacity-80"
          >
            <Smartphone className="w-4 h-4 text-pink-400" />
            <span className="hidden xs:inline">App View</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 w-full max-w-full overflow-x-hidden space-y-6">
        
        {/* Professional Navigation Header Bar with Dropdown Menu Trigger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative">
          
          {/* Active Section Info & Dropdown Button */}
          <div className="flex items-center justify-between gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CurrentIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Section</span>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  {currentItem.label}
                  {currentItem.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {currentItem.badge}
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Menu Drawer Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:opacity-95 transition-opacity flex items-center gap-2 active:opacity-80 shrink-0"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Admin Menu</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Quick Segmented Desktop/Tablet Pills */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal / Overlay Drawer Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 shadow-2xl space-y-5 my-8 relative">
              {/* Menu Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Admin Navigation Menu</h3>
                    <p className="text-xs text-slate-400">Select a section to configure your application</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categorized Menu Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
                {menuGroups.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                      {group.group}
                    </h4>
                    <div className="space-y-1.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full p-3 rounded-2xl text-left flex items-start gap-3 transition-all border ${
                              isActive
                                ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/60 text-white shadow-lg shadow-purple-900/20'
                                : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${
                              isActive ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Footer */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Close Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content Rendering */}
        {activeTab === 'overview' && (
          <AdminOverview
            config={config}
            orders={orders}
            users={users}
            logs={logs}
            onUpdateConfig={onUpdateConfig}
            onNavigateTab={setActiveTab}
            onSimulateLiveActivity={onSimulateLiveActivity}
          />
        )}

        {activeTab === 'smm_api' && (
          <AdminSmmApi config={config} onUpdateConfig={onUpdateConfig} />
        )}

        {activeTab === 'ads_admob' && (
          <AdminAdsConfig
            config={config}
            onUpdateConfig={onUpdateConfig}
            onTriggerTestAd={onTriggerTestAd}
            onResetDailyAdLimits={onResetDailyAdLimits}
          />
        )}

        {activeTab === 'pricing' && (
          <AdminPricing config={config} onUpdateConfig={onUpdateConfig} />
        )}

        {activeTab === 'orders' && (
          <AdminOrders
            config={config}
            orders={orders}
            onUpdateOrders={onUpdateOrders}
            onRefundUser={onRefundUser}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsers users={users} onUpdateUsers={onUpdateUsers} />
        )}

        {activeTab === 'announcements' && (
          <AdminAnnouncements config={config} onUpdateConfig={onUpdateConfig} />
        )}

        {activeTab === 'settings' && (
          <AdminSettings
            config={config}
            onUpdateConfig={onUpdateConfig}
            onResetDefaults={onResetDefaults}
          />
        )}
      </main>
    </div>
  );
};


