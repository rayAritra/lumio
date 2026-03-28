import React, { useState, useEffect } from 'react';
import { X, Download, Copy, ExternalLink, Share2, Check, Loader2 } from 'lucide-react';
import { FileItem } from '../types';
import { useToast } from './Toast';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: FileItem[];
}

function flattenFiles(items: FileItem[], prefix = ''): { path: string; content: string }[] {
    const result: { path: string; content: string }[] = [];
    for (const item of items) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.type === 'file') {
            result.push({ path: fullPath, content: item.content || '' });
        } else if (item.children) {
            result.push(...flattenFiles(item.children, fullPath));
        }
    }
    return result;
}

export function ExportModal({ isOpen, onClose, files }: ExportModalProps) {
    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setDownloaded(false);
            setLinkCopied(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleDownloadZip = async () => {
        setDownloading(true);
        try {
            // Simulate ZIP creation (real impl would use JSZip)
            await new Promise(res => setTimeout(res, 1200));
            const flatFiles = flattenFiles(files);
            const content = flatFiles
                .map(f => `// === ${f.path} ===\n${f.content}`)
                .join('\n\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lumio-project.txt';
            a.click();
            URL.revokeObjectURL(url);
            setDownloaded(true);
            toast('Project downloaded!', 'success');
        } catch {
            toast('Download failed', 'error');
        } finally {
            setDownloading(false);
        }
    };

    const handleCopyAll = async () => {
        const flatFiles = flattenFiles(files);
        const content = flatFiles
            .map(f => `// === ${f.path} ===\n${f.content}`)
            .join('\n\n');
        await navigator.clipboard.writeText(content);
        toast('All files copied to clipboard!', 'success');
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        toast('Link copied!', 'success');
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleOpenStackBlitz = () => {
        window.open('https://stackblitz.com', '_blank');
        toast('Opening StackBlitz...', 'info');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

            {/* Modal */}
            <div className="relative w-full max-w-md surface-card shadow-2xl modal-enter overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-surface-border">
                    <div>
                        <h2 className="text-base font-semibold text-white">Export Project</h2>
                        <p className="text-xs text-gray-600 mt-0.5">
                            {flattenFiles(files).length} files ready
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-gray-600 hover:text-gray-200 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Actions */}
                <div className="p-6 space-y-3">
                    {/* Download ZIP */}
                    <button
                        onClick={handleDownloadZip}
                        disabled={downloading || files.length === 0}
                        className="w-full flex items-center gap-4 p-4 bg-accent/5 hover:bg-accent/10 border border-accent/20 hover:border-accent/40 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            {downloading
                                ? <Loader2 className="w-4 h-4 text-accent-light animate-spin" />
                                : downloaded
                                    ? <Check className="w-4 h-4 text-emerald-400" />
                                    : <Download className="w-4 h-4 text-accent-light" />
                            }
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-100">
                                {downloading ? 'Preparing download...' : downloaded ? 'Downloaded!' : 'Download Files'}
                            </div>
                            <div className="text-xs text-gray-600">Get all project files as a bundle</div>
                        </div>
                    </button>

                    {/* Copy to clipboard */}
                    <button
                        onClick={handleCopyAll}
                        disabled={files.length === 0}
                        className="w-full flex items-center gap-4 p-4 bg-white/2 hover:bg-white/5 border border-surface-border hover:border-gray-600 rounded-xl transition-all duration-200 group disabled:opacity-50"
                    >
                        <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-surface-border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Copy className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-300">Copy All Code</div>
                            <div className="text-xs text-gray-600">All files concatenated to clipboard</div>
                        </div>
                    </button>

                    {/* Share link */}
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-4 p-4 bg-white/2 hover:bg-white/5 border border-surface-border hover:border-gray-600 rounded-xl transition-all duration-200 group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-surface-border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            {linkCopied
                                ? <Check className="w-4 h-4 text-emerald-400" />
                                : <Share2 className="w-4 h-4 text-gray-400" />
                            }
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-300">
                                {linkCopied ? 'Link Copied!' : 'Share Link'}
                            </div>
                            <div className="text-xs text-gray-600">Copy read-only link to clipboard</div>
                        </div>
                    </button>

                    {/* Open in StackBlitz */}
                    <button
                        onClick={handleOpenStackBlitz}
                        className="w-full flex items-center gap-4 p-4 bg-white/2 hover:bg-white/5 border border-surface-border hover:border-gray-600 rounded-xl transition-all duration-200 group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-surface-border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-left flex-1">
                            <div className="text-sm font-medium text-gray-300">Open in StackBlitz</div>
                            <div className="text-xs text-gray-600">Continue editing in the cloud</div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
                    </button>
                </div>

                {/* Progress bar on download */}
                {downloading && (
                    <div className="px-6 pb-6">
                        <div className="h-1 bg-surface-border rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-accent to-cyan-500 rounded-full animate-shimmer" style={{ width: '70%', backgroundSize: '200% 100%' }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
