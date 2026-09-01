import { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, Chrome } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('signin');
      setEmail('');
      setPassword('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) setError(error);
        else onClose();
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) setError(error);
        else onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    await signInWithGoogle();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(42,31,61,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-xl border border-[#c4a8e8]/25 shadow-2xl overflow-hidden"
        style={{ animation: 'authModalIn 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes authModalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#9080b0] hover:text-[#3a2f52] hover:bg-[#f0e8ff] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 pt-10 pb-8">
          <h2 className="text-2xl font-bold text-[#2a1f3d] font-display tracking-tight text-center mb-1">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-[#9080b0] font-body text-center mb-7">
            {mode === 'signin' ? 'Sign in to save your movie fusions' : 'Join to start creating movie fusions'}
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="btn-secondary w-full py-3 flex items-center justify-center gap-2.5 text-sm font-semibold mb-5"
          >
            <Chrome className="w-5 h-5 text-[#4285F4]" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e4d9f5]" />
            <span className="text-xs text-[#9080b0] font-body font-semibold">or</span>
            <div className="flex-1 h-px bg-[#e4d9f5]" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#9080b0] font-body mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a8d0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f2fd] border border-[#e0d4f5] text-sm text-[#2a1f3d] font-body placeholder:text-[#b8a8d0] focus:outline-none focus:border-[#b49cdb] focus:ring-2 focus:ring-[#c4a8e8]/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9080b0] font-body mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a8d0]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f7f2fd] border border-[#e0d4f5] text-sm text-[#2a1f3d] font-body placeholder:text-[#b8a8d0] focus:outline-none focus:border-[#b49cdb] focus:ring-2 focus:ring-[#c4a8e8]/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-[#c44040] bg-[#fdf0f0] border border-[#e8c8c8] rounded-xl px-3 py-2.5 font-body">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9080b0] font-body mt-5">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-[#7a5fa0] font-semibold hover:text-[#5a3f80] transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
