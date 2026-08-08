import React from 'react';
import { ShoppingBag, Hash, Coins, Clock, Settings } from 'lucide-react';
import { MainTab } from '../types';

interface BottomNavBarProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  pendingOrdersCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  pendingOrdersCount = 0
}) => {
  const tabs = [
    { id: 'HOME' as MainTab, label: 'Order', icon: ShoppingBag },
    { id: 'TAGS' as MainTab, label: 'Hashtags', icon: Hash },
    { id: 'COINS' as MainTab, label: 'Store', icon: Coins },
    { id: 'ORDERS' as MainTab, label: 'History', icon: Clock, badge: pendingOrdersCount },
    { id: 'SETTINGS' as MainTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 max-w-md mx-auto w-full overflow-hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id.toLowerCase()}`}
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
                onSelectTab(tab.id);
                window.scrollTo(0, 0);
              }}
              className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-colors duration-150 select-none touch-manipulation ${
                isActive
                  ? 'text-pink-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {!!tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-slate-900 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>

              {isActive && (
                <div className="absolute -bottom-1 w-5 h-0.5 bg-gradient-to-r from-pink-500 to-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
