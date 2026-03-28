import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';
import { Globe, AlertTriangle, Terminal } from 'lucide-react';

interface PreviewFrameProps {
  files: any[];
  webContainer?: WebContainer;
}

const STATUS_STEPS = [
  'Initializing WebContainer...',
  'Installing dependencies...',
  'Starting dev server...',
  'Almost ready...',
];

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Initializing...');
  const [statusStep, setStatusStep] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function main() {
      try {
        if (!webContainer) {
          if (isMounted) setStatus('Waiting for WebContainer...');
          return;
        }

        if (!files || files.length === 0) {
          if (isMounted) setStatus('Waiting for files...');
          return;
        }

        if (isMounted) { setStatus('Installing dependencies...'); setStatusStep(1); }

        const installProcess = await webContainer.spawn('npm', ['install']);
        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) throw new Error(`npm install failed with exit code ${installExitCode}`);
        if (!isMounted) return;

        if (isMounted) { setStatus('Starting dev server...'); setStatusStep(2); }

        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);

        webContainer.on('server-ready', (port, serverUrl) => {
          if (isMounted) {
            setUrl(serverUrl);
            setStatus('Ready');
            setStatusStep(3);
          }
        });

        devProcess.output.pipeTo(new WritableStream({
          write(data) { console.log('[dev server]:', data); }
        }));
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
          setStatus('Error');
        }
      }
    }

    main();
    return () => { isMounted = false; };
  }, [webContainer, files]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-red-300 mb-2">Preview Error</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-mono">{error}</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <div className="relative mx-auto w-14 h-14 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center">
              <Globe className="w-6 h-6 text-gray-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-400 mb-1">{status}</h3>
          <p className="text-xs text-gray-700">Your preview will appear here</p>
        </div>

        {/* Status steps */}
        <div className="w-full max-w-xs space-y-2">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-500 ${i < statusStep ? 'bg-emerald-500' :
                  i === statusStep ? 'bg-accent animate-pulse' :
                    'bg-surface-border'
                }`} />
              <span className={`text-xs transition-colors duration-500 ${i < statusStep ? 'text-gray-600 line-through' :
                  i === statusStep ? 'text-gray-400' :
                    'text-gray-800'
                }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Shimmer bars */}
        <div className="w-full max-w-xs space-y-3 mt-8">
          <div className="h-32 skeleton rounded-xl" />
          <div className="flex gap-2">
            <div className="h-8 skeleton rounded-lg flex-1" />
            <div className="h-8 skeleton rounded-lg w-24" />
          </div>
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-4 skeleton rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Browser chrome bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0a0a] border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 flex items-center gap-2 bg-surface-raised border border-surface-border rounded-md px-3 py-1">
          <Globe className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span className="text-xs text-gray-500 font-mono truncate">{url}</span>
        </div>
      </div>

      <iframe
        width="100%"
        height="100%"
        src={url}
        className="border-0 w-full flex-1 bg-white"
        title="Preview"
      />
    </div>
  );
}