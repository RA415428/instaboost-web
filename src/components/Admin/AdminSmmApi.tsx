import React, { useState } from 'react';
import { 
  Globe, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  Copy
} from 'lucide-react';
import { AdminConfig, SmmApiSettings } from '../../types';
import { testSmmApiConnection } from '../../utils/smmService';
import { POPULAR_SMM_PROVIDERS } from '../../utils/defaultAdminConfig';

interface AdminSmmApiProps {
  config: AdminConfig;
  onUpdateConfig: (newConfig: AdminConfig) => void;
}

export const AdminSmmApi: React.FC<AdminSmmApiProps> = ({ config, onUpdateConfig }) => {
  const [smmState, setSmmState] = useState<SmmApiSettings>(config.smmApi);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; balance?: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateConfig({
      ...config,
      smmApi: smmState,
      lastUpdated: Date.now()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSmmApiConnection(smmState.apiUrl, smmState.globalApiKey);
    setTesting(false);
    setTestResult(res);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-indigo-900/40 border border-purple-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded uppercase tracking-wide">
              Real-time API Integration
            </span>
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> SMM API Engine
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Instagram SMM Panel API Integration</h2>
          <p className="text-xs text-slate-300">
            Connect any SMM Panel API (Followers, Likes, Reels Views, Comments, Shares) for automatic order fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing API...' : 'Test API Connection'}
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Save SMM Settings
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>SMM API settings saved and updated live in app!</span>
        </div>
      )}

      {/* Test Connection Output Alert */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {testResult.success ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-sm mb-0.5">{testResult.message}</p>
            {testResult.balance && (
              <p className="text-[11px] font-mono text-emerald-400">Panel Account Balance: {testResult.balance}</p>
            )}
          </div>
        </div>
      )}

      {/* Main API Connection Form */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-purple-400" /> SMM API Credentials & Master Switch
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Enable SMM API Integration</p>
              <p className="text-[11px] text-slate-400">Master switch for backend SMM panel connectivity</p>
            </div>
            <button
              onClick={() => setSmmState({ ...smmState, enabled: !smmState.enabled })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                smmState.enabled ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  smmState.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Auto-Forward Orders</p>
              <p className="text-[11px] text-slate-400">Automatically push new user orders straight to SMM panel API</p>
            </div>
            <button
              onClick={() => setSmmState({ ...smmState, autoForward: !smmState.autoForward })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                smmState.autoForward ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  smmState.autoForward ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" /> SMM API Endpoint URL
            </label>
            <input
              type="text"
              value={smmState.apiUrl}
              onChange={(e) => setSmmState({ ...smmState, apiUrl: e.target.value })}
              placeholder="e.g. https://smmpanel.com/api/v2"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Standard SMM v2 API URL. Example: https://smmmain.com/api/v2</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" /> Global API Key
            </label>
            <input
              type="text"
              value={smmState.globalApiKey}
              onChange={(e) => setSmmState({ ...smmState, globalApiKey: e.target.value })}
              placeholder="Enter panel API key..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Your API key generated from the SMM panel account settings.</p>
          </div>
        </div>
      </div>

      {/* Service-Specific IDs Grid */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-4 h-4 text-pink-400" /> Service IDs Mapping (Instagram Services)
        </h3>
        <p className="text-xs text-slate-400">
          Set the exact Service ID from your SMM provider for each Instagram feature (Followers, Likes, Views, Comments, Shares).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Followers */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">👥 Instagram Followers</span>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Service ID</label>
              <input
                type="text"
                value={smmState.services.followers.serviceId}
                onChange={(e) =>
                  setSmmState({
                    ...smmState,
                    services: {
                      ...smmState.services,
                      followers: { ...smmState.services.followers, serviceId: e.target.value }
                    }
                  })
                }
                placeholder="e.g. 101"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Likes */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">❤️ Instagram Likes</span>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Service ID</label>
              <input
                type="text"
                value={smmState.services.likes.serviceId}
                onChange={(e) =>
                  setSmmState({
                    ...smmState,
                    services: {
                      ...smmState.services,
                      likes: { ...smmState.services.likes, serviceId: e.target.value }
                    }
                  })
                }
                placeholder="e.g. 102"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Views */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">👁️ Reels Views</span>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Service ID</label>
              <input
                type="text"
                value={smmState.services.views.serviceId}
                onChange={(e) =>
                  setSmmState({
                    ...smmState,
                    services: {
                      ...smmState.services,
                      views: { ...smmState.services.views, serviceId: e.target.value }
                    }
                  })
                }
                placeholder="e.g. 103"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Comments */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">💬 Custom Comments</span>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Service ID</label>
              <input
                type="text"
                value={smmState.services.comments.serviceId}
                onChange={(e) =>
                  setSmmState({
                    ...smmState,
                    services: {
                      ...smmState.services,
                      comments: { ...smmState.services.comments, serviceId: e.target.value }
                    }
                  })
                }
                placeholder="e.g. 104"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Shares */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">🚀 Reels Shares</span>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Service ID</label>
              <input
                type="text"
                value={smmState.services.shares.serviceId}
                onChange={(e) =>
                  setSmmState({
                    ...smmState,
                    services: {
                      ...smmState.services,
                      shares: { ...smmState.services.shares, serviceId: e.target.value }
                    }
                  })
                }
                placeholder="e.g. 105"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Free & Popular SMM Providers Guide */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" /> Free & Low-Cost SMM Panel Providers List
        </h3>
        <p className="text-xs text-slate-400">
          You can register on any of these popular SMM panels to get your API Key and Service IDs:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {POPULAR_SMM_PROVIDERS.map((provider) => (
            <div
              key={provider.name}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {provider.name}
                  </span>
                  {provider.isFreeOrDemo && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                      Free Trial / Demo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{provider.description}</p>
                <p className="text-[10px] font-mono text-purple-400">{provider.features}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between">
                <code className="text-[10px] text-slate-500">{provider.url}</code>
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-400 font-bold hover:underline flex items-center gap-1"
                >
                  Visit Provider <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
