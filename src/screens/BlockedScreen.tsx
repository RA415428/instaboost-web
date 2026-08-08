import React from 'react';
import { UserX, ShieldAlert, RefreshCw, MessageSquare } from 'lucide-react';

interface BlockedScreenProps {
  memberId: string;
  onContactSupportClick: () => void;
  onAdminLoginClick: () => void;
}

export const BlockedScreen: React.FC<BlockedScreenProps> = ({
  memberId,
  onContactSupportClick,
  onAdminLoginClick
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-red-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient red glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <UserX className="w-10 h-10 text-red-500 animate-pulse" />
        </div>

        <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3">
          Account Suspended
        </span>

        <h1 className="text-xl font-black text-white mb-2">
          Account Blocked By Admin
        </h1>

        <p className="text-xs text-red-300 font-semibold mb-3">
          आपका अकाउंट एडमिन द्वारा ब्लॉक कर दिया गया है।
        </p>

        <div className="text-xs text-slate-300 leading-relaxed mb-6 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left space-y-2">
          <p className="font-medium text-slate-300">
            You have been blocked by the Administrator. Access to application features has been restricted. Please try again later or contact support.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Member ID:</span>
            <span className="font-mono text-amber-400 font-bold">#{memberId}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Status:</span>
            <span className="text-red-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> BLOCKED
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onContactSupportClick}
            className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4" /> Contact Support Team
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Status
          </button>

          <button
            onClick={onAdminLoginClick}
            className="w-full py-2 text-slate-500 hover:text-slate-300 font-semibold text-[11px] transition-colors"
          >
            🛡️ Admin Login Access
          </button>
        </div>
      </div>
    </div>
  );
};
