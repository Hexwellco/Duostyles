import { useRef, useState, useMemo, useEffect } from 'react';
import { references, type ReferenceItem } from '../data/references';

interface ScrollingGalleryProps {
  onImageSelect: (ref: ReferenceItem) => void;
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Desktop CSS animation: translateX(0) -> translateX(-50%) over 60s.
// -50% of the (doubled) track == one half-width. So speed = half / 60 px/s.
const ANIM_DURATION_S = 60;
const RESUME_RAMP_MS = 500; // ease auto-scroll speed 0→full right after release
const DRAG_THRESHOLD = 8;

export default function ScrollingGallery({ onImageSelect }: ScrollingGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Shuffle once per mount, then duplicate for seamless infinite loop (existing logic)
  const shuffled = useMemo(() => fisherYates(references), []);
  const allRefs = [...shuffled, ...shuffled];

  // Mobile drag state
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const resumeStartRef = useRef(0); // timestamp when speed-ramp begins on release
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Mobile auto-drift loop (matches desktop speed); pauses only while dragging,
  // then smoothly ramps speed back up the instant the finger lifts
  useEffect(() => {
    if (!isMobile) return;
    const tick = (ts: number) => {
      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        if (lastTsRef.current) {
          const dt = (ts - lastTsRef.current) / 1000;
          if (!draggingRef.current && half > 0) {
            // Ease auto-scroll speed from 0→1 right after a drag for smooth resume
            let speedMul = 1;
            if (resumeStartRef.current) {
              const elapsed = performance.now() - resumeStartRef.current;
              if (elapsed < RESUME_RAMP_MS) {
                speedMul = elapsed / RESUME_RAMP_MS;
              } else {
                resumeStartRef.current = 0;
              }
            }
            let next = offsetRef.current - (half / ANIM_DURATION_S) * dt * speedMul;
            if (next <= -half) next += half;
            if (next > 0) next -= half;
            offsetRef.current = next;
            track.style.transform = `translate3d(${next}px, 0, 0)`;
          }
        }
        lastTsRef.current = ts;
      } else {
        lastTsRef.current = 0;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [isMobile]);

  // Sync transform when entering mobile; clear inline styles when leaving
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (isMobile) {
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    } else {
      track.style.transform = '';
      track.style.animation = '';
      offsetRef.current = 0;
    }
  }, [isMobile]);

  const wrapOffset = (raw: number, half: number) => {
    let v = raw;
    while (v <= -half) v += half;
    while (v > 0) v -= half;
    return v;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isMobile) return;
    const track = trackRef.current;
    if (!track) return;
    draggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    startOffsetRef.current = offsetRef.current;
    resumeStartRef.current = 0; // cancel any pending ramp while dragging
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isMobile || !draggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const delta = startXRef.current - e.clientX;
    if (Math.abs(delta) > DRAG_THRESHOLD) movedRef.current = true;
    const half = track.scrollWidth / 2;
    const next = wrapOffset(startOffsetRef.current - delta, half);
    offsetRef.current = next;
    track.style.transform = `translate3d(${next}px, 0, 0)`;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isMobile || !draggingRef.current) return;
    draggingRef.current = false;
    resumeStartRef.current = performance.now(); // begin smooth speed ramp now
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        maskImage: 'linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%)',
      }}
    >
      <div
        className={`scroll-gallery-wrapper${isMobile ? ' is-mobile' : ''}`}
        onMouseEnter={() => !isMobile && setIsPaused(true)}
        onMouseLeave={() => !isMobile && setIsPaused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        <div
          ref={trackRef}
          className={`scroll-gallery-track${isPaused && !isMobile ? ' paused' : ''}${isMobile ? ' mobile' : ''}`}
        >
          {allRefs.map((ref, idx) => {
            const key = `${ref.id}-${idx < references.length ? 'a' : 'b'}`;
            return (
              <button
                key={key}
                onClick={() => onImageSelect(ref)}
                className="scroll-gallery-card group"
                aria-label={`Select ${ref.label} scene`}
              >
                <img
                  src={ref.image}
                  alt={ref.label}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.15';
                  }}
                />
                <div className="scroll-gallery-overlay">
                  <span>{ref.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        /* ── Wrapper (viewport) ── */
        .scroll-gallery-wrapper {
          overflow-x: auto;
          scrollbar-width: none;
          cursor: default;
          padding: 12px 0;
        }
        .scroll-gallery-wrapper::-webkit-scrollbar { display: none; }

        /* Mobile: lock native scroll; horizontal gestures handled by JS */
        .scroll-gallery-wrapper.is-mobile {
          overflow-x: hidden;
          cursor: grab;
          touch-action: pan-y;
          -webkit-overflow-scrolling: auto;
        }
        .scroll-gallery-wrapper.is-mobile:active { cursor: grabbing; }

        @keyframes sg-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .scroll-gallery-track {
          display: flex;
          gap: 10px;
          padding: 4px 0;
          width: max-content;
          animation: sg-scroll 60s linear infinite;
          will-change: transform;
          align-items: center;
        }
        .scroll-gallery-track.paused {
          animation-play-state: paused;
        }
        /* Mobile: JS rAF controls transform; disable CSS animation */
        .scroll-gallery-track.mobile {
          animation: none;
        }

        /* ── Floating card ── */
        .scroll-gallery-card {
          position: relative;
          flex-shrink: 0;
          width: 150px;
          height: 190px;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          background: #1a1030;
          border: none;
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.22),
            0 1px 4px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(255, 255, 255, 0.06);
          transition:
            transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            box-shadow 0.3s ease;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        .scroll-gallery-card:hover {
          transform: scale(1.05) translateY(-4px);
          box-shadow:
            0 16px 40px rgba(155, 125, 212, 0.24),
            0 6px 14px rgba(0, 0, 0, 0.22),
            0 0 0 1px rgba(180, 156, 219, 0.35);
          z-index: 2;
        }
        .scroll-gallery-card:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 3px rgba(155, 125, 212, 0.75),
            0 10px 28px rgba(0, 0, 0, 0.28);
        }
        .scroll-gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
          pointer-events: none;
        }
        .scroll-gallery-card:hover img {
          transform: scale(1.07);
        }

        /* ── Hover label overlay ── */
        .scroll-gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.68) 0%, transparent 55%);
          display: flex;
          align-items: flex-end;
          padding: 10px 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .scroll-gallery-card:hover .scroll-gallery-overlay {
          opacity: 1;
        }
        .scroll-gallery-overlay span {
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          line-height: 1.2;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
        }

        @media (min-width: 640px) {
          .scroll-gallery-card {
            width: 174px;
            height: 216px;
          }
        }
      `}</style>
    </div>
  );
}
