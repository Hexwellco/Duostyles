import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Users, Image as ImageIcon, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import AnimatedBackground from './AnimatedBackground';

interface Generation {
  id: string;
  user_id: string;
  style_name: string;
  image_url: string;
  status: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
  created_at: string;
}

interface AdminProps {
  onNavigate: (path: string) => void;
}

export default function Admin({ onNavigate }: AdminProps) {
  const { profile, signOut, loading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!profile || !profile.is_admin)) {
      onNavigate('/');
      return;
    }
    if (profile?.is_admin) {
      (async () => {
        const [{ data: p }, { data: g }] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('generations').select('*').order('created_at', { ascending: false }),
        ]);
        setProfiles((p as Profile[]) ?? []);
        setGenerations((g as Generation[]) ?? []);
        setDataLoading(false);
      })();
    }
  }, [profile, loading]);

  if (loading || (profile && !profile.is_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f2fd' }}>
        <div className="text-[#9080b0] font-body text-sm">Loading...</div>
      </div>
    );
  }

  if (!profile?.is_admin) return null;

  const userEmailMap = new Map(profiles.map((p) => [p.id, p.email]));
  const userNameMap = new Map(profiles.map((p) => [p.id, p.name]));

  return (
    <div className="min-h-screen relative" style={{ background: '#f7f2fd' }}>
      <AnimatedBackground />
      <div className="relative z-10">
        <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-sm font-semibold text-[#9080b0] hover:text-[#3a2f52] transition-colors font-body"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm font-semibold text-[#9080b0] hover:text-[#3a2f52] transition-colors font-body"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </header>

        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-7 h-7 text-[#c4a8e8]" />
            <h1 className="text-3xl font-bold text-[#2a1f3d] font-display tracking-tight">Admin Panel</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#c4a8e8]/20 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#c4a8e8]" />
                <span className="text-sm font-semibold text-[#9080b0] font-body">Registered Users</span>
              </div>
              <div className="text-2xl font-bold text-[#2a1f3d] font-display">{profiles.length}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#c4a8e8]/20 p-5">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-[#c4a8e8]" />
                <span className="text-sm font-semibold text-[#9080b0] font-body">Total Generations</span>
              </div>
              <div className="text-2xl font-bold text-[#2a1f3d] font-display">{generations.length}</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#2a1f3d] mb-4 font-display">Registered Users</h2>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#c4a8e8]/20 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#c4a8e8]/15">
                    <th className="px-4 py-3 text-xs font-semibold text-[#9080b0] font-body">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#9080b0] font-body">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#9080b0] font-body hidden sm:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {dataLoading ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-sm text-[#9080b0] font-body">Loading...</td></tr>
                  ) : profiles.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-sm text-[#9080b0] font-body">No users yet.</td></tr>
                  ) : profiles.map((p) => (
                    <tr key={p.id} className="border-b border-[#c4a8e8]/10 last:border-0">
                      <td className="px-4 py-3 text-sm font-semibold text-[#2a1f3d] font-body">{p.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-[#2a1f3d] font-body">{p.email}</td>
                      <td className="px-4 py-3 text-sm text-[#9080b0] font-body hidden sm:table-cell">
                        {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#2a1f3d] mb-4 font-display">All Generations</h2>
            {dataLoading ? (
              <div className="text-[#9080b0] text-sm font-body">Loading...</div>
            ) : generations.length === 0 ? (
              <div className="text-[#9080b0] text-sm font-body py-8 text-center bg-white/50 rounded-xl border border-[#c4a8e8]/15">
                No generations yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {generations.map((gen) => (
                  <div key={gen.id} className="ref-card group cursor-pointer overflow-hidden rounded-xl bg-white/60 border border-[#c4a8e8]/15">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={gen.image_url}
                        alt={gen.style_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-semibold text-[#2a1f3d] font-body truncate">{gen.style_name}</div>
                      <div className="text-xs text-[#9080b0] font-body mt-0.5 truncate">
                        {userNameMap.get(gen.user_id) || userEmailMap.get(gen.user_id)?.split('@')[0] || 'Unknown'}
                      </div>
                      <div className="text-xs text-[#9080b0] font-body mt-0.5">
                        {new Date(gen.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
