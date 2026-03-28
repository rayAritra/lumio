import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Zap, Code2 } from 'lucide-react';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => { setIsSignUp((v) => !v); setError(''); };

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute orb-float"
          style={{
            top: '-20%', left: '10%',
            width: '700px', height: '700px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">lumio</span>
        </Link>
        <button
          onClick={switchMode}
          className="text-sm text-gray-500 hover:text-gray-200 transition-colors"
        >
          {isSignUp ? 'Have an account? ' : 'New here? '}
          <span className="text-violet-400 font-medium">{isSignUp ? 'Sign In' : 'Sign Up'}</span>
        </button>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: branding */}
          <div className="hidden lg:flex flex-col gap-10">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs text-violet-400 font-medium tracking-widest uppercase">AI App Builder</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Build apps with AI,<br />
                <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                  not hours of code.
                </span>
              </h2>
              <p className="text-gray-500 text-base leading-relaxed">
                Describe what you want to build. Lumio handles the code, structure, and live preview — instantly.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: Zap, text: 'Generate full apps in seconds', sub: 'No setup required' },
                { icon: Code2, text: 'Clean, exportable source code', sub: 'Production-ready output' },
                { icon: Sparkles, text: 'Save and revisit all your projects', sub: 'Persistent dashboard' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="flex items-center gap-4 p-3.5 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{text}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl p-8 border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
            <div className="mb-8">
              <h1 className="text-xl font-bold text-white mb-1.5">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-sm text-gray-500">
                {isSignUp ? 'Start building with AI in seconds.' : 'Sign in to continue building.'}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-white/[0.08] focus:border-violet-500/40 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full border border-white/[0.08] focus:border-violet-500/40 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full border border-white/[0.08] focus:border-violet-500/40 rounded-xl pl-11 pr-11 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2 shadow-lg shadow-violet-500/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-white/[0.07]">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={switchMode} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center py-5">
        <p className="text-xs text-gray-700">© 2026 lumio · Built with AI, for builders.</p>
      </footer>
    </div>
  );
}
