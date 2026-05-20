"use client";

import { motion } from "framer-motion";

interface BadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

// ---------------------------------------------------------------------------
// Individual SVG badge components — each is a unique shape with inner detail,
// a center symbol, ribbon/banner, and metallic gradient fills.
// Locked variants show a greyed-out version with a lock icon.
// ---------------------------------------------------------------------------

function FirstFireBadge({ locked, id }: { locked?: boolean; id: string }) {
  const gf = `${id}-gf`;
  const gs = `${id}-gs`;
  const gr = `${id}-gr`;
  const fl = `${id}-fl`;
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gf} x1="60" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id={gs} x1="30" y1="10" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.35" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gr} x1="20" y1="110" x2="100" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C2410C" />
          <stop offset="0.5" stopColor="#EA580C" />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
        <filter id={fl}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Circle medal shape */}
      <circle cx="60" cy="56" r="50" fill={locked ? "#D6D3D1" : `url(#${gf})`} stroke={locked ? "#A8A29E" : "#C2410C"} strokeWidth="3" />
      <circle cx="60" cy="56" r="44" fill="none" stroke={locked ? "#A8A29E" : "rgba(255,255,255,0.25)"} strokeWidth="1.5" strokeDasharray="4 3" />
      {!locked && <circle cx="60" cy="56" r="50" fill={`url(#${gs})`} />}
      {/* Inner decorative ring */}
      <circle cx="60" cy="56" r="38" fill="none" stroke={locked ? "#BFBBB7" : "rgba(255,255,255,0.2)"} strokeWidth="1" />
      {/* Flame icon or lock */}
      {locked ? (
        <g transform="translate(60,56)">
          <rect x="-8" y="-4" width="16" height="12" rx="2" fill="#A8A29E" />
          <path d="M-4,-4 L-4,-8 A4,4 0 0,1 4,-8 L4,-4" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="2" r="2" fill="#D6D3D1" />
        </g>
      ) : (
        <g transform="translate(60,56)" filter={`url(#${fl})`}>
          <path d="M0,-22 C6,-14 16,-8 16,4 C16,14 10,20 0,22 C-10,20 -16,14 -16,4 C-16,-8 -6,-14 0,-22Z" fill="#FDE68A" opacity="0.6" />
          <path d="M0,-16 C4,-10 12,-4 12,4 C12,11 7,16 0,18 C-7,16 -12,11 -12,4 C-12,-4 -4,-10 0,-16Z" fill="#FBBF24" />
          <path d="M0,-10 C3,-5 7,0 7,6 C7,10 4,13 0,14 C-4,13 -7,10 -7,6 C-7,0 -3,-5 0,-10Z" fill="white" opacity="0.7" />
        </g>
      )}
      {/* Ribbon banner */}
      <path d="M14,102 L26,96 L94,96 L106,102 L94,108 L26,108 Z" fill={locked ? "#BFBBB7" : `url(#${gr})`} />
      <path d="M14,102 L26,96 L26,108 Z" fill={locked ? "#A8A29E" : "#9A3412"} />
      <path d="M106,102 L94,96 L94,108 Z" fill={locked ? "#A8A29E" : "#9A3412"} />
      <text x="60" y="105" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">
        FIRST FIRE
      </text>
    </svg>
  );
}

function WeekWarriorBadge({ locked, id }: { locked?: boolean; id: string }) {
  const gf = `${id}-gf`;
  const gs = `${id}-gs`;
  const gr = `${id}-gr`;
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gf} x1="60" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id={gs} x1="30" y1="5" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.3" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gr} x1="20" y1="114" x2="100" y2="114" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E40AF" />
          <stop offset="0.5" stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      {/* Shield shape */}
      <path
        d="M60,6 L104,24 L104,62 C104,86 84,104 60,112 C36,104 16,86 16,62 L16,24 Z"
        fill={locked ? "#D6D3D1" : `url(#${gf})`}
        stroke={locked ? "#A8A29E" : "#1D4ED8"}
        strokeWidth="3"
      />
      {!locked && (
        <path d="M60,6 L104,24 L104,62 C104,86 84,104 60,112 C36,104 16,86 16,62 L16,24 Z" fill={`url(#${gs})`} />
      )}
      {/* Inner shield outline */}
      <path
        d="M60,14 L96,30 L96,62 C96,82 79,97 60,104 C41,97 24,82 24,62 L24,30 Z"
        fill="none"
        stroke={locked ? "#BFBBB7" : "rgba(255,255,255,0.25)"}
        strokeWidth="1.5"
      />
      {/* Crossed swords or lock */}
      {locked ? (
        <g transform="translate(60,58)">
          <rect x="-8" y="-4" width="16" height="12" rx="2" fill="#A8A29E" />
          <path d="M-4,-4 L-4,-8 A4,4 0 0,1 4,-8 L4,-4" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="2" r="2" fill="#D6D3D1" />
        </g>
      ) : (
        <g transform="translate(60,56)">
          <line x1="-14" y1="14" x2="14" y2="-14" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="14" y1="14" x2="-14" y2="-14" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <polygon points="-14,-14 -18,-20 -10,-18" fill="white" />
          <polygon points="14,-14 18,-20 10,-18" fill="white" />
          <circle cx="0" cy="0" r="4" fill="white" opacity="0.9" />
          <line x1="-16" y1="16" x2="-12" y2="12" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <line x1="16" y1="16" x2="12" y2="12" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {/* Ribbon */}
      <path d="M14,118 L26,112 L94,112 L106,118 L94,124 L26,124 Z" fill={locked ? "#BFBBB7" : `url(#${gr})`} />
      <path d="M14,118 L26,112 L26,124 Z" fill={locked ? "#A8A29E" : "#1E3A8A"} />
      <path d="M106,118 L94,112 L94,124 Z" fill={locked ? "#A8A29E" : "#1E3A8A"} />
      <text x="60" y="121" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">
        WEEK WARRIOR
      </text>
    </svg>
  );
}

function FortnightForceBadge({ locked, id }: { locked?: boolean; id: string }) {
  const gf = `${id}-gf`;
  const gs = `${id}-gs`;
  const gr = `${id}-gr`;
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gf} x1="60" y1="0" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C084FC" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={gs} x1="30" y1="5" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.3" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gr} x1="20" y1="114" x2="100" y2="114" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B21B6" />
          <stop offset="0.5" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
      {/* Hexagon shape */}
      <polygon
        points="60,4 108,30 108,82 60,108 12,82 12,30"
        fill={locked ? "#D6D3D1" : `url(#${gf})`}
        stroke={locked ? "#A8A29E" : "#6D28D9"}
        strokeWidth="3"
      />
      {!locked && <polygon points="60,4 108,30 108,82 60,108 12,82 12,30" fill={`url(#${gs})`} />}
      {/* Inner hex outline */}
      <polygon
        points="60,14 98,36 98,76 60,98 22,76 22,36"
        fill="none"
        stroke={locked ? "#BFBBB7" : "rgba(255,255,255,0.2)"}
        strokeWidth="1.5"
      />
      {/* Lightning bolt or lock */}
      {locked ? (
        <g transform="translate(60,56)">
          <rect x="-8" y="-4" width="16" height="12" rx="2" fill="#A8A29E" />
          <path d="M-4,-4 L-4,-8 A4,4 0 0,1 4,-8 L4,-4" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="2" r="2" fill="#D6D3D1" />
        </g>
      ) : (
        <g transform="translate(60,56)">
          <path d="M4,-22 L-8,0 L2,0 L-4,22 L14,-2 L4,-2 Z" fill="white" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
          <circle cx="-14" cy="-8" r="1.5" fill="white" opacity="0.6" />
          <circle cx="14" cy="6" r="1.5" fill="white" opacity="0.6" />
          <circle cx="-10" cy="10" r="1" fill="white" opacity="0.4" />
        </g>
      )}
      {/* Ribbon */}
      <path d="M14,114 L26,108 L94,108 L106,114 L94,120 L26,120 Z" fill={locked ? "#BFBBB7" : `url(#${gr})`} />
      <path d="M14,114 L26,108 L26,120 Z" fill={locked ? "#A8A29E" : "#4C1D95"} />
      <path d="M106,114 L94,108 L94,120 Z" fill={locked ? "#A8A29E" : "#4C1D95"} />
      <text x="60" y="117" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700" fontFamily="system-ui, sans-serif">
        FORTNIGHT FORCE
      </text>
    </svg>
  );
}

function IronWillBadge({ locked, id }: { locked?: boolean; id: string }) {
  const gf = `${id}-gf`;
  const gs = `${id}-gs`;
  const gr = `${id}-gr`;
  const fl = `${id}-fl`;
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gf} x1="60" y1="0" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCD34D" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id={gs} x1="30" y1="5" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gr} x1="20" y1="118" x2="100" y2="118" gradientUnits="userSpaceOnUse">
          <stop stopColor="#92400E" />
          <stop offset="0.5" stopColor="#B45309" />
          <stop offset="1" stopColor="#92400E" />
        </linearGradient>
        <filter id={fl}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Star-burst shape (6-pointed) */}
      <polygon
        points="60,4 72,34 104,28 82,52 104,76 72,70 60,100 48,70 16,76 38,52 16,28 48,34"
        fill={locked ? "#D6D3D1" : `url(#${gf})`}
        stroke={locked ? "#A8A29E" : "#B45309"}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {!locked && (
        <polygon
          points="60,4 72,34 104,28 82,52 104,76 72,70 60,100 48,70 16,76 38,52 16,28 48,34"
          fill={`url(#${gs})`}
        />
      )}
      {/* Inner circle */}
      <circle cx="60" cy="52" r="24" fill="none" stroke={locked ? "#BFBBB7" : "rgba(255,255,255,0.3)"} strokeWidth="1.5" />
      {/* Star symbol or lock */}
      {locked ? (
        <g transform="translate(60,52)">
          <rect x="-8" y="-4" width="16" height="12" rx="2" fill="#A8A29E" />
          <path d="M-4,-4 L-4,-8 A4,4 0 0,1 4,-8 L4,-4" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="2" r="2" fill="#D6D3D1" />
        </g>
      ) : (
        <g transform="translate(60,52)" filter={`url(#${fl})`}>
          <polygon points="0,-16 4,-6 14,-6 6,2 9,12 0,6 -9,12 -6,2 -14,-6 -4,-6" fill="white" />
        </g>
      )}
      {/* Ribbon */}
      <path d="M14,118 L26,112 L94,112 L106,118 L94,124 L26,124 Z" fill={locked ? "#BFBBB7" : `url(#${gr})`} />
      <path d="M14,118 L26,112 L26,124 Z" fill={locked ? "#A8A29E" : "#78350F"} />
      <path d="M106,118 L94,112 L94,124 Z" fill={locked ? "#A8A29E" : "#78350F"} />
      <text x="60" y="121" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">
        IRON WILL
      </text>
    </svg>
  );
}

function UnbreakableBadge({ locked, id }: { locked?: boolean; id: string }) {
  const gf = `${id}-gf`;
  const gs = `${id}-gs`;
  const gr = `${id}-gr`;
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gf} x1="60" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={gs} x1="30" y1="5" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.35" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gr} x1="20" y1="118" x2="100" y2="118" gradientUnits="userSpaceOnUse">
          <stop stopColor="#065F46" />
          <stop offset="0.5" stopColor="#047857" />
          <stop offset="1" stopColor="#065F46" />
        </linearGradient>
      </defs>
      {/* Rounded crest shape */}
      <path
        d="M60,6 C28,6 10,24 10,48 L10,64 C10,90 32,108 60,108 C88,108 110,90 110,64 L110,48 C110,24 92,6 60,6Z"
        fill={locked ? "#D6D3D1" : `url(#${gf})`}
        stroke={locked ? "#A8A29E" : "#047857"}
        strokeWidth="3"
      />
      {!locked && (
        <path
          d="M60,6 C28,6 10,24 10,48 L10,64 C10,90 32,108 60,108 C88,108 110,90 110,64 L110,48 C110,24 92,6 60,6Z"
          fill={`url(#${gs})`}
        />
      )}
      {/* Inner decorative border */}
      <path
        d="M60,16 C34,16 20,30 20,50 L20,62 C20,84 38,98 60,98 C82,98 100,84 100,62 L100,50 C100,30 86,16 60,16Z"
        fill="none"
        stroke={locked ? "#BFBBB7" : "rgba(255,255,255,0.2)"}
        strokeWidth="1.5"
      />
      {/* Laurel wreath arcs */}
      {!locked && (
        <g opacity="0.3">
          <path d="M34,78 C30,68 30,52 38,40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M86,78 C90,68 90,52 82,40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="44" r="2" fill="white" />
          <circle cx="84" cy="44" r="2" fill="white" />
          <circle cx="32" cy="56" r="2" fill="white" />
          <circle cx="88" cy="56" r="2" fill="white" />
          <circle cx="33" cy="68" r="2" fill="white" />
          <circle cx="87" cy="68" r="2" fill="white" />
        </g>
      )}
      {/* Trophy icon or lock */}
      {locked ? (
        <g transform="translate(60,56)">
          <rect x="-8" y="-4" width="16" height="12" rx="2" fill="#A8A29E" />
          <path d="M-4,-4 L-4,-8 A4,4 0 0,1 4,-8 L4,-4" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="2" r="2" fill="#D6D3D1" />
        </g>
      ) : (
        <g transform="translate(60,54)">
          <path d="M-12,-16 L-10,4 C-10,10 -6,14 0,14 C6,14 10,10 10,4 L12,-16 Z" fill="white" opacity="0.95" />
          <path d="M-12,-12 C-20,-10 -20,0 -12,2" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M12,-12 C20,-10 20,0 12,2" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="-6" y="14" width="12" height="3" rx="1" fill="white" opacity="0.9" />
          <rect x="-8" y="17" width="16" height="3" rx="1" fill="white" opacity="0.85" />
          <polygon points="0,-8 2,-3 7,-3 3,1 4,6 0,3 -4,6 -3,1 -7,-3 -2,-3" fill="#059669" transform="scale(0.6)" />
        </g>
      )}
      {/* Ribbon */}
      <path d="M14,118 L26,112 L94,112 L106,118 L94,124 L26,124 Z" fill={locked ? "#BFBBB7" : `url(#${gr})`} />
      <path d="M14,118 L26,112 L26,124 Z" fill={locked ? "#A8A29E" : "#064E3B"} />
      <path d="M106,118 L94,112 L94,124 Z" fill={locked ? "#A8A29E" : "#064E3B"} />
      <text x="60" y="121" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">
        UNBREAKABLE
      </text>
    </svg>
  );
}

function DiamondHandsBadge({ locked, id }: { locked?: boolean; id: string }) {
  const gf = `${id}-gf`;
  const gs = `${id}-gs`;
  const gr = `${id}-gr`;
  const gg = `${id}-gg`;
  const fl = `${id}-fl`;
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gf} x1="60" y1="0" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="0.5" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id={gs} x1="30" y1="5" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gr} x1="20" y1="118" x2="100" y2="118" gradientUnits="userSpaceOnUse">
          <stop stopColor="#155E75" />
          <stop offset="0.5" stopColor="#0E7490" />
          <stop offset="1" stopColor="#155E75" />
        </linearGradient>
        <linearGradient id={gg} x1="50" y1="30" x2="70" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0.7" />
        </linearGradient>
        <filter id={fl}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Gem-cut / angular shape */}
      <polygon
        points="60,4 108,36 98,76 60,108 22,76 12,36"
        fill={locked ? "#D6D3D1" : `url(#${gf})`}
        stroke={locked ? "#A8A29E" : "#0891B2"}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {!locked && <polygon points="60,4 108,36 98,76 60,108 22,76 12,36" fill={`url(#${gs})`} />}
      {/* Facet lines */}
      {!locked && (
        <g stroke="rgba(255,255,255,0.15)" strokeWidth="1">
          <line x1="60" y1="4" x2="60" y2="108" />
          <line x1="12" y1="36" x2="98" y2="76" />
          <line x1="108" y1="36" x2="22" y2="76" />
        </g>
      )}
      {/* Inner border */}
      <polygon
        points="60,16 98,42 90,74 60,98 30,74 22,42"
        fill="none"
        stroke={locked ? "#BFBBB7" : "rgba(255,255,255,0.2)"}
        strokeWidth="1.5"
      />
      {/* Diamond gem icon or lock */}
      {locked ? (
        <g transform="translate(60,56)">
          <rect x="-8" y="-4" width="16" height="12" rx="2" fill="#A8A29E" />
          <path d="M-4,-4 L-4,-8 A4,4 0 0,1 4,-8 L4,-4" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="2" r="2" fill="#D6D3D1" />
        </g>
      ) : (
        <g transform="translate(60,54)" filter={`url(#${fl})`}>
          <polygon points="-16,-8 -10,-16 10,-16 16,-8 0,16" fill={`url(#${gg})`} />
          <line x1="-10" y1="-16" x2="-4" y2="-8" stroke="#0891B2" strokeWidth="0.8" opacity="0.5" />
          <line x1="10" y1="-16" x2="4" y2="-8" stroke="#0891B2" strokeWidth="0.8" opacity="0.5" />
          <line x1="-16" y1="-8" x2="16" y2="-8" stroke="#0891B2" strokeWidth="0.8" opacity="0.5" />
          <line x1="-4" y1="-8" x2="0" y2="16" stroke="#0891B2" strokeWidth="0.6" opacity="0.4" />
          <line x1="4" y1="-8" x2="0" y2="16" stroke="#0891B2" strokeWidth="0.6" opacity="0.4" />
          <circle cx="-18" cy="-14" r="1.5" fill="white" opacity="0.7" />
          <circle cx="18" cy="-4" r="1" fill="white" opacity="0.5" />
          <circle cx="-12" cy="8" r="1" fill="white" opacity="0.4" />
        </g>
      )}
      {/* Ribbon */}
      <path d="M14,118 L26,112 L94,112 L106,118 L94,124 L26,124 Z" fill={locked ? "#BFBBB7" : `url(#${gr})`} />
      <path d="M14,118 L26,112 L26,124 Z" fill={locked ? "#A8A29E" : "#134E4A"} />
      <path d="M106,118 L94,112 L94,124 Z" fill={locked ? "#A8A29E" : "#134E4A"} />
      <text x="60" y="121" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700" fontFamily="system-ui, sans-serif">
        DIAMOND HANDS
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Badge configuration — maps each tier to its SVG component and colors
// for the progress bar.
// ---------------------------------------------------------------------------

type BadgeSVGComponent = React.FC<{ locked?: boolean; id: string }>;

interface BadgeDef {
  min: number;
  label: string;
  BadgeSVG: BadgeSVGComponent;
  gradientFrom: string;
  gradientTo: string;
}

const BADGES: BadgeDef[] = [
  { min: 3, label: "First Fire", BadgeSVG: FirstFireBadge, gradientFrom: "#FB923C", gradientTo: "#EA580C" },
  { min: 7, label: "Week Warrior", BadgeSVG: WeekWarriorBadge, gradientFrom: "#60A5FA", gradientTo: "#2563EB" },
  { min: 14, label: "Fortnight Force", BadgeSVG: FortnightForceBadge, gradientFrom: "#C084FC", gradientTo: "#7C3AED" },
  { min: 21, label: "Iron Will", BadgeSVG: IronWillBadge, gradientFrom: "#FCD34D", gradientTo: "#D97706" },
  { min: 30, label: "Unbreakable", BadgeSVG: UnbreakableBadge, gradientFrom: "#34D399", gradientTo: "#059669" },
  { min: 42, label: "Diamond Hands", BadgeSVG: DiamondHandsBadge, gradientFrom: "#67E8F9", gradientTo: "#0891B2" },
];

// ---------------------------------------------------------------------------
// Public helpers — same API as before
// ---------------------------------------------------------------------------

export function getEarnedBadges(streak: number) {
  return BADGES.filter((b) => streak >= b.min);
}

export function getNextBadge(streak: number) {
  return BADGES.find((b) => streak < b.min);
}

// ---------------------------------------------------------------------------
// StreakBadge — shows the highest earned badge
// ---------------------------------------------------------------------------

const sizeMap = {
  sm: "w-14 h-[4.25rem]",
  md: "w-20 h-24",
  lg: "w-32 h-[9.5rem]",
};

export default function StreakBadge({ streak, size = "md" }: BadgeProps) {
  const earned = getEarnedBadges(streak);
  const highest = earned[earned.length - 1];

  if (!highest) return null;

  const { BadgeSVG } = highest;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`relative group cursor-default ${sizeMap[size]}`}
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10 overflow-hidden rounded-lg">
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-12 group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
      </div>

      <div className={sizeMap[size]}>
        <BadgeSVG id={`streak-main-${highest.min}`} />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// BadgeCollection — shows all badges with progress bar to next tier
// ---------------------------------------------------------------------------

export function BadgeCollection({ streak }: { streak: number }) {
  const earned = getEarnedBadges(streak);
  const next = getNextBadge(streak);

  const highestEarned = earned[earned.length - 1];
  const barFrom = highestEarned?.gradientFrom ?? "#FB923C";
  const barTo = highestEarned?.gradientTo ?? "#EA580C";

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-3 flex-wrap">
        {/* Earned badges */}
        {earned.map((badge, i) => (
          <motion.div
            key={badge.min}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.08, y: -4 }}
            className="relative group cursor-default w-16 h-[4.75rem]"
          >
            {/* Hover shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10 overflow-hidden rounded-lg">
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-12 group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
            </div>

            <badge.BadgeSVG id={`badge-earned-${badge.min}`} />

            {/* Tooltip */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 pointer-events-none">
              <span className="text-[10px] font-bold bg-stone-800 text-white px-2 py-1 rounded-md shadow-lg">
                {badge.label}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Locked badges */}
        {BADGES.filter((b) => streak < b.min).map((badge) => (
          <div
            key={badge.min}
            className="relative group cursor-default w-16 h-[4.75rem] opacity-50 grayscale hover:opacity-60 transition-opacity"
          >
            <badge.BadgeSVG locked id={`badge-locked-${badge.min}`} />

            {/* Tooltip */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 pointer-events-none">
              <span className="text-[10px] font-bold bg-stone-800 text-white px-2 py-1 rounded-md shadow-lg">
                {badge.min} days
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar to next badge */}
      {next && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${barFrom}, ${barTo})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(streak / next.min) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-stone-500 font-semibold whitespace-nowrap">
            {streak}/{next.min} to {next.label}
          </span>
        </div>
      )}
    </div>
  );
}
