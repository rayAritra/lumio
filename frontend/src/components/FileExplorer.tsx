import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, FileText, FileJson, FileImage, File } from 'lucide-react';
import { FileItem } from '../types';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
  activeFile?: FileItem | null;
}

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconClass = "w-3.5 h-3.5 flex-shrink-0";

  switch (ext) {
    case 'tsx':
    case 'ts':
      return <FileCode className={`${iconClass} text-blue-400`} />;
    case 'jsx':
    case 'js':
      return <FileCode className={`${iconClass} text-yellow-400`} />;
    case 'json':
      return <FileJson className={`${iconClass} text-orange-400`} />;
    case 'css':
    case 'scss':
      return <FileText className={`${iconClass} text-pink-400`} />;
    case 'html':
      return <FileCode className={`${iconClass} text-orange-300`} />;
    case 'md':
      return <FileText className={`${iconClass} text-gray-400`} />;
    case 'png':
    case 'jpg':
    case 'svg':
    case 'webp':
      return <FileImage className={`${iconClass} text-green-400`} />;
    default:
      return <File className={`${iconClass} text-gray-500`} />;
  }
};

function FileNode({ item, depth, onFileClick, activeFile }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const isActive = activeFile?.path === item.path;

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 py-1 pr-2 rounded-md cursor-pointer transition-all duration-150 select-none ${isActive
            ? 'bg-accent/10 text-accent-light'
            : 'text-gray-500 hover:text-gray-200 hover:bg-white/4'
          }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={handleClick}
      >
        {item.type === 'folder' ? (
          <>
            <span className={`flex-shrink-0 transition-transform duration-150 ${isExpanded ? '' : '-rotate-0'}`}>
              {isExpanded
                ? <ChevronDown className="w-3 h-3 text-gray-600" />
                : <ChevronRight className="w-3 h-3 text-gray-600" />
              }
            </span>
            {isExpanded
              ? <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 text-accent-light/70" />
              : <Folder className="w-3.5 h-3.5 flex-shrink-0 text-gray-500 group-hover:text-gray-400" />
            }
          </>
        ) : (
          <>
            <span className="w-3 h-3 flex-shrink-0" />
            {getFileIcon(item.name)}
          </>
        )}
        <span className={`text-xs truncate font-mono leading-none ${isActive ? 'text-accent-light' : ''}`}>
          {item.name}
        </span>
      </div>

      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map((child, idx) => (
            <FileNode
              key={`${child.path}-${idx}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              activeFile={activeFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);

  const handleSelect = (file: FileItem) => {
    setActiveFile(file);
    onFileSelect(file);
  };

  return (
    <div className="h-full flex flex-col bg-surface-raised border border-surface-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 text-gray-600" />
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Explorer</h2>
          <span className="ml-auto text-xs text-gray-700 font-mono">
            {files.length} {files.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hidden">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <Folder className="w-6 h-6 text-gray-700 mb-2" />
            <p className="text-xs text-gray-700">Files will appear here as they are generated</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {files.map((file, idx) => (
              <FileNode
                key={`${file.path}-${idx}`}
                item={file}
                depth={0}
                onFileClick={handleSelect}
                activeFile={activeFile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}