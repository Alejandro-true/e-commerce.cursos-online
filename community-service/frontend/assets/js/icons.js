const paths = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  message:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  shield:'<path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  award:'<circle cx="12" cy="8" r="5"/><path d="m8.5 12-1 9 4.5-3 4.5 3-1-9"/>',
  activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  settings:'<path d="m9.5 3-.7 2.2-2 .9-2.2-.5-2.1 3.6L4 11v2l-1.5 1.8 2.1 3.6 2.2-.5 2 .9.7 2.2h5l.7-2.2 2-.9 2.2.5 2.1-3.6L20 13v-2l1.5-1.8-2.1-3.6-2.2.5-2-.9-.7-2.2Z"/><circle cx="12" cy="12" r="3"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  'arrow-up':'<path d="M7 17 17 7M7 7h10v10"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  'chevron-right':'<path d="m9 6 6 6-6 6"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  search:'<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  book:'<path d="M12 5v16M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z"/>',
  bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off':'<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.4A11 11 0 0 1 12 5c7 0 10 7 10 7a16 16 0 0 1-3 4M6.5 6.5A17 17 0 0 0 2 12s3 7 10 7a12 12 0 0 0 5.5-1.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  alert:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1"/>',
  code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  trophy:'<path d="M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v6m-4 1h8"/>',
  spark:'<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Z"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  link:'<path d="m9 15 6-6M8 17l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 10a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1" transform="translate(1 0) scale(.9)"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  monitor:'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-5 0h10"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  checkcircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
};
export function icon(name, cls='') { return `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`; }
export function badgeArt(type=1, cls='') {
 const colors=[['#e9c574','#fff0c4','#997135'],['#99b8e8','#e6f0ff','#5779a7'],['#9cc4af','#e1f2e7','#427d65'],['#c7b4dd','#f1e9fa','#87649d'],['#e5b299','#fde9df','#b07250'],['#a6c8d2','#e6f4f8','#547f8c']];
 const [c,b,d]=colors[(type-1)%colors.length];
 return `<svg class="badge-art ${cls}" viewBox="0 0 120 132" fill="none" role="img" aria-label="Insignia de módulo completado"><path d="m39 78-8 47 29-17 29 17-8-47" fill="${d}"/><path d="m47 88-5 24 18-11 18 11-5-24" fill="${c}"/><path d="m60 5 10 7 12-1 7 10 12 4 2 12 9 9-3 12 3 12-9 9-2 12-12 4-7 10-12-1-10 7-10-7-12 1-7-10-12-4-2-12-9-9 3-12-3-12 9-9 2-12 12-4 7-10 12 1 10-7Z" fill="${c}"/><circle cx="60" cy="58" r="35" fill="${b}"/><circle cx="60" cy="58" r="28" stroke="${d}" stroke-opacity=".3" stroke-dasharray="2 4"/><path d="m60 34 7 15 16 2-12 12 3 16-14-8-14 8 3-16-12-12 16-2 7-15Z" fill="${d}"/><path d="m55 52 4-8" stroke="white" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/></svg>`;
}
