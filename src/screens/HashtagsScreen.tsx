import React, { useState } from 'react';
import { 
  Hash, Copy, Check, Search, ChevronRight, Sparkles,
  Video, Rocket, Shirt, Dumbbell, Utensils, Brush, Target, Zap, Camera, Plane
} from 'lucide-react';
import { hashtagCategories } from '../data/appData';
import { AdBanner } from '../components/AdBanner';
import { SocialBarAd } from '../components/SocialBarAd';
import { AdminConfig, UserWallet } from '../types';

interface HashtagsScreenProps {
  wallet?: UserWallet;
  adminConfig?: AdminConfig;
  onOpenAdModal?: () => void;
  onShowToast: (msg: string) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'video': return <Video className="w-3.5 h-3.5" />;
    case 'rocket': return <Rocket className="w-3.5 h-3.5" />;
    case 'shirt': return <Shirt className="w-3.5 h-3.5" />;
    case 'dumbbell': return <Dumbbell className="w-3.5 h-3.5" />;
    case 'utensils': return <Utensils className="w-3.5 h-3.5" />;
    case 'brush': return <Brush className="w-3.5 h-3.5" />;
    case 'target': return <Target className="w-3.5 h-3.5" />;
    case 'zap': return <Zap className="w-3.5 h-3.5" />;
    case 'camera': return <Camera className="w-3.5 h-3.5" />;
    case 'plane': return <Plane className="w-3.5 h-3.5" />;
    default: return <Sparkles className="w-3.5 h-3.5" />;
  }
};

export const HashtagsScreen: React.FC<HashtagsScreenProps> = ({
  wallet,
  adminConfig,
  onOpenAdModal,
  onShowToast
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('reels_viral');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const activeCategory = hashtagCategories.find((c) => c.id === selectedCategoryId) || hashtagCategories[0];

  const filteredCategories = hashtagCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.hashtags.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopyAll = (hashtags: string[], name: string) => {
    const text = hashtags.join(' ');
    navigator.clipboard.writeText(text);
    onShowToast(`All ${hashtags.length} hashtags for ${name} copied!`);
  };

  const handleCopySingle = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    onShowToast(`Copied ${tag}`);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-4 max-w-md mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <Hash className="w-4 h-4 text-amber-300" />
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-200">
            Viral Tag Generator
          </span>
        </div>
        <h2 className="text-lg font-black">Trending Instagram Hashtags</h2>
        <p className="text-xs text-slate-300 mt-1">
          Boost organic reach on Reels & Posts with high-conversion tag sets.
        </p>
      </div>

      {/* Social Bar Ad - Right below Trending Instagram Hashtags */}
      <SocialBarAd
        customText="Trending Hashtags Boost & Free Rewards!"
        wallet={wallet}
        adminConfig={adminConfig}
        onOpenAdModal={onOpenAdModal}
      />

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories or tags (e.g. reels, fitness...)"
          className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 text-slate-100 text-xs rounded-xl pl-10 pr-3.5 py-3 focus:outline-none transition-colors"
        />
      </div>

      {/* Category Horizontal Pill list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filteredCategories.map((cat) => {
          const isActive = cat.id === selectedCategoryId;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Sponsored Ad placed right below categories and above tags */}
      <div className="bg-slate-900/90 border border-purple-500/20 rounded-xl p-2 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex items-center justify-between w-full px-1 mb-1">
          <span className="text-[8px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-2 h-2 text-amber-400" /> Sponsored
          </span>
          <span className="text-[8px] font-bold text-slate-500">Adsterra</span>
        </div>
        <div className="w-full flex items-center justify-center overflow-hidden py-0.5 max-h-[80px]">
          <AdBanner
            adKey="19b8c46ab4ac83259b97c3f5a34e588c"
            scriptSrc="https://doubtfulimpatient.com/19b8c46ab4ac83259b97c3f5a34e588c/invoke.js"
            width={160}
            height={300}
            className="my-0"
          />
        </div>
      </div>

      {/* Selected Category Tags Panel */}
      {activeCategory && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{activeCategory.name}</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold px-2 py-0.5 rounded-full">
                  {activeCategory.hashtags.length} Tags
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">High engagement frequency set</p>
            </div>

            <button
              onClick={() => handleCopyAll(activeCategory.hashtags, activeCategory.name)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-colors active:opacity-80"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy All
            </button>
          </div>

          {/* Tags Grid */}
          <div className="flex flex-wrap gap-2 pt-1">
            {activeCategory.hashtags.map((tag) => {
              const isJustCopied = copiedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleCopySingle(tag)}
                  className={`text-xs font-mono font-medium px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 active:opacity-80 ${
                    isJustCopied
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-purple-500/60 hover:text-purple-300'
                  }`}
                >
                  <span>{tag}</span>
                  {isJustCopied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-40 hover:opacity-100" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
