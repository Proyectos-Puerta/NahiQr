import { useEffect, useId, useRef, useState } from 'react';

// ============================================================================
// API
// ============================================================================

interface StatusResponse {
  currentScans: number;
  target: number;
  isOverloaded: boolean;
}

interface ScanResponse extends StatusResponse {
  recorded: boolean;
}

const POLL_MS = 3000;
const FALLBACK_TARGET = 15;

const isStatusResponse = (x: unknown): x is StatusResponse =>
  typeof x === 'object' &&
  x !== null &&
  typeof (x as StatusResponse).currentScans === 'number' &&
  typeof (x as StatusResponse).target === 'number' &&
  typeof (x as StatusResponse).isOverloaded === 'boolean';

/** Fetches and validates a status payload from the Vercel functions. */
const fetchStatus = async (url: string, init?: RequestInit): Promise<StatusResponse> => {
  const res = await fetch(url, { ...init, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  if (!isStatusResponse(data)) throw new Error('Respuesta inválida');
  return data;
};

type Visitor = 'pending' | 'new' | 'repeat' | 'unknown';

interface CommunityState {
  status: StatusResponse | null;
  offline: boolean;
  visitor: Visitor;
}

/** Logs this visit once, then polls the community counter until the door is forced. */
const useCommunityStatus = (): CommunityState => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [offline, setOffline] = useState(false);
  const [visitor, setVisitor] = useState<Visitor>('pending');
  const scanSent = useRef(false);

  // POST /api/scan on mount. The ref keeps StrictMode's double-invoked effect from sending it twice.
  useEffect(() => {
    if (scanSent.current) return;
    scanSent.current = true;
    fetchStatus('/api/scan', { method: 'POST' })
      .then((data) => {
        setStatus(data);
        setOffline(false);
        setVisitor((data as ScanResponse).recorded ? 'new' : 'repeat');
      })
      .catch(() => {
        setOffline(true);
        setVisitor('unknown');
      });
  }, []);

  const overloaded = status?.isOverloaded ?? false;

  // GET /api/status every 3 s. Stops once overloaded (the unlock is permanent) and skips
  // while the tab is hidden so pocketed phones don't keep hitting the server.
  useEffect(() => {
    if (overloaded) return;
    let controller: AbortController | null = null;

    const tick = () => {
      if (document.hidden) return;
      controller?.abort();
      controller = new AbortController();
      fetchStatus('/api/status', { signal: controller.signal })
        .then((data) => {
          setStatus(data);
          setOffline(false);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setOffline(true);
        });
    };

    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      controller?.abort();
    };
  }, [overloaded]);

  return { status, offline, visitor };
};

// ============================================================================
// Overload sequence: sealed -> breaching (sparks, flash, lock pops) -> breaking (barrier snaps) -> revealed
// ============================================================================

type BreachStep = 'sealed' | 'breaching' | 'breaking' | 'revealed';

const BREACH_MS = 1400;
const RIP_MS = 1000;

const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useBreachSequence = (overloaded: boolean): BreachStep => {
  // Only the timed part of the sequence lives in state; 'sealed' and the reduced-motion
  // shortcut are derived, so nothing is set synchronously inside the effect.
  const [timedStep, setTimedStep] = useState<Exclude<BreachStep, 'sealed'>>('breaching');
  const [reduceMotion] = useState(prefersReducedMotion);

  // Rewind when `overloaded` drops back to false (dev RESET), so the next unlock replays
  // the full animation. "Adjust state on prop change" pattern: runs during render, no effect.
  const [prevOverloaded, setPrevOverloaded] = useState(overloaded);
  if (overloaded !== prevOverloaded) {
    setPrevOverloaded(overloaded);
    if (!overloaded) setTimedStep('breaching');
  }

  useEffect(() => {
    if (!overloaded || reduceMotion) return;
    const t1 = window.setTimeout(() => setTimedStep('breaking'), BREACH_MS);
    const t2 = window.setTimeout(() => setTimedStep('revealed'), BREACH_MS + RIP_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [overloaded, reduceMotion]);

  if (!overloaded) return 'sealed';
  return reduceMotion ? 'revealed' : timedStep;
};

// ============================================================================
// Brand graphics (SVG / CSS)
// ============================================================================

interface ClassNameProps {
  className?: string;
}

/** "19 AÑOS" warning-triangle badge from the T-shirt sleeve. */
const CautionBadge = ({ className = '' }: ClassNameProps) => (
  <svg viewBox="0 0 100 90" className={className} role="img" aria-label="19 años">
    <path
      d="M50 8 94 82H6Z"
      className="fill-brand-yellow stroke-brand-yellow"
      strokeWidth={10}
      strokeLinejoin="round"
    />
    <path d="M50 22 81 76H19Z" className="fill-none stroke-brand-black" strokeWidth={4} strokeLinejoin="round" />
    <text x="50" y="62" textAnchor="middle" className="fill-brand-black font-display text-[26px] font-bold">
      19
    </text>
    <text x="50" y="72" textAnchor="middle" className="fill-brand-black font-display text-[9px] font-bold">
      AÑOS
    </text>
  </svg>
);

/** Bare caution triangle (no label) for the reveal. */
const CautionTriangle = ({ className = '' }: ClassNameProps) => (
  <svg viewBox="0 0 100 90" className={className} aria-hidden="true">
    <path d="M50 8 94 82H6Z" className="fill-brand-yellow stroke-brand-yellow" strokeWidth={10} strokeLinejoin="round" />
    <path d="M46 34h8l-1.5 26h-5Z" className="fill-brand-black" />
    <circle cx="50" cy="69" r="4.5" className="fill-brand-black" />
  </svg>
);

// Pixel-art arrow: B = outline, W = fill, . = transparent.
const CURSOR_ROWS = [
  'B...........',
  'BB..........',
  'BWB.........',
  'BWWB........',
  'BWWWB.......',
  'BWWWWB......',
  'BWWWWWB.....',
  'BWWWWWWB....',
  'BWWWWWWWB...',
  'BWWWWWWWWB..',
  'BWWWWWWWWWB.',
  'BWWWWWWBBBBB',
  'BWWWBWWB....',
  'BWWBBWWB....',
  'BWB..BWWB...',
  'BB...BWWB...',
  'B.....BWWB..',
  '......BWWB..',
  '.......BB...',
];

const CURSOR_PIXELS = CURSOR_ROWS.flatMap((row, y) =>
  [...row].flatMap((cell, x) => (cell === '.' ? [] : [{ x, y, outline: cell === 'B' }])),
);

const PixelCursor = ({ className = '' }: ClassNameProps) => (
  <svg viewBox="0 0 12 19" shapeRendering="crispEdges" className={className} aria-hidden="true">
    {CURSOR_PIXELS.map(({ x, y, outline }) => (
      <rect
        key={`${x}-${y}`}
        x={x}
        y={y}
        width={1}
        height={1}
        className={outline ? 'fill-brand-black' : 'fill-brand-white'}
      />
    ))}
  </svg>
);

/** Slotted steel screw head ("detalles realistas"). */
const Screw = ({ className = '' }: ClassNameProps) => {
  const id = useId();
  return (
    <svg viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F2F3F5" />
          <stop offset="55%" stopColor="#9DA1A6" />
          <stop offset="100%" stopColor="#4A4D51" />
        </radialGradient>
      </defs>
      <circle cx="10" cy="10" r="9" fill={`url(#${id})`} className="stroke-brand-black" strokeWidth={1} />
      <path d="M5 13 15 7" className="stroke-tape-dark" strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
};

/** Grainy many-pointed starburst from the "Fondo" set. */
const STAR_POINTS = Array.from({ length: 24 }, (_, i) => {
  const r = i % 2 === 0 ? 100 : 62;
  const a = (Math.PI * i) / 12 - Math.PI / 2;
  return `${(110 + r * Math.cos(a)).toFixed(1)},${(110 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

const Starburst = ({ className = '' }: ClassNameProps) => {
  const id = useId();
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
      <defs>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="26" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono" result="speckle">
            <feFuncA type="discrete" tableValues="0 0 0.6 1" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="speckle" operator="in" result="grain" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="soft" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>
      </defs>
      <polygon points={STAR_POINTS} className="fill-brand-violet" filter={`url(#${id})`} />
    </svg>
  );
};

/** Rough-edged spray paint filter shared by the splatter / underline / scribble marks. */
const SprayFilter = ({ id }: { id: string }) => (
  <filter id={id}>
    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" seed="18" />
    <feDisplacementMap in="SourceGraphic" scale="4" />
  </filter>
);

interface SpraySplatProps extends ClassNameProps {
  /** Tailwind fill class, e.g. "fill-brand-pink". */
  fill: string;
}

/** Graffiti splat with drips ("manchas graffiti"). */
const SpraySplat = ({ className = '', fill }: SpraySplatProps) => {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <SprayFilter id={id} />
      </defs>
      <g className={fill} filter={`url(#${id})`}>
        <circle cx="42" cy="38" r="20" />
        <path d="M30 50c2 14 1 30 3 44 1 5 7 5 7 0 0-14-2-28-1-42zM50 52c1 10 0 18 2 26 1 4 6 4 6 0-1-9-2-17-3-27z" />
        <circle cx="74" cy="22" r="4" />
        <circle cx="86" cy="40" r="2.5" />
        <circle cx="70" cy="58" r="3" />
        <circle cx="16" cy="20" r="2" />
        <circle cx="94" cy="62" r="1.8" />
        <circle cx="80" cy="80" r="2.4" />
        <circle cx="12" cy="64" r="1.6" />
        <circle cx="60" cy="10" r="1.6" />
      </g>
    </svg>
  );
};

/** Spray asterisk/spark tag next to "PROBAR." (T-shirt back print). */
const SprayStar = ({ className = '' }: ClassNameProps) => {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <SprayFilter id={id} />
      </defs>
      <g className="stroke-brand-yellow" strokeWidth={4} strokeLinecap="round" filter={`url(#${id})`}>
        <path d="M20 4v32M4 20h32M8 8l24 24M32 8 8 32" />
      </g>
    </svg>
  );
};

/** Yellow spray underline with paint drips (under "INTENTAR"). */
const SprayUnderline = ({ className = '' }: ClassNameProps) => {
  const id = useId();
  return (
    <span className={`pointer-events-none absolute inset-x-[-4%] ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 16" preserveAspectRatio="none" className="block h-3 w-full">
        <defs>
          <SprayFilter id={id} />
        </defs>
        <path
          d="M2 9c30-5 70-6 110-4s60 3 86 1"
          className="fill-none stroke-brand-yellow"
          strokeWidth={6}
          strokeLinecap="round"
          filter={`url(#${id})`}
        />
      </svg>
      <span className="absolute left-[22%] top-2 h-5 w-[3px] origin-top animate-drip rounded-b-full bg-brand-yellow motion-reduce:animate-none" />
      <span className="absolute left-[58%] top-2 h-8 w-1 origin-top animate-drip rounded-b-full bg-brand-yellow [animation-delay:1s] motion-reduce:animate-none" />
      <span className="absolute left-[84%] top-2 h-3 w-[3px] origin-top animate-drip rounded-b-full bg-brand-yellow [animation-delay:1.6s] motion-reduce:animate-none" />
    </span>
  );
};

/** Scribble crossing out part of "FALLAR." */
const SprayScribble = ({ className = '' }: ClassNameProps) => {
  const id = useId();
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <SprayFilter id={id} />
      </defs>
      <path
        d="M4 26 24 12 34 30 54 10 66 28 86 12 96 22"
        className="fill-none stroke-brand-yellow"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id})`}
      />
    </svg>
  );
};

// ============================================================================
// FX components
// ============================================================================

interface GlitchTextProps extends ClassNameProps {
  text: string;
  /** Constant hard glitching instead of the occasional idle hiccup. */
  intense?: boolean;
  /** 'rgb' = pink/cyan split (default); 'brand' = violet/yellow split. */
  tone?: 'rgb' | 'brand';
}

const GLITCH_TONES: Record<NonNullable<GlitchTextProps['tone']>, [before: string, after: string]> = {
  rgb: ['before:text-brand-pink', 'after:text-fx-cyan'],
  brand: ['before:text-brand-violet', 'after:text-brand-yellow'],
};

/** Text with two colour-split sliced copies rendered in ::before / ::after. */
const GlitchText = ({ text, className = '', intense = false, tone = 'rgb' }: GlitchTextProps) => (
  <span
    data-text={text}
    className={[
      'relative inline-block',
      `before:pointer-events-none before:absolute before:inset-0 ${GLITCH_TONES[tone][0]} before:content-[attr(data-text)]`,
      `after:pointer-events-none after:absolute after:inset-0 ${GLITCH_TONES[tone][1]} after:content-[attr(data-text)]`,
      'motion-reduce:before:hidden motion-reduce:after:hidden',
      intense
        ? 'before:animate-glitch-a after:animate-glitch-b'
        : 'before:animate-glitch-idle-a after:animate-glitch-idle-b',
      className,
    ].join(' ')}
  >
    {text}
  </span>
);

interface DuctTapeProps extends ClassNameProps {
  label?: string;
}

const TAPE_CLIP =
  '[clip-path:polygon(3%_0,97%_0,100%_18%,97%_36%,100%_54%,96%_72%,100%_88%,97%_100%,3%_100%,0_86%,4%_70%,0_52%,3%_34%,0_16%)]';

/** Strip of silver duct tape with torn ends, used as a stuck-on label. */
const DuctTape = ({ className = '', label }: DuctTapeProps) => (
  <div className={`drop-shadow-[0_3px_2px_rgba(0,0,0,0.75)] ${className}`} aria-hidden="true">
    <div
      className={`flex h-full w-full items-center justify-center bg-tape font-mono text-[11px] tracking-[0.25em] text-brand-black/85 ${TAPE_CLIP}`}
    >
      {label}
    </div>
  </div>
);

interface PadlockProps extends ClassNameProps {
  /** Hard glitch + shackle pops open (overload). */
  forced?: boolean;
}

/** Industrial padlock: steel shackle, caution-yellow body with hazard band, status LED. */
const Padlock = ({ className = '', forced = false }: PadlockProps) => {
  const id = useId();
  return (
    <svg
      viewBox="0 0 64 84"
      className={`overflow-visible ${forced ? 'animate-lock-glitch-hard' : 'animate-lock-glitch'} motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="8" className="fill-brand-black" />
        </pattern>
      </defs>
      {/* Shackle: pivots on its right leg when forced */}
      <path
        d="M18 42V24a14 14 0 0 1 28 0v18"
        className={`fill-none stroke-tape-light [transform-box:fill-box] origin-bottom-right ${forced ? 'animate-shackle-open' : ''}`}
        strokeWidth={7}
        strokeLinecap="square"
      />
      {/* Body */}
      <rect x="6" y="38" width="52" height="42" rx="3" className="fill-brand-yellow" />
      <rect x="6" y="68" width="52" height="12" fill={`url(#${id})`} />
      <rect x="6" y="38" width="52" height="42" rx="3" className="fill-none stroke-brand-black" strokeWidth={2} />
      <text x="11" y="47" className="fill-brand-black font-mono text-[6px]">
        M26
      </text>
      <circle cx="51" cy="44.5" r="2.4" className={`fill-brand-red ${forced ? 'animate-strobe' : 'animate-blink'}`} />
      {/* Keyhole */}
      <circle cx="32" cy="52" r="5" className="fill-brand-black" />
      <path d="M29.5 54h5l1.5 10h-8Z" className="fill-brand-black" />
    </svg>
  );
};

interface HazardBarrierProps extends ClassNameProps {
  label: string;
  /** Stripes race while the door is being forced. */
  alarm?: boolean;
  /** Snaps at the centre seam and both halves fall away. */
  breaking?: boolean;
}

interface BarrierFaceProps {
  label: string;
  alarm: boolean;
  /** Which edge of its half the full-width face is pinned to. */
  side: 'left' | 'right';
}

/** Full-width barrier artwork; each half renders one copy so the plate splits across the break. */
const BarrierFace = ({ label, alarm, side }: BarrierFaceProps) => (
  <div
    className={`absolute inset-y-0 flex w-[200%] border-y-2 border-brand-black ${side === 'left' ? 'left-0' : 'right-0'}`}
  >
    <span className="flex w-5 shrink-0 items-center justify-center border-r-2 border-brand-black bg-steel">
      <Screw className="h-3 w-3" />
    </span>
    <span className={`relative flex-1 bg-hazard-lg ${alarm ? 'animate-hazard-scroll-lg motion-reduce:animate-none' : ''}`}>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-2 border-brand-yellow bg-brand-black px-2 py-0.5 font-mono text-[10px] tracking-[0.25em] text-brand-yellow shadow-[0_0_0_2px_#000]">
        {label}
      </span>
    </span>
    <span className="flex w-5 shrink-0 items-center justify-center border-l-2 border-brand-black bg-steel">
      <Screw className="h-3 w-3 rotate-90" />
    </span>
  </div>
);

/** Heavy yellow/black hazard beam bolted across the door. */
const HazardBarrier = ({ className = '', label, alarm = false, breaking = false }: HazardBarrierProps) => (
  <div className={`flex drop-shadow-[0_4px_3px_rgba(0,0,0,0.8)] ${className}`} aria-hidden="true">
    <div className={`relative h-full w-1/2 overflow-hidden ${breaking ? 'animate-barrier-snap-l' : ''}`}>
      <BarrierFace label={label} alarm={alarm} side="left" />
    </div>
    <div className={`relative h-full w-1/2 overflow-hidden ${breaking ? 'animate-barrier-snap-r' : ''}`}>
      <BarrierFace label={label} alarm={alarm} side="right" />
    </div>
  </div>
);

// Spark rays radiating from a point. Classes are written out in full so Tailwind can see them.
const SPARK_RAYS = [
  { rot: 'rotate-0', delay: '[animation-delay:0ms]', tone: 'bg-brand-yellow', len: 'h-8' },
  { rot: 'rotate-[30deg]', delay: '[animation-delay:60ms]', tone: 'bg-brand-white', len: 'h-5' },
  { rot: 'rotate-[60deg]', delay: '[animation-delay:120ms]', tone: 'bg-brand-orange', len: 'h-7' },
  { rot: 'rotate-90', delay: '[animation-delay:30ms]', tone: 'bg-brand-yellow', len: 'h-6' },
  { rot: 'rotate-[120deg]', delay: '[animation-delay:90ms]', tone: 'bg-brand-white', len: 'h-8' },
  { rot: 'rotate-[150deg]', delay: '[animation-delay:150ms]', tone: 'bg-brand-yellow', len: 'h-5' },
  { rot: 'rotate-180', delay: '[animation-delay:20ms]', tone: 'bg-brand-orange', len: 'h-7' },
  { rot: 'rotate-[210deg]', delay: '[animation-delay:110ms]', tone: 'bg-brand-yellow', len: 'h-6' },
  { rot: 'rotate-[240deg]', delay: '[animation-delay:70ms]', tone: 'bg-brand-white', len: 'h-8' },
  { rot: 'rotate-[270deg]', delay: '[animation-delay:140ms]', tone: 'bg-brand-yellow', len: 'h-5' },
  { rot: 'rotate-[300deg]', delay: '[animation-delay:40ms]', tone: 'bg-brand-orange', len: 'h-7' },
  { rot: 'rotate-[330deg]', delay: '[animation-delay:100ms]', tone: 'bg-brand-yellow', len: 'h-6' },
] as const;

const Sparks = ({ className = '' }: ClassNameProps) => (
  <div className={`pointer-events-none h-0 w-0 ${className}`} aria-hidden="true">
    {SPARK_RAYS.map(({ rot, delay, tone, len }) => (
      <span key={rot} className={`absolute left-0 top-0 h-0 w-0 ${rot}`}>
        <span
          className={`absolute bottom-0 left-[-1.5px] w-[3px] origin-bottom animate-spark-fly rounded-full shadow-[0_0_6px_#EEC324] ${tone} ${len} ${delay}`}
        />
      </span>
    ))}
  </div>
);

/** Fixed CRT layer: scanlines, grain, vignette and a slow rolling refresh band. */
const CrtOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
    <div className="absolute inset-0 bg-scanlines" />
    <div className="absolute inset-0 bg-grain opacity-[0.09] mix-blend-overlay" />
    <div className="absolute inset-x-0 top-0 h-28 animate-scan-roll bg-gradient-to-b from-transparent via-brand-white/[0.05] to-transparent motion-reduce:hidden" />
    <div className="absolute inset-0 bg-vignette" />
  </div>
);

// ============================================================================
// Sections
// ============================================================================

interface StatusBarProps {
  signal: 'linking' | 'live' | 'lost' | 'overload';
}

const SIGNAL_LABEL: Record<StatusBarProps['signal'], { text: string; dot: string; tone: string }> = {
  linking: { text: 'ENLAZANDO', dot: 'bg-brand-white', tone: 'text-brand-white/70' },
  live: { text: 'EN VIVO', dot: 'bg-brand-yellow', tone: 'text-brand-yellow' },
  lost: { text: 'SIN SEÑAL', dot: 'bg-brand-orange', tone: 'text-brand-orange' },
  overload: { text: 'SOBRECARGA', dot: 'bg-brand-red', tone: 'text-brand-white' },
};

const StatusBar = ({ signal }: StatusBarProps) => {
  const s = SIGNAL_LABEL[signal];
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-sm tracking-widest text-brand-white">
          &gt; MUESTRA_26.EXE
          <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-brand-yellow" />
        </p>
        <p className={`mt-1 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] ${s.tone}`}>
          <span className={`inline-block h-1.5 w-1.5 animate-blink ${s.dot}`} />
          NODO: PUERTA_18 · {s.text}
        </p>
      </div>
      <CautionBadge className="h-11 w-12 shrink-0 -rotate-6" />
    </header>
  );
};

interface ManifestoProps {
  breaching: boolean;
}

const Manifesto = ({ breaching }: ManifestoProps) => (
  <section aria-label="Manifiesto" className="font-display text-[clamp(34px,10.6vw,44px)] font-bold uppercase leading-[0.98] tracking-tight">
    <p className="flex items-start">
      PROBAR.
      <SprayStar className="-ml-1 -mt-1 h-7 w-7" />
    </p>
    <p className="relative w-fit">
      <GlitchText text="FALLAR." intense={breaching} />
      <SprayScribble className="absolute right-[4%] top-[18%] h-[60%] w-[52%]" />
    </p>
    <p>
      VOLVER A{' '}
      <span className="relative inline-block">
        INTENTAR
        <SprayUnderline className="-bottom-1.5" />
      </span>
      .
    </p>
  </section>
);

const pad2 = (n: number) => String(n).padStart(2, '0');

interface CommunityBoardProps {
  status: StatusResponse | null;
  offline: boolean;
  visitor: Visitor;
  alarm: boolean;
}

const CommunityBoard = ({ status, offline, visitor, alarm }: CommunityBoardProps) => {
  const target = status?.target ?? FALLBACK_TARGET;
  const scans = Math.min(status?.currentScans ?? 0, target);
  const remaining = target - scans;
  const overloaded = status?.isOverloaded ?? false;

  let hint: string;
  if (!status) hint = offline ? 'SEÑAL PERDIDA · REINTENTANDO...' : 'CONECTANDO CON EL TABLERO...';
  else if (overloaded) hint = 'CARGA MÁXIMA · LA COMUNIDAD LO LOGRÓ';
  else if (remaining === 1) hint = 'FALTA 1 ESCANEO PARA FORZAR LA PUERTA';
  else hint = `FALTAN ${remaining} ESCANEOS PARA FORZAR LA PUERTA`;

  const visitorLine: Record<Visitor, string | null> = {
    pending: null,
    unknown: null,
    new: '+1 · TU ESCANEO FUE REGISTRADO',
    repeat: 'TU ESCANEO YA ESTÁ EN EL CONTEO',
  };

  return (
    <section
      aria-label="Contador de la comunidad"
      className="relative mt-3 border-2 border-brand-white bg-brand-black px-4 pb-3 pt-6"
    >
      <Screw className="absolute left-1.5 top-1.5" />
      <Screw className="absolute right-1.5 top-1.5 rotate-45" />
      <Screw className="absolute bottom-1.5 left-1.5 rotate-90" />
      <Screw className="absolute bottom-1.5 right-1.5 -rotate-12" />

      <DuctTape className="absolute -top-3.5 left-1/2 h-7 w-48 -translate-x-1/2 -rotate-2" label="ESTADO · COMUNIDAD" />

      {alarm && (
        <p className="mb-3 animate-strobe bg-brand-red py-1 text-center font-display text-lg font-bold tracking-wider text-brand-white motion-reduce:animate-none">
          ⚠ OVERLOAD // PUERTA FORZADA
        </p>
      )}

      <p
        className="whitespace-nowrap text-center font-pixel text-[clamp(26px,8.4vw,34px)] leading-none text-brand-yellow"
        aria-live="polite"
        aria-atomic="true"
      >
        [ {status ? pad2(scans) : '--'} / {target} ESCANEOS ]
      </p>

      <div
        className="mt-3 grid h-5 grid-cols-[repeat(15,minmax(0,1fr))] gap-[3px]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={scans}
        aria-label="Progreso de escaneos"
      >
        {Array.from({ length: target }, (_, i) => (
          <span
            key={i}
            className={
              i < scans
                ? `animate-hazard-scroll bg-hazard motion-reduce:animate-none ${overloaded ? 'shadow-[0_0_8px_#FE7C00]' : ''}`
                : 'border border-brand-white/25'
            }
          />
        ))}
      </div>

      <p
        className={`mt-2.5 font-mono text-[11px] tracking-[0.18em] ${
          offline ? 'text-brand-orange' : 'text-brand-white/75'
        } ${!status ? 'animate-pulse-slow' : ''}`}
      >
        {hint}
      </p>
      {visitorLine[visitor] && (
        <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-brand-yellow/80">{visitorLine[visitor]}</p>
      )}
    </section>
  );
};

interface MysteryDoorProps {
  step: BreachStep;
}

/** The violet arch "puerta", padlocked and barred until the community forces it open. */
const MysteryDoor = ({ step }: MysteryDoorProps) => {
  const breaching = step === 'breaching';
  const breaking = step === 'breaking';
  const forcing = breaching || breaking;
  const revealed = step === 'revealed';

  return (
    <section aria-label="Puerta" className="relative mx-auto h-[262px] w-[208px] shrink-0">
      {/* Frame: grainy violet arch */}
      <div className="absolute inset-0 overflow-hidden rounded-t-full bg-brand-violet shadow-[0_0_40px_rgba(146,7,234,0.45)]">
        <div className="absolute inset-0 bg-grain opacity-50 mix-blend-multiply" />

        {/* Opening */}
        <div
          className={`absolute inset-[10px] bottom-0 flex flex-col items-center overflow-hidden rounded-t-full bg-brand-black ${
            revealed ? 'justify-center' : 'justify-start pt-9'
          } ${breaching ? 'animate-static-noise bg-grain bg-[length:90px_90px]' : ''}`}
        >
          {revealed ? (
            <div className="flex flex-col items-center px-4 pt-6 text-center">
              <CautionTriangle className="mb-3 h-9 w-10" />
              <h2 className="animate-reveal text-balance font-display text-[24px] font-bold uppercase leading-[1.08] text-brand-white [text-shadow:-2px_0_#EE0787,2px_0_#00F0FF] motion-reduce:animate-none">
                ¿Y si te animás a cruzar la puerta?
              </h2>
              <p className="mt-4 animate-stamp bg-brand-yellow px-2 py-1 font-mono text-[11px] tracking-[0.2em] text-brand-black motion-reduce:animate-none">
                FASE 1 COMPLETADA
              </p>
            </div>
          ) : (
            <>
              <div className={breaking ? 'animate-lock-drop motion-reduce:animate-none' : ''}>
                <Padlock forced={forcing} className="h-[88px] w-16" />
              </div>
              <p className="absolute bottom-4 font-mono text-[10px] tracking-[0.3em] text-brand-white/60">
                {forcing ? 'FORZANDO CERRADURA...' : 'ACCESO RESTRINGIDO'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Hazard barrier bolted across the frame */}
      {!revealed && (
        <HazardBarrier
          className="absolute -left-6 -right-6 top-[60%] h-11 -rotate-[5deg]"
          label={forcing ? '⚠ SOBRECARGA ⚠' : 'ACCESO DENEGADO'}
          alarm={breaching}
          breaking={breaking}
        />
      )}

      {breaching && <Sparks className="absolute left-1/2 top-[30%]" />}
      {breaching && <Sparks className="absolute left-[2%] top-[66%] scale-75" />}
      {breaching && <Sparks className="absolute right-[2%] top-[62%] scale-75" />}

      <PixelCursor className="absolute -right-7 bottom-6 w-6 animate-cursor-tap drop-shadow-[2px_2px_0_#EEC324] motion-reduce:animate-none" />
    </section>
  );
};

// ============================================================================
// Phase 2 date drop: tentative 16 / 17 December 2026
// ============================================================================

/** Shortlisted days. When the final day is confirmed, leave one entry here and update public/*.ics. */
const TENTATIVE_DAYS = [16, 17] as const;
const EVENT_YEAR = 2026;
const EVENT_MONTH = 11; // December (0-based)
const HIGHLIGHT_WEEK = { from: 14, to: 20 } as const; // Mon 14 → Sun 20
const ICS_PATH = '/puerta18-muestra26.ics';
const EVENT_TITLE = 'PUERTA 18 · MUESTRA 26 (fecha tentativa)';
const EVENT_DETAILS =
  'Muestra Anual 2026 de Puerta 18. El día definitivo se confirma entre el 16 y el 17 de diciembre: agendá ambos y seguí atento.';

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;

/** Monday-first weeks of the event month; null = padding cell. */
const CALENDAR_WEEKS: (number | null)[][] = (() => {
  const offset = (new Date(EVENT_YEAR, EVENT_MONTH, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(EVENT_YEAR, EVENT_MONTH + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
})();

const yyyymmdd = (day: number) => {
  const d = new Date(EVENT_YEAR, EVENT_MONTH, day);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

/** All-day Google Calendar template link (end date is exclusive). */
const googleCalendarUrl = (day: number): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENT_TITLE,
    dates: `${yyyymmdd(day)}/${yyyymmdd(day + 1)}`,
    details: `${EVENT_DETAILS}\n${window.location.origin}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Corrupt glyphs for the scramble. Mostly ASCII so VT323 keeps every frame the same width.
const SCRAMBLE_GLYPHS = '?!#%&*<>/\\▓01679';
// Characters that never scramble, so the frame of the text stays put.
const SCRAMBLE_KEEP = new Set([' ', '[', ']', '.', '/']);

const randomGlyph = () => SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];

interface DecryptOptions {
  /** How long each value rests before the next scramble. */
  holdMs: number;
  /** Extra wait before the very first scramble (to desync several instances). */
  startDelayMs?: number;
  frameMs?: number;
  frames?: number;
}

/**
 * Cycles through `values`, scrambling into each one and resolving left to right.
 * With a single value it periodically "corrupts" and re-decrypts it (e.g. 16 → 1? → 1▓ → 16).
 * State only changes during the short scramble bursts, so renders stay rare and local.
 * `values` must be a stable (module-level) array.
 */
const useDecrypt = (
  values: readonly string[],
  { holdMs, startDelayMs = 0, frameMs = 55, frames = 6 }: DecryptOptions,
): string => {
  const [text, setText] = useState(values[0]);
  const [reduceMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (reduceMotion) return;
    let timer = 0;
    let index = 0;

    const scrambleTo = (target: string, frame: number) => {
      if (frame >= frames) {
        setText(target);
        timer = window.setTimeout(next, holdMs);
        return;
      }
      const resolved = Math.floor((frame / frames) * target.length);
      setText(
        [...target].map((ch, i) => (i < resolved || SCRAMBLE_KEEP.has(ch) ? ch : randomGlyph())).join(''),
      );
      timer = window.setTimeout(() => scrambleTo(target, frame + 1), frameMs);
    };

    const next = () => {
      index = (index + 1) % values.length;
      scrambleTo(values[index], 0);
    };

    timer = window.setTimeout(next, holdMs + startDelayMs);
    return () => window.clearTimeout(timer);
  }, [values, holdMs, startDelayMs, frameMs, frames, reduceMotion]);

  return text;
};

const DAY_VALUES: Record<number, readonly string[]> = Object.fromEntries(
  TENTATIVE_DAYS.map((d) => [d, [String(d)]]),
);
const HEADLINE_VALUES = TENTATIVE_DAYS.map((d) => `[ ${d}.12 ]`);

interface TentativeDayProps {
  day: number;
  /** Which half of the alternating highlight cycle this cell lights up in. */
  phase: 0 | 1;
}

/** Calendar cell for a shortlisted day: alternating glow, jitter and periodic corruption. */
const TentativeDay = ({ day, phase }: TentativeDayProps) => {
  const text = useDecrypt(DAY_VALUES[day], { holdMs: 1100, startDelayMs: phase * 550, frames: 5 });
  return (
    <span
      className={`relative z-10 inline-block animate-day-alt font-pixel text-[26px] leading-none text-brand-white motion-reduce:animate-none ${
        phase === 1 ? '[animation-delay:-1s]' : ''
      }`}
    >
      <span className="inline-block min-w-[2ch] animate-jitter text-center motion-reduce:animate-none">{text}</span>
    </span>
  );
};

/** Rough yellow spray loop circling the two shortlisted days, with drips. */
const SprayLoop = ({ className = '' }: ClassNameProps) => {
  const id = useId();
  return (
    <span className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="h-full w-full animate-pulse-slow overflow-visible motion-reduce:animate-none">
        <defs>
          <SprayFilter id={id} />
        </defs>
        <path
          d="M10 14C26 2 74 0 90 12c10 9 6 24-14 30-22 6-52 6-66-4C-2 30 0 18 16 10"
          className="fill-none stroke-brand-yellow"
          strokeWidth={3.2}
          strokeLinecap="round"
          filter={`url(#${id})`}
        />
      </svg>
      <span className="absolute left-[30%] top-[92%] h-5 w-[3px] origin-top animate-drip rounded-b-full bg-brand-yellow motion-reduce:animate-none" />
      <span className="absolute left-[64%] top-[90%] h-8 w-[3px] origin-top animate-drip rounded-b-full bg-brand-yellow [animation-delay:1.2s] motion-reduce:animate-none" />
    </span>
  );
};

const CalendarCard = () => {
  const [first, second] = TENTATIVE_DAYS;
  return (
    <div className="relative -rotate-1 border-2 border-brand-white bg-brand-black px-3 pb-5 pt-7">
      <DuctTape className="absolute -top-3.5 left-1/2 h-7 w-44 -translate-x-1/2 rotate-2" label="AGENDÁ · DIC 26" />
      <Screw className="absolute bottom-1.5 left-1.5" />
      <Screw className="absolute bottom-1.5 right-1.5 rotate-45" />

      <div className="flex items-end justify-between">
        <h3 id="fecha-titulo" className="font-display text-[30px] font-bold uppercase leading-none text-brand-white">
          Diciembre
        </h3>
        <span className="font-pixel text-[30px] leading-none text-brand-yellow">{EVENT_YEAR}</span>
      </div>
      <div className="my-2 h-px bg-brand-white/60" />

      <div className="grid grid-cols-7 pb-1 text-center font-mono text-[10px] tracking-widest text-brand-white/50">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {CALENDAR_WEEKS.map((week, w) => {
        const isEventWeek = week.includes(HIGHLIGHT_WEEK.from) && week.includes(HIGHLIGHT_WEEK.to);
        const cells = week.map((day, i) => {
          const tentative = day === first || day === second;
          return (
            <span key={i} className="flex h-9 items-center justify-center">
              {day === null ? null : tentative ? (
                <TentativeDay day={day} phase={day === first ? 0 : 1} />
              ) : (
                <span
                  className={`font-pixel text-[20px] leading-none ${isEventWeek ? 'text-brand-white/80' : 'text-brand-white/35'}`}
                >
                  {day}
                </span>
              )}
            </span>
          );
        });

        if (!isEventWeek) {
          return (
            <div key={w} className="grid grid-cols-7">
              {cells}
            </div>
          );
        }

        // Event week: hazard-striped frame with a dim violet wash, plus the spray loop on 16-17.
        const firstCol = week.indexOf(first);
        return (
          <div key={w} className="my-1 bg-hazard p-[3px]">
            <div className="relative grid grid-cols-7 bg-brand-black">
              <div className="pointer-events-none absolute inset-0 bg-brand-violet/20" aria-hidden="true" />
              {cells}
              {/* Wed 16 + Thu 17 = columns 3-4 (28.6%-57.1%); the loop overshoots them a little. */}
              {firstCol === 2 && <SprayLoop className="-inset-y-2 left-[25%] w-[35%]" />}
            </div>
          </div>
        );
      })}

      <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] text-brand-white/60">
        SEMANA {HIGHLIGHT_WEEK.from}—{HIGHLIGHT_WEEK.to} · <span className="text-brand-yellow">{first} Ó {second}</span>
      </p>
    </div>
  );
};

/** Scramble headline [ 16.12 ] ⇄ [ 17.12 ] plus the sliced "16 // 17" line and status tags. */
const DecrypterBanner = () => {
  const headline = useDecrypt(HEADLINE_VALUES, { holdMs: 1000 });
  const [first, second] = TENTATIVE_DAYS;
  return (
    <div className="mt-7 text-center">
      <p className="sr-only">
        Fecha tentativa: {first} o {second} de diciembre de {EVENT_YEAR}.
      </p>
      <p
        aria-hidden="true"
        className="animate-aberration-yv whitespace-pre font-pixel text-[clamp(52px,16vw,66px)] leading-none text-brand-yellow motion-reduce:animate-none"
      >
        {headline}
      </p>

      <div className="relative mx-auto mt-2 w-fit overflow-hidden px-1" aria-hidden="true">
        <GlitchText
          tone="brand"
          text={`${first} // ${second} DE DICIEMBRE`}
          className="font-display text-[26px] font-bold uppercase leading-tight text-brand-white"
        />
        {/* Scanline bars slicing through the line */}
        <span className="pointer-events-none absolute inset-x-0 h-[3px] animate-slice-bar bg-brand-black motion-reduce:hidden" />
        <span className="pointer-events-none absolute inset-x-0 h-[2px] animate-slice-bar bg-brand-violet/80 [animation-delay:-0.9s] motion-reduce:hidden" />
      </div>

      <p className="mx-auto mt-3 w-fit max-w-full border border-brand-yellow/70 px-2 py-1 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-brand-yellow">
        [ ESTADO: SELECCIONANDO DÍA DEFINITIVO // CALIBRANDO NODO ]
        <span className="ml-1 inline-block h-2.5 w-1.5 translate-y-0.5 animate-blink bg-brand-yellow" />
      </p>
      <p className="mt-2 font-mono text-[11px] tracking-[0.15em] text-brand-white/60">Puerta 18 · Muestra Anual 2026</p>
    </div>
  );
};

const AgendarActions = () => (
  <div className="mt-6 flex flex-col gap-2.5">
    {/* .ics with both days: iOS opens the "Add to Calendar" sheet; Android/desktop import it. */}
    <a
      href={ICS_PATH}
      className="block bg-brand-yellow py-3.5 text-center font-mono text-[15px] tracking-[0.18em] text-brand-black shadow-[4px_4px_0_#9207EA] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#9207EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-white"
    >
      [ AGENDAR AMBAS FECHAS ]
      <span className="block text-[9px] tracking-[0.25em] text-brand-black/70">ARCHIVO .ICS · CUALQUIER CALENDARIO</span>
    </a>
    <div className="grid grid-cols-2 gap-2.5">
      {TENTATIVE_DAYS.map((day) => (
        <a
          key={day}
          href={googleCalendarUrl(day)}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-2 border-brand-white py-2.5 text-center font-mono text-xs tracking-[0.18em] text-brand-white active:bg-brand-white active:text-brand-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          [ AGENDAR {day} ]
          <span className="block text-[9px] tracking-[0.2em] opacity-60">GOOGLE CALENDAR</span>
        </a>
      ))}
    </div>
  </div>
);

const DateDrop = () => (
  <section aria-labelledby="fecha-titulo" className="mt-2 animate-fade-up motion-reduce:animate-none">
    <p className="mb-6 animate-blink text-center font-mono text-[10px] tracking-[0.3em] text-brand-yellow motion-reduce:animate-none">
      ▼ FECHA DESENCRIPTADA ▼
    </p>
    <CalendarCard />
    <DecrypterBanner />
    <AgendarActions />
  </section>
);

interface FooterProps {
  dateRevealed: boolean;
}

const Footer = ({ dateRevealed }: FooterProps) => (
  <footer className="relative mt-auto flex items-end justify-between pt-2">
    <SpraySplat fill="fill-brand-pink" className="pointer-events-none absolute -bottom-3 -left-5 h-24 w-24 opacity-90" />
    <p className="relative -rotate-6 font-marker text-[32px] leading-[0.9] text-brand-yellow">
      PUERTA
      <span className="block pl-16">18</span>
    </p>
    <p className="text-right font-mono text-[10px] leading-relaxed tracking-[0.22em] text-brand-white/60">
      MUESTRA 26
      <br />
      FECHA:{' '}
      {dateRevealed ? (
        <span className="text-brand-yellow">{TENTATIVE_DAYS.join('/')}.12</span>
      ) : (
        <span className="bg-brand-white/80 px-1 text-brand-black">██████</span>
      )}
    </p>
  </footer>
);

// ============================================================================
// Dev tools (never in production builds)
// ============================================================================

/**
 * Compile-time flag: true under `npm run dev`, or on a deploy built with VITE_DEV_TOOLS=true
 * (e.g. a Vercel Preview env var). Otherwise Vite inlines `false` and the panel is dropped
 * from the bundle, so visitors can't unlock the reveal early.
 */
const SHOW_DEV_TOOLS = import.meta.env.DEV || import.meta.env.VITE_DEV_TOOLS === 'true';

interface DevToolsProps {
  active: boolean;
  onSimulate: () => void;
  onReset: () => void;
}

/** Faint corner panel to force Phase 2 locally. Touches React state only, never the API/DB. */
const DevTools = ({ active, onSimulate, onReset }: DevToolsProps) => (
  <div className="fixed bottom-2 right-2 z-[60] flex items-center gap-2 font-mono text-[10px] text-brand-white opacity-20 transition-opacity hover:opacity-100 focus-within:opacity-100">
    {active && <span className="animate-blink text-brand-yellow">● DEV</span>}
    <button
      type="button"
      onClick={onSimulate}
      className="border border-brand-white/60 bg-brand-black px-1.5 py-1 tracking-widest hover:border-brand-yellow hover:text-brand-yellow"
    >
      [ SIMULAR 15 ]
    </button>
    <button
      type="button"
      onClick={onReset}
      className="border border-brand-white/60 bg-brand-black px-1.5 py-1 tracking-widest hover:border-brand-yellow hover:text-brand-yellow"
    >
      [ RESET UI ]
    </button>
  </div>
);

const SIMULATED_STATUS: StatusResponse = { currentScans: FALLBACK_TARGET, target: FALLBACK_TARGET, isOverloaded: true };

// ============================================================================
// App
// ============================================================================

const App = () => {
  const { status, offline, visitor } = useCommunityStatus();
  const [devOverride, setDevOverride] = useState(false);

  // Everything below renders from these display values, never from the raw API state,
  // so the dev override drives the whole Phase 1 → Phase 2 flow. (The board reads the
  // scan count from `displayStatus`, so a simulated run shows [ 15 / 15 ].)
  const displayStatus = devOverride ? SIMULATED_STATUS : status;
  const displayOverloaded = displayStatus?.isOverloaded ?? false;

  const step = useBreachSequence(displayOverloaded);
  const breaching = step === 'breaching';

  const signal: StatusBarProps['signal'] = displayOverloaded
    ? 'overload'
    : offline
      ? 'lost'
      : displayStatus
        ? 'live'
        : 'linking';

  return (
    <main className="relative min-h-dvh overflow-hidden bg-brand-black text-brand-white">
      {/* Background: violet top glow + grainy starburst (dominant colour, ~60%) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-80 bg-top-glow" />
        <Starburst className="absolute -right-20 top-16 w-64 animate-spin-slow opacity-80 motion-reduce:animate-none" />
      </div>

      {/* Outer layer shakes / flickers; inner layer carries the inherited RGB-split text-shadow. */}
      <div
        className={`relative z-10 mx-auto w-full max-w-[430px] ${
          breaching ? 'animate-shake' : 'animate-flicker'
        } motion-reduce:animate-none`}
      >
        <div
          className={`flex min-h-dvh flex-col gap-4 px-4 pb-4 pt-4 ${
            breaching ? 'animate-aberration motion-reduce:animate-none' : ''
          }`}
        >
          <StatusBar signal={signal} />
          <div className="h-px w-full bg-brand-white/80" />
          <Manifesto breaching={breaching} />
          <CommunityBoard
            status={displayStatus}
            offline={offline && !devOverride}
            visitor={visitor}
            alarm={displayOverloaded}
          />
          <MysteryDoor step={step} />
          {step === 'revealed' && <DateDrop />}
          <Footer dateRevealed={step === 'revealed'} />
        </div>
      </div>

      {breaching && (
        <div
          className="pointer-events-none fixed inset-0 z-40 animate-flash bg-brand-white"
          aria-hidden="true"
        />
      )}

      <CrtOverlay />

      {SHOW_DEV_TOOLS && (
        <DevTools active={devOverride} onSimulate={() => setDevOverride(true)} onReset={() => setDevOverride(false)} />
      )}

      <p className="sr-only" aria-live="assertive">
        {step === 'revealed'
          ? `¿Y si te animás a cruzar la puerta? Fase 1 completada. Fecha tentativa: ${TENTATIVE_DAYS.join(' o ')} de diciembre.`
          : ''}
      </p>
    </main>
  );
};

export default App;
