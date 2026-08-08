import React, { useState } from 'react';
import { Bell, ShieldCheck, X, Sparkles } from 'lucide-react';
import { requestNotificationPermission, sendDeviceNotification } from '../utils/notifications';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleAllow = async () => {
    setIsRequesting(true);
    const permission = await requestNotificationPermission();
    setIsRequesting(false);

    if (permission === 'granted') {
      sendDeviceNotification('🔔 Notifications Active!', {
        body: 'You will now receive order updates and admin announcements directly on your device.'
      });
    }
    onClose();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 select-none animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-lg">
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/15 rounded-full blur-xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
            <Bell className="w-5 h-5 animate-bounce text-amber-300" />
          </div>

          <div className="pr-4 space-y-1">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Enable Device Notifications</span>
              <span className="text-[9px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-1.5 py-0.5 rounded font-extrabold uppercase">
                Permission
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-snug font-medium">
              Get real-time alerts for your Instagram orders, bonus coins, and admin notifications directly on your phone.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Spam free • Turn off anytime</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleAllow}
              disabled={isRequesting}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1 transition-opacity active:opacity-80"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {isRequesting ? 'Allowing...' : 'Allow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
