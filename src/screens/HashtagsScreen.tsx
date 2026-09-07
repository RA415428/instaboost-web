import React from 'react';

interface HashtagsScreenProps {
  [key: string]: any;
}

export const HashtagsScreen: React.FC<HashtagsScreenProps> = () => {
  return (
    <div className="p-4 max-w-md mx-auto text-white">
      <h2 className="text-lg font-bold">Hashtags Generator</h2>
      <p className="text-xs text-slate-400 mt-1">Find the best trending hashtags for your posts.</p>
    </div>
  );
};

export default HashtagsScreen;
