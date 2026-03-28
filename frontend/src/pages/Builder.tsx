import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { FileNode } from '@webcontainer/api';
import { Loader } from '../components/Loader';
import { ExportModal } from '../components/ExportModal';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import {
  Sparkles, ArrowLeft, Download, Send, AlertCircle,
  RefreshCw, ChevronRight, Command, PanelLeftClose, PanelLeft
} from 'lucide-react';

export function Builder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prompt } = location.state as { prompt: string };
  const { toast } = useToast();
  const { token } = useAuth();

  const [userPrompt, setPrompt] = useState('');
  const [llmMessages, setLlmMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateSet, setTemplateSet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const webcontainer = useWebContainer();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [nextStepId, setNextStepId] = useState(1);
  const [files, setFiles] = useState<FileItem[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const projectSavedRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [userPrompt]);

  const assignUniqueIds = (newSteps: Step[], startId: number): Step[] =>
    newSteps.map((step, index) => ({ ...step, id: startId + index }));

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;

    steps.filter(({ status }) => status === 'pending').forEach(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split('/') ?? [];
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;
        let currentFolder = '';

        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            let file = currentFileStructure.find(x => x.path === currentFolder);
            if (!file) {
              currentFileStructure.push({ name: currentFolderName, type: 'file', path: currentFolder, content: step.code });
            } else {
              file.content = step.code;
            }
          } else {
            let folder = currentFileStructure.find(x => x.path === currentFolder);
            if (!folder) {
              currentFileStructure.push({ name: currentFolderName, type: 'folder', path: currentFolder, children: [] });
            }
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps(steps => steps.map(s => ({ ...s, status: 'completed' })));
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(file.children.map(child => [child.name, processFile(child, false)]))
              : {},
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = { file: { contents: file.content || '' } };
          } else {
            return { file: { contents: file.content || '' } };
          }
        }
        return mountStructure[file.name];
      };
      files.forEach(file => processFile(file, true));
      return mountStructure;
    };

    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/template`, { prompt: prompt.trim() });
      setTemplateSet(true);

      const { prompts, uiPrompts } = response.data;
      const firstSteps = parseXml(uiPrompts[0]);
      const stepsWithIds = assignUniqueIds(firstSteps, nextStepId);
      setSteps(stepsWithIds.map((x: Step) => ({ ...x, status: 'pending' })));
      setNextStepId(nextStepId + firstSteps.length);

      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map(content => ({ role: 'user', content })),
      });

      const secondSteps = parseXml(stepsResponse.data.response);
      const secondStepsWithIds = assignUniqueIds(secondSteps, nextStepId + firstSteps.length);
      setSteps(s => [...s, ...secondStepsWithIds.map(x => ({ ...x, status: 'pending' as 'pending' }))]);
      setNextStepId(prev => prev + firstSteps.length + secondSteps.length);

      setLlmMessages([...prompts, prompt].map(content => ({ role: 'user', content })));
      setLlmMessages(x => [...x, { role: 'assistant', content: stepsResponse.data.response }]);

      // Save project once per session
      if (!projectSavedRef.current) {
        projectSavedRef.current = true;
        const title = prompt.length > 60 ? prompt.slice(0, 60) + '…' : prompt;
        try {
          await axios.post(`${BACKEND_URL}/projects`, { title, prompt }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast('Project saved to dashboard', 'success');
        } catch (saveErr) {
          projectSavedRef.current = false; // allow retry on failure
          console.error('Failed to save project:', saveErr);
          toast('Could not save project to dashboard', 'error');
        }
      }
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : String(err);
      setError(`Failed to initialize builder: ${errorMsg}`);
      toast('Failed to initialize builder', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (prompt) init();
  }, [prompt]);

  const handleSendUpdate = async () => {
    if (!userPrompt.trim()) return;
    const newMessage = { role: 'user' as 'user', content: userPrompt };
    setLoading(true);

    try {
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newMessage],
      });

      setLlmMessages(x => [...x, newMessage]);
      setLlmMessages(x => [...x, { role: 'assistant', content: stepsResponse.data.response }]);

      const newSteps = parseXml(stepsResponse.data.response);
      const newStepsWithIds = assignUniqueIds(newSteps, nextStepId);
      setSteps(s => [...s, ...newStepsWithIds.map(x => ({ ...x, status: 'pending' as 'pending' }))]);
      setNextStepId(prev => prev + newSteps.length);
      setPrompt('');
      toast('Update sent!', 'success');
    } catch (err) {
      toast('Failed to send update', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendUpdate();
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="flex-shrink-0 h-12 bg-surface-raised border-b border-surface-border flex items-center justify-between px-4 z-20">
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-200 transition-colors text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-200">lumio</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-gray-700" />

          <span
            className="text-xs text-gray-600 max-w-[200px] truncate font-mono"
            title={prompt}
          >
            {prompt.slice(0, 40)}{prompt.length > 40 ? '...' : ''}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent/60"
                    style={{ animation: 'bounceDot 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span>Generating</span>
            </div>
          )}

          <button
            onClick={() => setExportOpen(true)}
            id="export-btn"
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="flex-shrink-0 flex items-start gap-3 bg-red-500/8 border-b border-red-500/20 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-300 font-medium leading-snug">{error}</p>
            <p className="text-xs text-red-500 mt-0.5">Ensure the backend is running and your API key is configured.</p>
          </div>
          <button
            onClick={init}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-200 transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Steps + Chat — collapsible */}
        <div className={`flex-shrink-0 flex flex-col border-r border-surface-border transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-72'}`}>
          {/* Steps panel */}
          <div className="flex-1 p-3 min-h-0 overflow-hidden">
            <StepsList steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
          </div>

          {/* Prompt input area */}
          <div className="flex-shrink-0 border-t border-surface-border p-3">
            {(loading && !templateSet) ? (
              <Loader message="Initializing..." size="sm" />
            ) : (
              <div className="space-y-2">
                <div className={`relative rounded-xl border transition-all duration-200 bg-[#0a0a0a] ${userPrompt ? 'border-accent/40' : 'border-surface-border focus-within:border-accent/40'
                  }`}>
                  <textarea
                    ref={textareaRef}
                    value={userPrompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a feature or request changes..."
                    disabled={loading}
                    rows={2}
                    className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-700 focus:outline-none resize-none px-3 pt-3 pb-8 min-h-[72px] max-h-[160px]"
                    style={{ overflow: 'hidden' }}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <span className="text-[10px] text-gray-700 flex items-center gap-0.5">
                      <Command className="w-2.5 h-2.5" />↵
                    </span>
                    <button
                      onClick={handleSendUpdate}
                      disabled={!userPrompt.trim() || loading}
                      id="send-update-btn"
                      className="w-6 h-6 rounded-lg bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-90"
                    >
                      {loading
                        ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                        : <Send className="w-3 h-3 text-white" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar toggle button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-5 h-12 bg-surface-raised border border-surface-border flex items-center justify-center text-gray-600 hover:text-gray-200 transition-colors rounded-r-lg"
          style={{ left: sidebarCollapsed ? '0' : '288px', transition: 'left 0.3s' }}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft className="w-3 h-3" /> : <PanelLeftClose className="w-3 h-3" />}
        </button>

        {/* CENTER: File explorer */}
        <div className="w-52 flex-shrink-0 border-r border-surface-border p-3">
          <FileExplorer files={files} onFileSelect={setSelectedFile} />
        </div>

        {/* RIGHT: Code/Preview panel */}
        <div className="flex-1 min-w-0 flex flex-col p-3 gap-0 overflow-hidden">
          <div className="flex-1 surface-card overflow-hidden flex flex-col">
            <div className="px-4 pt-3">
              <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="flex-1 overflow-hidden">
              {activeTab === 'code'
                ? <CodeEditor file={selectedFile} />
                : <PreviewFrame webContainer={webcontainer} files={files} />
              }
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} files={files} />
    </div>
  );
}