/**
 * The scene behind the hero: a skyline at golden hour, a house, a shop, a coin
 * and a key.
 *
 * Drawn rather than photographed, and inline rather than fetched. It is the
 * largest thing above the fold on a page paid traffic lands on, and an <img>
 * there is a request that has to finish before anybody sees anything — inline
 * vector arrives with the HTML, weighs a few kilobytes and stays sharp on a
 * desktop and a phone alike. No stock photography licence to keep track of
 * either.
 *
 * Purely decorative, so it is hidden from assistive technology: everything it
 * says, the words beside it say properly.
 */
export function HeroScene() {
  return (
      <svg className="scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#082E29" /><stop offset=".55" stopColor="#145A51" /><stop offset="1" stopColor="#3C8A72" /></linearGradient>
      <radialGradient id="glow" cx="74%" cy="66%" r="42%"><stop offset="0" stopColor="#F7B733" stopOpacity=".7" /><stop offset="1" stopColor="#F7B733" stopOpacity="0" /></radialGradient>
      <pattern id="win" width="20" height="24" patternUnits="userSpaceOnUse"><rect x="5" y="6" width="9" height="11" rx="1" fill="#FFD27A" opacity=".5" /></pattern>
      <pattern id="winb" width="16" height="20" patternUnits="userSpaceOnUse"><rect x="4" y="5" width="7" height="9" fill="#A8DCCD" opacity=".22" /></pattern>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0F4A43" /><stop offset=".5" stopColor="#1A6A5E" /><stop offset="1" stopColor="#0C3D37" /></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)" />
      <rect width="1600" height="900" fill="url(#glow)" />
      <circle className="sun" cx="1170" cy="560" r="115" fill="#F2A516" />
      <g fill="#1D6E61" opacity=".85">
      <rect x="20" y="560" width="70" height="200" /><rect x="100" y="600" width="60" height="160" /><rect x="170" y="520" width="80" height="240" />
      <rect x="560" y="540" width="70" height="220" /><rect x="640" y="590" width="90" height="170" /><rect x="760" y="500" width="60" height="260" />
      <rect x="1300" y="520" width="70" height="240" /><rect x="1380" y="580" width="80" height="180" /><rect x="1480" y="540" width="90" height="220" />
      </g>
      <g>
      <rect x="870" y="360" width="120" height="400" fill="url(#glass)" /><rect x="870" y="360" width="120" height="400" fill="url(#win)" />
      <path d="M1010 290 L1100 250 L1100 760 L1010 760Z" fill="#0C3934" /><path d="M1010 290 L1100 250 L1100 760 L1010 760Z" fill="url(#win)" />
      <rect x="1052" y="200" width="6" height="55" fill="#0C3934" />
      <path d="M1250 420 Q1320 360 1390 420 L1390 760 L1250 760Z" fill="url(#glass)" /><path d="M1250 420 Q1320 360 1390 420 L1390 760 L1250 760Z" fill="url(#winb)" />
      <rect x="1410" y="330" width="100" height="430" fill="#0C3934" /><rect x="1410" y="330" width="100" height="430" fill="url(#win)" />
      <rect x="1520" y="450" width="90" height="310" fill="url(#glass)" /><rect x="1520" y="450" width="90" height="310" fill="url(#winb)" />
      <rect x="280" y="470" width="110" height="290" fill="#0C3934" /><rect x="280" y="470" width="110" height="290" fill="url(#winb)" />
      <rect x="400" y="420" width="90" height="340" fill="url(#glass)" /><rect x="400" y="420" width="90" height="340" fill="url(#winb)" />
      </g>
      <rect y="755" width="1600" height="145" fill="#072B27" />
      <rect y="820" width="1600" height="34" fill="#0E3A34" />
      <path d="M0 837 H1600" stroke="#F2A516" strokeWidth="3" strokeDasharray="36 28" opacity=".7" />
      <g fill="#0F5046"><circle cx="440" cy="738" r="30" /><circle cx="470" cy="748" r="20" /><circle cx="770" cy="740" r="26" /><circle cx="1395" cy="742" r="26" /></g>
      <g>
      <rect x="530" y="688" width="175" height="72" fill="#F4EFE3" />
      <path d="M512 694 L617 618 L722 694Z" fill="#F2A516" />
      <rect x="673" y="632" width="18" height="36" fill="#E8E1D0" />
      <rect x="600" y="716" width="34" height="44" rx="3" fill="#0E4A43" />
      <circle cx="627" cy="740" r="2.5" fill="#F2A516" />
      <rect className="lit" x="545" y="704" width="38" height="28" rx="3" fill="#FFD27A" />
      <rect className="lit" x="652" y="704" width="38" height="28" rx="3" fill="#FFD27A" />
      </g>
      <g transform="translate(820 715)">
      <circle r="32" fill="#F2A516" /><circle r="25" fill="none" stroke="#C7830A" strokeWidth="3" />
      <text y="11" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="32" fill="#7A4F05">₹</text>
      </g>
      <g transform="translate(380 742) rotate(-18)" fill="#F2A516">
      <circle r="15" /><circle r="6" fill="#072B27" /><rect x="12" y="-4" width="46" height="8" rx="3" /><rect x="44" y="3" width="6" height="11" /><rect x="33" y="3" width="6" height="8" />
      </g>
      <g>
      <rect x="1430" y="690" width="165" height="70" fill="#E2EFEA" />
      <path d="M1422 690 h181 l-10 -28 h-161z" fill="#0E4A43" />
      <g fill="#F2A516"><path d="M1434 690 l5 -28 h18 l-5 28z" /><path d="M1470 690 l5 -28 h18 l-5 28z" /><path d="M1506 690 l5 -28 h18 l-5 28z" /><path d="M1542 690 l5 -28 h18 l-5 28z" /></g>
      <rect className="lit" x="1442" y="704" width="90" height="38" rx="3" fill="#FFD27A" />
      <rect x="1545" y="704" width="32" height="56" fill="#0E4A43" />
      </g>
      </svg>
  );
}
