import React, { useState } from 'react';
import { Clock, CheckCircle2, Loader2, ExternalLink, Search, RefreshCw, ShoppingBag } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { ServiceIcon } from '../components/ServiceIcon';
import { formatCoins } from '../utils/format';

interface OrdersScreenProps {
  orders: Order[];
  onShowToast: (msg: string) => void;
  onGoToOrderForm: () => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ orders, onShowToast, onGoToOrderForm }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = filterStatus === 'ALL' || ord.status === filterStatus;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.targetUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
            <Clock className="w-3 h-3" /> PROCESSING
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-4 max-w-md mx-auto">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-pink-400" />
            Order History & Tracking
          </h2>
          <p className="text-xs text-slate-400">Track real-time status of your Instagram boosts</p>
        </div>
        <button
          onClick={() => onShowToast('Synced with live Instagram servers')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh Statuses"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID or service..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 text-slate-100 text-xs rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'IN_PROGRESS', 'COMPLETED', 'PROCESSING'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 font-mono ${
                filterStatus === st
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">No orders found in this filter.</p>
          <button
            onClick={onGoToOrderForm}
            className="bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            Create New Order
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord, idx) => (
            <div
              key={`${ord.id}-${idx}`}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-lg relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-mono text-xs font-extrabold text-amber-400">{ord.id}</span>
                {getStatusBadge(ord.status)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ServiceIcon serviceType={ord.serviceType} serviceId={ord.serviceId} size="sm" />
                  <p className="text-sm font-bold text-white">{ord.serviceType}</p>
                </div>
                <a
                  href={ord.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-pink-400 flex items-center gap-1 truncate max-w-[280px] pl-7"
                >
                  <span className="truncate">{ord.targetUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/60">
                <span>Qty: <strong className="text-white font-sans">{ord.quantity.toLocaleString()}</strong></span>
                <span>Coins: <strong className="text-amber-300 font-sans">{formatCoins(ord.coinsSpent)}</strong></span>
                <span>{ord.dateFormatted}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
