import type { SVGProps } from "react";

/**
 * Lightweight decorative marketplace artwork.
 *
 * This is public-safe product illustration only. It does not represent a real
 * provider, premises, verified location or private coordinate.
 */
export function DirektNeighbourhoodIllustration({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 420 300"
      {...props}
    >
      <defs>
        <linearGradient id="direkt-sky" x1="34" y1="22" x2="378" y2="282">
          <stop stopColor="#EFF4FF" />
          <stop offset="0.5" stopColor="#FFF7F0" />
          <stop offset="1" stopColor="#F1ECFF" />
        </linearGradient>
        <linearGradient id="direkt-ground" x1="54" y1="238" x2="378" y2="282">
          <stop stopColor="#FFF0A8" />
          <stop offset="0.55" stopColor="#E7F7C8" />
          <stop offset="1" stopColor="#BFF4E7" />
        </linearGradient>
        <linearGradient id="direkt-roof" x1="169" y1="154" x2="289" y2="221">
          <stop stopColor="#0A8CF5" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="direkt-pin" x1="329" y1="101" x2="378" y2="185">
          <stop stopColor="#FF8A31" />
          <stop offset="1" stopColor="#F04438" />
        </linearGradient>
        <filter id="direkt-soft-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#183B85" floodOpacity="0.13" />
        </filter>
      </defs>

      <rect width="420" height="300" rx="38" fill="url(#direkt-sky)" opacity="0.7" />

      <g opacity="0.78">
        <path d="M58 83c12-19 38-19 49 0 13-13 37-7 42 11H43c2-7 7-10 15-11Z" fill="#FFD9C7" />
        <path d="M258 48c10-18 35-19 46-2 13-10 34-3 37 13h-99c3-7 8-10 16-11Z" fill="#DCD7FF" />
      </g>

      <g opacity="0.72">
        <rect x="91" y="112" width="42" height="100" rx="7" fill="#FFB778" />
        <rect x="135" y="96" width="50" height="116" rx="8" fill="#83B9FF" />
        <rect x="187" y="66" width="50" height="146" rx="8" fill="#C783F7" />
        <rect x="240" y="104" width="38" height="108" rx="7" fill="#A990F7" />
        {[108, 124, 140, 156, 172].map((y) => (
          <g key={y} fill="#FFF" opacity="0.88">
            <rect x="102" y={y} width="7" height="10" rx="2" />
            <rect x="116" y={y} width="7" height="10" rx="2" />
            <rect x="148" y={y - 18} width="8" height="11" rx="2" />
            <rect x="165" y={y - 18} width="8" height="11" rx="2" />
            <rect x="201" y={y - 46} width="8" height="11" rx="2" />
            <rect x="218" y={y - 46} width="8" height="11" rx="2" />
          </g>
        ))}
      </g>

      <ellipse cx="214" cy="246" rx="177" ry="42" fill="url(#direkt-ground)" />
      <path d="M178 231c55 1 98 12 120 35-55-4-104 6-142 29h-55c31-30 57-50 77-64Z" fill="#FFF" opacity="0.86" />

      <g filter="url(#direkt-soft-shadow)">
        <path d="m151 185 61-49 68 53v58H151v-62Z" fill="#FCFEFF" />
        <path d="m140 184 72-58 79 60-15 16-64-48-59 47-13-17Z" fill="url(#direkt-roof)" />
        <path d="M178 182h70v65h-70z" fill="#FFF" />
        <path d="M198 207h31v40h-31z" fill="#0A77E8" />
        <rect x="161" y="201" width="16" height="22" rx="3" fill="#80C8FF" />
        <rect x="250" y="200" width="16" height="23" rx="3" fill="#80C8FF" />
        <path d="M153 246h128" stroke="#2F5DA8" strokeWidth="5" strokeLinecap="round" opacity="0.34" />
      </g>

      <g>
        <path d="M82 231v-40" stroke="#5B8C30" strokeWidth="7" strokeLinecap="round" />
        <circle cx="82" cy="181" r="19" fill="#86D320" />
        <circle cx="67" cy="198" r="15" fill="#70C917" />
        <circle cx="98" cy="199" r="16" fill="#9ADE28" />
        <path d="M310 235v-38" stroke="#4F8730" strokeWidth="7" strokeLinecap="round" />
        <circle cx="310" cy="188" r="18" fill="#79CE22" />
        <circle cx="296" cy="204" r="14" fill="#66BD18" />
        <circle cx="325" cy="205" r="15" fill="#8EDB2B" />
      </g>

      <g filter="url(#direkt-soft-shadow)">
        <path
          d="M356 95c-27 0-48 20-48 46 0 36 48 83 48 83s48-47 48-83c0-26-21-46-48-46Z"
          fill="url(#direkt-pin)"
        />
        <circle cx="356" cy="141" r="17" fill="#FFF" />
      </g>
    </svg>
  );
}
