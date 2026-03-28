import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LayoutDashboard, Plus, LogOut, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.05]" style={{ background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">lumio</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden sm:flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.07] rounded-lg p-0.5">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive('/') ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-200'
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive('/dashboard') ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </nav>

        {/* Right: user dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white uppercase flex-shrink-0 shadow-md shadow-violet-500/30">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden sm:block text-sm text-gray-300 max-w-[110px] truncate font-medium">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50 border border-white/[0.08]" style={{ background: '#111113' }}>
              <div className="px-4 py-3 border-b border-white/[0.07]">
                <p className="text-sm font-semibold text-gray-100 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="p-1.5">
                <Link
                  to="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              </div>

              <div className="p-1.5 border-t border-white/[0.07]">
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
