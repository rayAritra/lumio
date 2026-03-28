import React from 'react';
import { Code2, Eye, FileText } from 'lucide-react';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex items-center justify-between mb-3 flex-shrink-0">
      <div className="flex items-center gap-1 bg-[#0a0a0a] border border-surface-border rounded-lg p-1">
        <button
          id="tab-code"
          onClick={() => onTabChange('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${activeTab === 'code'
              ? 'bg-surface-raised text-gray-100 shadow-sm'
              : 'text-gray-600 hover:text-gray-400'
            }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code
        </button>
        <button
          id="tab-preview"
          onClick={() => onTabChange('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${activeTab === 'preview'
              ? 'bg-surface-raised text-gray-100 shadow-sm'
              : 'text-gray-600 hover:text-gray-400'
            }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-gray-700 font-mono">
        <div className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" />
        <span>Live</span>
      </div>
    </div>
  );
}