import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../config';
import { Navbar } from '../components/Navbar';
import {
  Plus, Clock, Code2, Trash2, FolderOpen,
  ArrowRight, Search, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  title: string;
  prompt: string;
  created_at: string;
  updated_at: string;
}

export function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    if (!token) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      } else {
        const data = await res.json().catch(() => ({}));
        setFetchError(data.message || `Error ${res.status}`);
      }
    } catch {
      setFetchError('Could not reach the backend. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    setDeletingId(id);
    try {
      await fetch(`${BACKEND_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects((p) => p.filter((x) => x.id !== id));
    } catch {
      console.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            top: '-15%', left: '50%', transform: 'translateX(-50%)',
            width: '800px', height: '400px',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>

      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-10 relative z-10">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 entrance-1">
          <div>
            <p className="text-xs font-medium text-violet-400 mb-2 tracking-widest uppercase">Your workspace</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {user?.name?.split(' ')[0]}'s Projects
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              {loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''} built with AI`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProjects}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 px-3 py-2.5 rounded-lg border border-white/[0.07] hover:bg-white/[0.04] transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-95 shadow-lg shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Stats strip */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8 entrance-2">
            {[
              { label: 'Total Projects', value: projects.length.toString() },
              { label: 'Last Activity', value: formatDistanceToNow(new Date(projects[0].updated_at), { addSuffix: true }) },
              {
                label: 'Member Since',
                value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : '—',
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl px-4 py-3.5 border border-white/[0.07]"
                style={{ background: 'rgba(255,255,255,0.025)' }}
              >
                <p className="text-xs text-gray-600 mb-1.5">{label}</p>
                <p className="text-sm font-semibold text-gray-100 truncate">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {fetchError && (
          <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3 mb-6 entrance-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300 flex-1">{fetchError}</p>
            <button onClick={fetchProjects} className="text-xs text-red-400 hover:text-red-200 flex-shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* Search */}
        {projects.length > 2 && (
          <div className="relative mb-6 entrance-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full border border-white/[0.07] focus:border-violet-500/30 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            />
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 skeleton" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 entrance-2">
            <div className="w-16 h-16 rounded-2xl border border-white/[0.07] flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <FolderOpen className="w-7 h-7 text-gray-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-200 mb-2">No projects yet</h2>
            <p className="text-sm text-gray-600 mb-7 text-center max-w-sm leading-relaxed">
              Build your first project. Describe what you want and lumio will generate it instantly.
            </p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </button>
          </div>
        )}

        {/* Projects grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 entrance-3">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-xl p-5 border border-white/[0.07] hover:border-violet-500/25 transition-all duration-300 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.025)' }}
                onClick={() => navigate('/builder', { state: { prompt: project.prompt } })}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                      disabled={deletingId === project.id}
                      className="p-1.5 rounded-lg text-transparent group-hover:text-gray-600 hover:!text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-gray-100 mb-1.5 line-clamp-1">
                    {project.title}
                  </h3>

                  {/* Prompt */}
                  <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {project.prompt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-700 group-hover:text-violet-400 transition-colors">
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No search results */}
        {!loading && projects.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 entrance-2">
            <Search className="w-7 h-7 text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">No results for "<span className="text-gray-300">{search}</span>"</p>
            <button onClick={() => setSearch('')} className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors">
              Clear search
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-5 relative z-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">lumio</span>
          </div>
          <span className="text-xs text-gray-700">© 2026 lumio · Built with AI, for builders.</span>
        </div>
      </footer>
    </div>
  );
}
