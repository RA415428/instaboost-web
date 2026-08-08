import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw, 
  Send, 
  FileText, 
  ExternalLink,
  Copy
} from 'lucide-react';
import { AdminConfig, Order, OrderStatus } from '../../types';
import { submitOrderToSmmApi } from '../../utils/smmService';

interface AdminOrdersProps {
  config: AdminConfig;
  orders: Order[];
  onUpdateOrders: (updatedOrders: Order[]) => void;
  onRefundUser: (coins: number) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  config,
  orders,
  onUpdateOrders,
  onRefundUser
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<Order | null>(null);
  const [forwardingId, setForwardingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    onUpdateOrders(updated);
    showToast(`Order ${orderId} status updated to ${newStatus}`);
  };

  const handleRefund = (order: Order) => {
    if (order.status === 'CANCELLED') {
      showToast('Order is already cancelled & refunded.');
      return;
    }
    onRefundUser(order.coinsSpent);
    const updated = orders.map((o) => (o.id === order.id ? { ...o, status: 'CANCELLED' as OrderStatus } : o));
    onUpdateOrders(updated);
    showToast(`Refunded ${order.coinsSpent} coins to user and cancelled order ${order.id}`);
  };

  const handleForwardToSmm = async (order: Order) => {
    setForwardingId(order.id);
    const res = await submitOrderToSmmApi(order, config.smmApi);
    setForwardingId(null);

    if (res.success) {
      const updated = orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: 'IN_PROGRESS' as OrderStatus,
              smmOrderId: res.orderId,
              smmResponse: res.rawResponse
            }
          : o
      );
      onUpdateOrders(updated);
      showToast(`Order ${order.id} sent to SMM Panel! ID: ${res.orderId}`);
    } else {
      showToast(`SMM API Error: ${res.error}`);
    }
  };

  const handleClearFakeOrders = () => {
    const realOnly = orders.filter((o) => !o.id.startsWith('ord_fake_') && !o.targetUrl.includes('example.com'));
    onUpdateOrders(realOnly);
    showToast('Removed all fake/test orders.');
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = filterStatus === 'ALL' || ord.status === filterStatus;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.targetUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" /> Real-time Orders Management
            </h2>
            <p className="text-xs text-slate-400">
              Manage all submitted user orders, update fulfillment status, refund coins, or forward to SMM Panel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">
              Total: {orders.length}
            </span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold">
              Pending: {orders.filter((o) => o.status === 'PROCESSING' || o.status === 'IN_PROGRESS').length}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Order ID, Instagram link, or Service type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PROCESSING">Processing</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No orders match the current search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Service</th>
                  <th className="p-3.5">Target Link</th>
                  <th className="p-3.5">Qty</th>
                  <th className="p-3.5">Coins</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((ord, idx) => (
                  <tr key={`${ord.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-400">
                      {ord.id}
                      {ord.smmOrderId && (
                        <div className="text-[10px] text-purple-400 font-normal">SMM: {ord.smmOrderId}</div>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-white">{ord.serviceType}</td>
                    <td className="p-3.5">
                      <a
                        href={ord.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:underline flex items-center gap-1 max-w-[200px] truncate"
                      >
                        {ord.targetUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <span className="text-[10px] text-slate-500">{ord.dateFormatted}</span>
                    </td>
                    <td className="p-3.5 font-bold text-white">{ord.quantity}</td>
                    <td className="p-3.5 font-bold text-amber-400">{ord.coinsSpent}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : ord.status === 'IN_PROGRESS'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : ord.status === 'CANCELLED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ord.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded transition-colors"
                            title="Mark Completed"
                          >
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => handleForwardToSmm(ord)}
                          disabled={forwardingId === ord.id}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                          title="Forward to SMM API"
                        >
                          <Send className="w-3 h-3" />
                          {forwardingId === ord.id ? 'Sending...' : 'SMM API'}
                        </button>

                        {ord.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleRefund(ord)}
                            className="px-2 py-1 bg-slate-800 hover:bg-red-900/50 text-red-300 font-bold text-[10px] rounded transition-colors flex items-center gap-1"
                            title="Refund coins & cancel"
                          >
                            <RotateCcw className="w-3 h-3" /> Refund
                          </button>
                        )}

                        {ord.smmResponse && (
                          <button
                            onClick={() => setSelectedLog(ord)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded transition-colors"
                            title="View Raw SMM API Log"
                          >
                            Log
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SMM API Response Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> SMM API Raw Log - {selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-60">
              {selectedLog.smmResponse}
            </pre>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
