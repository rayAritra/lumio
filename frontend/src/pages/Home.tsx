import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ArrowRight, Sparkles, Zap, Code2, Eye, Globe, Layers, Terminal, Palette, Star } from 'lucide-react';

const SUGGESTIONS = [
  { icon: Globe, label: 'SaaS landing page' },
  { icon: Layers, label: 'Portfolio site' },
  { icon: Terminal, label: 'Todo app' },
  { icon: Palette, label: 'E-commerce page' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Generation',
    desc: 'From idea to working app in seconds. No waiting, no setup required.',
    color: 'from-amber-500/20 to-orange-500/5',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Code2,
    title: 'Clean Source Code',
    desc: 'Get production-ready, editable code you actually own and can deploy.',
    color: 'from-violet-500/20 to-purple-500/5',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: Eye,
    title: 'Live Preview',
    desc: 'See your app running in real-time as it gets built, step by step.',
    color: 'from-cyan-500/20 to-blue-500/5',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
  },
];

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;
    navigate('/builder', { state: { prompt: value.trim() } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(prompt);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute orb-float"
          style={{
            top: '-10%',
            left: '20%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute orb-float-delayed"
          style={{
            top: '30%',
            right: '-5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-40" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 py-20">

        {/* Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.07] mb-8 entrance-1">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-medium text-violet-300 tracking-wide">AI-Powered App Builder</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-center leading-[1.08] tracking-tight max-w-4xl mb-6 entrance-1">
          <span className="text-white">Build anything</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-violet-500 bg-clip-text text-transparent">
            with AI
          </span>
        </h1>

        <p className="text-gray-400 text-center mb-12 max-w-md text-lg leading-relaxed entrance-2">
          Describe your idea. Lumio generates a full working app with live preview and source code — instantly.
        </p>

        {/* Prompt box */}
        <div className="w-full max-w-2xl entrance-2">
          <div
            className="relative rounded-2xl border border-white/[0.08] transition-all duration-300 input-glow overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
          >
            {/* Top area with textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              rows={3}
              className="w-full bg-transparent text-gray-200 placeholder-gray-600 text-base resize-none focus:outline-none px-5 pt-5 pb-4 leading-relaxed"
            />

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-4 pb-3.5 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-700">
                  <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-600 text-[10px] font-mono">↵</kbd>
                  {' '}to generate
                </span>
              </div>
              <button
                onClick={() => handleSubmit(prompt)}
                disabled={!prompt.trim()}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-violet-500/20"
              >
                Generate
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center entrance-3">
            {SUGGESTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => handleSubmit(label)}
                className="flex items-center gap-1.5 text-xs text-gray-500 border border-white/[0.07] hover:border-violet-500/30 hover:text-gray-300 hover:bg-violet-500/[0.05] px-3.5 py-2 rounded-full transition-all duration-200"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 mt-10 entrance-3">
          <div className="flex -space-x-1.5">
            {['V', 'A', 'M', 'K'].map((letter, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border border-[#060608] flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: `hsl(${260 + i * 20}, 60%, 50%)` }}
              >
                {letter}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-xs text-gray-500">Trusted by developers</span>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-2xl w-full entrance-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, iconColor, iconBg }) => (
            <div
              key={title}
              className="relative rounded-xl p-5 border border-white/[0.07] overflow-hidden group hover:border-white/[0.12] transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.025)' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl ${iconBg} border flex items-center justify-center mb-4`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-100 mb-1.5">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-5">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">lumio</span>
          </div>
          <p className="text-xs text-gray-700">© 2026 lumio · Built with AI, for builders.</p>
        </div>
      </footer>
    </div>
  );
}
