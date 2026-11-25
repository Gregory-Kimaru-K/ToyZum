// A lightweight, original illustration. No remote assets are needed to render it.
export default function PlayArtwork() {
  return <svg className="gh-artwork" viewBox="0 0 600 480" role="img" aria-label="Colourful playing cards, a die, building blocks and a chess piece">
    <defs>
      <pattern id="board-grid" width="42" height="42" patternUnits="userSpaceOnUse"><rect width="42" height="42" fill="#e7e2d6" /><rect width="21" height="21" fill="#f7f3e9" /><rect x="21" y="21" width="21" height="21" fill="#f7f3e9" /></pattern>
      <filter id="play-shadow" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="15" stdDeviation="12" floodColor="#25231d" floodOpacity=".15" /></filter>
    </defs>
    <circle cx="300" cy="233" r="200" fill="#ebe6da" />
    <ellipse cx="302" cy="412" rx="236" ry="25" fill="#24291f" opacity=".08" />
    <g transform="translate(70 275) rotate(-12 185 60)"><rect width="370" height="115" rx="9" fill="#c8c0af" /><rect y="-8" width="370" height="115" rx="9" fill="url(#board-grid)" /></g>
    <g filter="url(#play-shadow)" transform="translate(125 90) rotate(-17 78 103)">
      <rect width="146" height="207" rx="13" fill="#333b79" /><rect x="10" y="10" width="126" height="187" rx="6" fill="none" stroke="#a5abd7" strokeWidth="2" />
      <path d="m73 51 34 52-34 52-34-52Z" fill="#c9e88b" /><circle cx="73" cy="103" r="15" fill="#333b79" />
    </g>
    <g filter="url(#play-shadow)" transform="translate(225 70) rotate(12 72 103)">
      <rect width="146" height="207" rx="13" fill="#fffcf4" /><text x="17" y="36" fontSize="25" fontFamily="Georgia,serif" fill="#e96943">A</text>
      <path d="M73 80c-22-32-55 6 0 46 55-40 22-78 0-46" fill="#e96943" />
      <text x="111" y="190" fontSize="25" fontFamily="Georgia,serif" fill="#e96943">A</text>
    </g>
    <g filter="url(#play-shadow)" transform="translate(352 243)">
      <path d="m20-110 23-17 28 4 15 22-3 30-17 9 8 20 17 23H7l25-38-5-20-16-6 1-16Z" fill="#313a30" />
      <path d="M43-127 45-151 60-130M22-105l35 1-17 30" fill="#313a30" /><circle cx="34" cy="-111" r="3" fill="#d8edac" />
      <path d="M22-23h58l8 16H14l8-16ZM14-7h74l8 19H6L14-7Z" fill="#414d3e" />
    </g>
    <g filter="url(#play-shadow)" transform="translate(118 299) rotate(14 58 58)">
      <rect x="5" y="9" width="112" height="112" rx="23" fill="#cb5736" /><rect width="112" height="112" rx="23" fill="#f47a50" />
      {[ [28,28], [84,28], [56,56], [28,84], [84,84] ].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="8" fill="#fff5df" />)}
    </g>
    <g filter="url(#play-shadow)" transform="translate(385 310) rotate(-9 50 45)">
      <rect y="38" width="104" height="56" rx="8" fill="#b4cb6b" /><rect y="30" width="104" height="45" rx="8" fill="#d1e99a" />
      <rect x="18" y="9" width="69" height="46" rx="7" fill="#d8aa46" /><rect x="18" width="69" height="36" rx="7" fill="#f5ce76" />
      <ellipse cx="38" cy="0" rx="10" ry="5" fill="#ffdf98" /><ellipse cx="67" cy="0" rx="10" ry="5" fill="#ffdf98" />
    </g>
    <g fill="none" stroke="#636f4b" strokeWidth="2.5"><path d="M474 113v24m-12-12h24M85 211v18m-9-9h18" /><circle cx="424" cy="66" r="6" /><path d="m498 253 5 8 9 1-7 6 2 9-9-4-8 5 1-10-7-5 9-2Z" /></g>
  </svg>;
}
