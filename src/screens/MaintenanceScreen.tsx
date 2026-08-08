import React from 'react';
import { ShieldAlert, RefreshCw, MessageSquare } from 'lucide-react';

interface MaintenanceScreenProps {
  onAdminLoginClick: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onAdminLoginClick }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-amber-400 animate-pulse" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">App Under Maintenance</h1>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          InstaBoost Rewards is currently undergoing scheduled server upgrades & SMM speed optimization. We will be back online shortly!
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Page
          </button>

          <button
            onClick={onAdminLoginClick}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            🛡️ Admin Login Access
          </button>
        </div>
      </div>
    </div>
  );
};
