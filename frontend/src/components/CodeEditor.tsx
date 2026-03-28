import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileItem } from '../types';
import { Copy, Check, Download, FileCode } from 'lucide-react';
import { useToast } from './Toast';

interface CodeEditorProps {
  file: FileItem | null;
}

const getLanguage = (filename: string): string => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx': return 'typescript';
    case 'js':
    case 'jsx': return 'javascript';
    case 'css':
    case 'scss': return 'css';
    case 'html': return 'html';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'sh': return 'shell';
    default: return 'typescript';
  }
};

const getLangBadgeColor = (lang: string): string => {
  switch (lang) {
    case 'typescript': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'javascript': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'css': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    case 'html': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'json': return 'text-green-400 bg-green-400/10 border-green-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

export function CodeEditor({ file }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const language = file ? getLanguage(file.name) : 'typescript';
  const lineCount = file?.content?.split('\n').length ?? 0;

  const handleCopy = async () => {
    if (!file?.content) return;
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      toast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy', 'error');
    }
  };

  const handleDownload = () => {
    if (!file?.content || !file?.name) return;
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${file.name}`, 'success');
  };

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-12 h-12 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center mb-4">
          <FileCode className="w-5 h-5 text-gray-600" />
        </div>
        <p className="text-sm font-medium text-gray-500">No file selected</p>
        <p className="text-xs text-gray-700 mt-1">Click a file in the explorer to view its contents</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* File header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border flex-shrink-0 bg-[#0a0a0a]">
        <div className="flex items-center gap-2.5">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-gray-400 font-mono">{file.name}</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getLangBadgeColor(language)}`}>
            {language}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-700 font-mono mr-2">{lineCount} lines</span>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-200 text-xs px-2 py-1 rounded hover:bg-white/5 transition-all duration-150"
            title="Download file"
          >
            <Download className="w-3 h-3" />
          </button>

          <button
            onClick={handleCopy}
            id="copy-code-btn"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-200 text-xs px-2 py-1 rounded hover:bg-white/5 transition-all duration-150"
            title="Copy code"
          >
            {copied
              ? <Check className="w-3 h-3 text-emerald-400" />
              : <Copy className="w-3 h-3" />
            }
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={file.content || ''}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12.5,
            lineHeight: 20,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
            },
          }}
        />
      </div>
    </div>
  );
}