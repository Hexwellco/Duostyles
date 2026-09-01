import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, User as UserIcon, Hash, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import AnimatedBackground from './AnimatedBackground';

interface Generation {
  id: string;
  style_name: string;
  image_url: string;
  status: string;
  created_at: string;
}

interface ProfileProps {
  onNavigate: (path: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { user, profile, signOut } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      onNavigate('/');
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setGenerations((data as Generation[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (!user) return null;

  const displayName = profile?.name || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen relative" style={{ background: '#f7f2fd' }}>
      <AnimatedBackground />
      <div className="relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b" style={{ background: 'rgba(247,242,253,0.92)', backdropFilter: 'blur(18px)', borderColor: '#ece5f6' }}>
          <div className="max-w-4xl mx-auto px-5 sm:px-6 h-[72px] flex items-center justify-between gap-4">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 h-10 px-3 rounded-full text-sm font-semibold text-[#9080b0] hover:text-[#3a2f52] hover:bg-white/60 transition-colors font-body"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold text-[#9080b0] hover:text-[#3a2f52] hover:bg-white/60 transition-colors font-body"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 pb-16">
          {/* Profile header */}
          <div className="mb-10 animate-fade-up">
            <span className="section-eyebrow">My Profile</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2a1f3d] mt-1 font-display tracking-tight">
              Profile
            </h1>
          </div>

          {/* Account card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-[#c4a8e8]/20 p-6 sm:p-8 mb-10 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-4 sm:gap-5 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)', boxShadow: '0 6px 20px rgba(180,156,219,0.30)' }}>
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2a1f3d] font-display tracking-tight truncate">{displayName}</h2>
                {profile?.is_admin && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-white bg-[#c4a8e8] px-2.5 py-1 rounded-full font-body">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#ece5f6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f7f2fd] flex-shrink-0">
                  <UserIcon className="w-[18px] h-[18px] text-[#9080b0]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#9080b0] font-body font-semibold uppercase tracking-wider">Name</div>
                  <div className="text-sm font-semibold text-[#2a1f3d] font-body truncate">{profile?.name || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f7f2fd] flex-shrink-0">
                  <Mail className="w-[18px] h-[18px] text-[#9080b0]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#9080b0] font-body font-semibold uppercase tracking-wider">Email</div>
                  <div className="text-sm font-semibold text-[#2a1f3d] font-body truncate">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f7f2fd] flex-shrink-0">
                  <Hash className="w-[18px] h-[18px] text-[#9080b0]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#9080b0] font-body font-semibold uppercase tracking-wider">User ID</div>
                  <div className="text-sm font-mono font-semibold text-[#2a1f3d] font-body truncate">{user.id.slice(0, 8)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Generations */}
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-[#b49cdb]" />
              <h3 className="text-xl font-bold text-[#2a1f3d] font-display tracking-tight">My Generations</h3>
            </div>
            {loading ? (
              <div className="text-[#9080b0] text-sm font-body">Loading...</div>
            ) : generations.length === 0 ? (
              <div className="text-[#9080b0] text-sm font-body py-12 text-center bg-white/50 rounded-2xl border border-[#c4a8e8]/15">
                No generations yet. Create your first movie fusion!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                      <div className="text-xs text-[#9080b0] font-body mt-0.5">
                        {new Date(gen.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {profile?.is_admin && (
            <button
              onClick={() => onNavigate('/admin')}
              className="mt-8 text-sm font-semibold text-[#c4a8e8] hover:text-[#3a2f52] transition-colors font-body"
            >
              Go to Admin Panel →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
