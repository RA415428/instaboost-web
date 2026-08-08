import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Coins, 
  CheckCircle2, 
  Plus, 
  Minus, 
  ShieldAlert, 
  UserCheck, 
  UserX,
  Radio,
  Smartphone,
  MapPin,
  Clock
} from 'lucide-react';
import { UserAccount } from '../../types';

interface AdminUsersProps {
  users: UserAccount[];
  onUpdateUsers: (updatedUsers: UserAccount[]) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, onUpdateUsers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAdjustCoins = (userId: string, delta: number) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const newCoins = Math.max(0, u.coins + delta);
        return { ...u, coins: newCoins };
      }
      return u;
    });
    onUpdateUsers(updated);
    showToast(`Updated user coin balance by ${delta > 0 ? '+' : ''}${delta} coins.`);
  };

  const handleSetExactCoins = (userId: string, exactCoins: number) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, coins: Math.max(0, exactCoins) };
      }
      return u;
    });
    onUpdateUsers(updated);
    showToast(`Set user coin balance to ${exactCoins} coins.`);
  };

  const handleToggleBlock = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const newStatus = u.status === 'ACTIVE' ? ('BLOCKED' as const) : ('ACTIVE' as const);
        return { ...u, status: newStatus };
      }
      return u;
    });
    onUpdateUsers(updated);
    showToast('User account status updated.');
  };

  const handleRemoveFakeUsers = () => {
    const realUsersOnly = users.filter(
      (u) =>
        u.id === 'usr_current' ||
        (!u.id.startsWith('usr_mock') &&
          !u.id.startsWith('usr_demo') &&
          u.name !== 'Rohan Sharma' &&
          u.name !== 'Priya Patel' &&
          u.name !== 'Vikram Singh' &&
          u.name !== 'Ananya Roy' &&
          u.name !== 'Rahul Verma')
    );
    onUpdateUsers(realUsersOnly);
    showToast('Removed all fake users list.');
  };

  const onlineUsersCount = users.filter((u) => u.isOnline === true).length;
  const offlineUsersCount = users.length - onlineUsersCount;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.memberId.toLowerCase().includes(searchQuery.toLowerCase());

    const isUserOnline = u.isOnline === true;
    if (statusFilter === 'ONLINE') return matchesSearch && isUserOnline;
    if (statusFilter === 'OFFLINE') return matchesSearch && !isUserOnline;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Search */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> App Users Database & Activity
            </h2>
            <p className="text-xs text-slate-400">
              Live active online users & offline registered app downloads tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setStatusFilter('ONLINE')}
              className={`px-3 py-1 border rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                statusFilter === 'ONLINE'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {onlineUsersCount} Online
            </button>
            <button
              onClick={() => setStatusFilter('OFFLINE')}
              className={`px-3 py-1 border rounded-lg text-xs font-bold transition-colors ${
                statusFilter === 'OFFLINE'
                  ? 'bg-slate-700 text-white border-slate-600 shadow'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
            >
              ⚪ {offlineUsersCount} Offline
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Member ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((u) => {
          const isUserOnline = u.isOnline === true;
          return (
            <div
              key={u.id}
              className={`p-4 rounded-2xl border transition-all ${
                u.status === 'BLOCKED'
                  ? 'bg-red-950/20 border-red-500/30'
                  : isUserOnline
                  ? 'bg-slate-900/90 border-emerald-500/30'
                  : 'bg-slate-900/90 border-slate-800/80 opacity-95'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {isUserOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          isUserOnline ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      />
                    </span>
                    <h3 className="font-bold text-white text-sm">{u.name}</h3>
                    <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      #{u.memberId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Joined: {u.joinedDate}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{u.location || 'India'}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {u.status}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isUserOnline
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isUserOnline ? '🟢 ONLINE NOW' : `⚪ ${u.lastActive || 'Offline'}`}
                  </span>
                </div>
              </div>

              {/* Real-time details */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-3 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Coin Balance</span>
                    <p className="font-bold text-amber-400 text-sm">{u.coins} Coins</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Orders Placed</span>
                    <p className="font-bold text-white text-sm">{u.ordersCount} Orders</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    {u.deviceType || 'Android Device'}
                  </span>
                  <span className="text-slate-300">Screen: <strong>{u.currentScreen || 'Main App'}</strong></span>
                </div>
              </div>

              {/* Quick Balance Controls */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAdjustCoins(u.id, 100)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> 100
                    </button>
                    <button
                      onClick={() => handleAdjustCoins(u.id, 500)}
                      className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> 500
                    </button>
                    <button
                      onClick={() => handleAdjustCoins(u.id, -100)}
                      className="px-2 py-1 bg-slate-800 hover:bg-red-900/60 text-slate-300 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-0.5"
                    >
                      <Minus className="w-3 h-3" /> 100
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleBlock(u.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                      u.status === 'ACTIVE'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? (
                      <>
                        <UserX className="w-3.5 h-3.5" /> Block User
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> Unblock User
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Set Exact Coins:</span>
                  <input
                    type="number"
                    defaultValue={u.coins}
                    key={u.coins}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt((e.target as HTMLInputElement).value, 10);
                        if (!isNaN(val)) handleSetExactCoins(u.id, val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val !== u.coins) handleSetExactCoins(u.id, val);
                    }}
                    className="w-24 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-amber-300 font-bold text-xs text-center focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[9px] text-slate-500">(Press Enter or click away)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

