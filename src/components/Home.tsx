import {
  Sparkles, Star, Wand2, ChevronDown, Check, ArrowRight, ArrowLeft,
  Shield, User as UserIcon
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { categories, getRefsForCategory, type ReferenceItem } from '../data/references';
import ScrollingGallery from './ScrollingGallery';
import { useAuth } from '../lib/auth';
import AuthModal from './AuthModal';

interface HomeProps {
  onImageSelect: (ref: ReferenceItem) => void;
  initialCategory?: string | null;
  onNavigate?: (path: string) => void;
}

const pricingPlans = [
  {
    name: 'Starter',
    price: '$6',
    period: '/month',
    description: 'Perfect for trying out DuoStyle',
    features: ['5 AI fusions per month', '3 cinematic styles', 'HD downloads', 'Email support'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Creator',
    price: '$9',
    period: '/month',
    description: 'For creators who want more',
    features: ['20 AI fusions per month', 'All cinematic styles', 'Ultra HD downloads', 'Priority support', 'Early access to new styles'],
    cta: 'Start Creating',
    featured: true,
  },
];

const faqItems = [
  { q: 'How does DuoStyle work?', a: 'Upload your photo, choose a cinematic style, and our AI transforms your image into a movie-inspired creation.' },
  { q: 'Are my photos private?', a: 'Yes. Your photos are used only to create your result and are not shared publicly.' },
  { q: 'What styles are available?', a: 'Explore movie-inspired worlds, cinematic themes, and unique visual styles. New styles can be added over time.' },
  { q: 'How long does generation take?', a: 'Most creations are ready within a few minutes depending on AI processing load.' },
  { q: 'Can I save my generated images?', a: 'Yes. Your creations can be saved in your profile and accessed anytime.' },
  { q: 'Do I need any editing skills?', a: 'No. Just upload a photo and let AI create your cinematic transformation.' },
];

/* Tiny inline SVG decorative elements */
function DoodleStar({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2 L12.4 8.6 L19 11 L12.4 13.4 L11 20 L9.6 13.4 L3 11 L9.6 8.6 Z" stroke="#d4bef0" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function DoodleCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="16" stroke="#e8d8f8" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
    </svg>
  );
}


export default function Home({ onImageSelect, initialCategory, onNavigate }: HomeProps) {
  const { user, profile, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(initialCategory ?? null);
  const [styleFilter, setStyleFilter] = useState<'all' | 'cartoon' | 'movie' | 'collage' | 'solo'>('all');
  const lastScrollY = useRef(0);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setHeaderScrolled(currentY > 40);
      if (currentY < lastScrollY.current || currentY < 80) setHeaderVisible(true);
      else if (currentY > lastScrollY.current && currentY > 120) setHeaderVisible(false);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setTimeout(() => {
        document.getElementById('styles')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [initialCategory]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (catId: string) => {
    if (openCategory === catId) {
      setOpenCategory(null);
    } else {
      setOpenCategory(catId);
      setTimeout(() => {
        categoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  const activeCat = openCategory ? categories.find((c) => c.id === openCategory) : null;
  const activeRefs = openCategory ? getRefsForCategory(openCategory) : [];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

      {/* ── HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        headerScrolled
          ? 'border-b'
          : 'bg-transparent'
      } ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}
        style={headerScrolled ? {
          background: 'rgba(247,242,253,0.94)',
          backdropFilter: 'blur(18px)',
          borderColor: '#ece5f6',
          boxShadow: '0 1px 20px rgba(140,105,200,0.07)',
        } : {}}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-10 h-[72px] flex items-center justify-between gap-4 relative">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0 z-10">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)', boxShadow: '0 3px 12px rgba(180,156,219,0.30)' }}>
              <Wand2 className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-base font-extrabold text-[#3a2f52] tracking-tight font-display">DuoStyle</span>
          </div>
          {/* Nav — absolutely centered to the viewport */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {['Styles', 'Pricing'].map((label, i) => (
              <button
                key={label}
                onClick={() => scrollToSection(['styles', 'pricing'][i])}
                className="text-sm text-[#9080b0] hover:text-[#3a2f52] transition-colors duration-200 font-semibold font-body"
              >
                {label}
              </button>
            ))}
          </nav>
          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-shrink-0 z-10">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate?.('/profile')}
                  className="flex items-center gap-2 h-10 pl-2 pr-3 rounded-full text-sm font-semibold text-[#3a2f52] hover:bg-white/70 transition-colors duration-200 font-body border border-transparent hover:border-[#e0d4f5]"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)', boxShadow: '0 2px 8px rgba(180,156,219,0.28)' }}>
                    {(profile?.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">Profile</span>
                </button>
                <button
                  onClick={signOut}
                  className="hidden sm:flex items-center h-10 px-4 rounded-full text-sm font-semibold text-[#9080b0] hover:text-[#3a2f52] hover:bg-white/60 transition-colors duration-200 font-body"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center h-10 px-4 rounded-full text-sm font-semibold text-[#9080b0] hover:text-[#3a2f52] hover:bg-white/60 transition-colors duration-200 font-body"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => scrollToSection('pricing')}
              className="btn-accent flex items-center h-10 px-5 text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-visible pt-28 pb-12 hero-grid-bg">

        <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-5 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.80)', border: '1.5px solid #e4d9f5', boxShadow: '0 2px 14px rgba(180,156,219,0.10)', backdropFilter: 'blur(8px)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d4bef0, #e8d0f8)' }}>
                <Sparkles className="w-2.5 h-2.5 text-[#7a5fa0]" />
              </div>
              <span className="text-xs font-bold text-[#7a5fa0] font-body tracking-wide">AI-Powered Face Transfer</span>
            </div>
          </div>

          <div className="mb-5 animate-fade-up" style={{ animationDelay: '0.06s' }}>
            <h1 className="font-display text-[2.8rem] sm:text-[3.6rem] leading-[1.06] font-bold text-[#3a2f52] mb-4">
              Step Inside{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Iconic</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 6 Q50 1 98 6" stroke="#d4bef0" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>{' '}Movie Moments
            </h1>
            <p className="text-sm sm:text-base text-[#9080b0] leading-relaxed max-w-lg mx-auto font-body">
              Upload two photos. Choose a cinematic style. Let AI place you both inside an iconic scene.
            </p>
            <p className="font-handwrite text-[#b49cdb] text-lg mt-2">usually under a minute ✦</p>
          </div>

          <div className="flex justify-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => scrollToSection('styles')}
              className="btn-accent flex items-center gap-2 px-8 py-3.5 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-center items-center gap-12 pt-6 animate-fade-up" style={{ animationDelay: '0.14s', borderTop: '1px dashed #ddd5ee' }}>
            {[
              { value: '8', label: 'Cinematic styles' },
              { value: '~60s', label: 'Generation time' },
              { value: 'HD', label: 'Output quality' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-[#3a2f52] font-display">{value}</div>
                <div className="font-handwrite text-base text-[#b49cdb] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => scrollToSection('styles')}
            className="flex flex-col items-center gap-1 text-[#b49cdb] hover:text-[#3a2f52] transition-colors duration-200 animate-float"
          >
            <span className="font-handwrite text-sm">explore styles</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── SCROLLING GALLERY ── */}
      <ScrollingGallery onImageSelect={onImageSelect} />

      {/* ── STYLES / CATEGORIES ── */}
      <section id="styles" className="py-20 relative overflow-hidden" style={{ background: 'rgba(244,236,252,0.50)', position: 'relative', zIndex: 1 }}>

        {/* Decorative bg doodles */}
        <DoodleCircle className="absolute top-10 right-10 opacity-50 animate-spin-slow" />
        <DoodleStar className="absolute bottom-16 left-10 opacity-40 animate-wiggle" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-1">cinematic universes</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3a2f52] mb-3">
              Choose Your Style
            </h2>
            <p className="text-[#9080b0] text-sm max-w-xs mx-auto font-body leading-relaxed">
              Nine iconic worlds. Pick one, then choose a scene.
            </p>
          </div>

          {/* Filter pills */}
          {!openCategory && (
            <div className="flex justify-center mb-10">
              <div className="flex gap-2 overflow-x-auto max-w-full px-4 pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {(['all', 'cartoon', 'movie', 'collage', 'solo'] as const).map((f) => {
                  const label = f === 'all' ? 'All' : f === 'cartoon' ? 'Cartoons' : f === 'movie' ? 'Movies' : f === 'collage' ? 'Collages' : 'Solo Characters';
                  const active = styleFilter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setStyleFilter(f)}
                      className="flex-shrink-0 whitespace-nowrap px-5 sm:px-7 py-2.5 rounded-full text-[13px] sm:text-sm font-extrabold font-body tracking-wide transition-all duration-200"
                      style={active ? {
                        background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)',
                        color: '#fff',
                        boxShadow: '0 4px 18px rgba(180,156,219,0.40)',
                      } : {
                        background: 'rgba(255,255,255,0.85)',
                        color: '#7a5fa0',
                        border: '2px solid #e4d9f5',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category grid */}
          {!openCategory && styleFilter !== 'collage' && (
            <div className="cat-grid animate-fade-in">
              {categories.filter((cat) =>
                styleFilter === 'all' ||
                (styleFilter === 'solo' ? cat.inputMode === 'single' : cat.category === styleFilter)
              ).map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="ref-card group text-left animate-scale-in focus:outline-none"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={cat.cover}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onLoad={() => console.log('IMAGE PATH:', cat.cover)}
                      onError={() => console.warn('IMAGE LOAD ERROR:', cat.cover)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a2f52]/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="category-tag">{cat.tag}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[#3a2f52] text-[11px] font-bold font-body px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 10px rgba(140,105,200,0.15)' }}>
                        <Sparkles className="w-3 h-3 text-[#b49cdb]" />
                        View Scenes
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-[12px] font-bold text-[#3a2f52] font-body">{cat.name}</p>
                    <p className="font-handwrite text-[13px] text-[#b49cdb] mt-0.5">3 scenes · {cat.tag}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Collage direct view */}
          {!openCategory && styleFilter === 'collage' && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-5 animate-fade-in">
              {getRefsForCategory('collage').map((ref, idx) => (
                <button
                  key={ref.id}
                  onClick={() => onImageSelect(ref)}
                  className="ref-card group text-left animate-scale-in focus:outline-none"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={ref.image}
                      alt={ref.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a2f52]/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[#3a2f52] text-[11px] font-bold font-body px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 10px rgba(140,105,200,0.15)' }}>
                        <Sparkles className="w-3 h-3 text-[#b49cdb]" />
                        Select Scene
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-[12px] font-bold text-[#3a2f52] font-body">{ref.label}</p>
                    <p className="font-handwrite text-[13px] text-[#b49cdb] mt-0.5">tap to select ↗</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Open category detail */}
          {openCategory && activeCat && (
            <div ref={categoryRef} className="animate-fade-up">
              <button
                onClick={() => setOpenCategory(null)}
                className="flex items-center gap-2 text-sm font-bold font-body text-[#9080b0] hover:text-[#3a2f52] transition-colors duration-200 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                All styles
              </button>

              <div className="flex items-center gap-3 mb-7">
                <div className="w-1.5 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #c4a8e8, #e2b8d8)' }} />
                <div>
                  <h3 className="font-display font-bold text-[#3a2f52] text-xl">{activeCat.name}</h3>
                </div>
                <span className="category-tag ml-auto">{activeCat.tag}</span>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {activeRefs.map((ref, idx) => (
                  <button
                    key={ref.id}
                    onClick={() => onImageSelect(ref)}
                    className="ref-card group text-left animate-scale-in focus:outline-none"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={ref.image}
                        alt={`${ref.label} scene ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onLoad={() => console.log('IMAGE PATH:', ref.image)}
                        onError={() => console.warn('IMAGE LOAD ERROR:', ref.image)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3a2f52]/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)' }}>
                          {idx + 1}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[#3a2f52] text-[11px] font-bold font-body px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
                          <Sparkles className="w-3 h-3 text-[#b49cdb]" />
                          Select Scene
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-[12px] font-bold text-[#3a2f52] font-body">{openCategory === 'collage' ? ref.label : `Scene ${idx + 1}`}</p>
                      <p className="font-handwrite text-[13px] text-[#b49cdb] mt-0.5">tap to select ↗</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 relative overflow-hidden" style={{ background: 'rgba(250,246,255,0.55)', position: 'relative', zIndex: 1 }}>
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-1">pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#3a2f52] mb-3">
              Start for{' '}
              <span className="relative inline-block">
                <span className="relative z-10">$6/mo</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 6 Q50 1 98 6" stroke="#d4bef0" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="font-handwrite text-[#b49cdb] text-lg">no commitments · cancel anytime</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`${plan.featured ? 'pricing-card-featured' : 'pricing-card'} p-8 lg:p-10`}
              >
                {plan.featured && (
                  <div className="badge-accent inline-flex items-center gap-1.5 mb-5">
                    <Star className="w-2.5 h-2.5" />
                    Most Popular
                  </div>
                )}
                <p className="text-xs font-extrabold text-[#b49cdb] uppercase tracking-widest mb-2 font-body">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1.5">
                  <span className="font-display text-4xl font-bold text-[#3a2f52]">{plan.price}</span>
                  <span className="text-[#9080b0] text-sm mb-1.5 font-body">{plan.period}</span>
                </div>
                <p className="font-handwrite text-[#b49cdb] text-base mb-5">{plan.description}</p>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#3a2f52]">
                      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c4a8e8, #d4bef0)', width: 20, height: 20 }}>
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-body">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-full text-sm font-bold transition-all duration-200 font-body ${
                    plan.featured ? 'btn-accent' : 'btn-primary'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 sm:py-28 relative overflow-hidden" style={{ background: 'transparent', position: 'relative', zIndex: 1 }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06] pointer-events-none" style={{ background: 'radial-gradient(circle, #c4a8e8, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="text-center mb-14 sm:mb-16">
            <p className="section-eyebrow mb-2">questions</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#2a1f3d] mb-3 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="font-body text-[#9080b0] text-base sm:text-lg max-w-md mx-auto">
              Everything you need to know about creating your cinematic transformation.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="faq-item-premium"
                  style={{
                    background: isOpen
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(248,242,253,0.95) 100%)'
                      : 'rgba(255,255,255,0.82)',
                    borderColor: isOpen ? '#c4a8e8' : '#ece5f6',
                    boxShadow: isOpen
                      ? '0 10px 40px rgba(140,105,200,0.12), 0 2px 8px rgba(140,105,200,0.06)'
                      : '0 2px 12px rgba(140,105,200,0.05)',
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-5 sm:py-6 text-left"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-[#2a1f3d] text-base sm:text-lg font-body pr-2 leading-snug">
                      {item.q}
                    </span>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{
                        background: isOpen
                          ? 'linear-gradient(135deg, #b49cdb, #c9b0e8)'
                          : 'rgba(248,244,255,0.9)',
                        border: `1.5px solid ${isOpen ? '#b49cdb' : '#e4d9f5'}`,
                        boxShadow: isOpen ? '0 4px 14px rgba(180,156,219,0.35)' : 'none',
                      }}
                    >
                      <div className="relative w-4 h-4">
                        <span
                          className="absolute top-1/2 left-0 w-full h-[2px] rounded-full transition-all duration-300"
                          style={{
                            background: isOpen ? '#ffffff' : '#b49cdb',
                            transform: 'translateY(-50%)',
                          }}
                        />
                        <span
                          className="absolute left-1/2 top-0 h-full w-[2px] rounded-full transition-all duration-300"
                          style={{
                            background: isOpen ? '#ffffff' : '#b49cdb',
                            transform: isOpen ? 'rotate(90deg) scaleY(0)' : 'translateX(-50%) scaleY(1)',
                          }}
                        />
                      </div>
                    </div>
                  </button>
                  <div className={`faq-answer-premium ${isOpen ? 'open' : ''}`}>
                    <p className="px-5 sm:px-7 pb-5 sm:pb-6 text-sm sm:text-[15px] text-[#6a5f80] leading-relaxed font-body">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 relative overflow-hidden" style={{ background: 'linear-gradient(155deg, #2e2346 0%, #1e1830 100%)' }}>
        {/* Soft blobs */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c4a8e8, transparent)', filter: 'blur(30px)' }} />
        <div className="absolute bottom-0 right-0 w-56 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #e2b8d8, transparent)', filter: 'blur(30px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(196,168,232,0.18)' }}>
                  <Wand2 className="w-3.5 h-3.5 text-[#c4a8e8]" />
                </div>
                <span className="text-sm font-bold text-white font-display">DuoStyle</span>
              </div>
              <p className="text-xs font-body max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.36)' }}>
                AI-powered cinematic face fusions. Step inside your favorite movie moments.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <Shield className="w-3 h-3 text-[#c4a8e8]" />
                Your privacy is protected
              </div>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200" style={{ background: 'rgba(196,168,232,0.10)', color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c4a8e8')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a href="#" aria-label="TikTok" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200" style={{ background: 'rgba(196,168,232,0.10)', color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c4a8e8')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200" style={{ background: 'rgba(196,168,232,0.10)', color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c4a8e8')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
              <p className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.26)' }}>2025 DuoStyle. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-xs font-body transition-colors hover:text-[#c4a8e8]" style={{ color: 'rgba(255,255,255,0.36)' }}>Privacy</a>
                <a href="#" className="text-xs font-body transition-colors hover:text-[#c4a8e8]" style={{ color: 'rgba(255,255,255,0.36)' }}>Terms</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
