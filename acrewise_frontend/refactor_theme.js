import fs from 'fs';

const filePath = './src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replacement map
const replacements = [
  // Backgrounds
  { regex: /bg-zinc-950/g, replacement: 'bg-slate-50' },
  { regex: /bg-zinc-900\/20/g, replacement: 'bg-white' },
  { regex: /bg-zinc-900\/60/g, replacement: 'bg-gray-50' },
  { regex: /bg-zinc-900/g, replacement: 'bg-white shadow-sm border border-gray-200' },
  { regex: /bg-zinc-850/g, replacement: 'bg-gray-100' },
  { regex: /bg-zinc-800\/50/g, replacement: 'bg-gray-50' },
  { regex: /bg-zinc-800/g, replacement: 'bg-gray-100' },
  { regex: /bg-black\/40/g, replacement: 'bg-white/80' },
  { regex: /bg-black\/80/g, replacement: 'bg-white' },
  { regex: /bg-black/g, replacement: 'bg-white' },
  
  // Text colors
  { regex: /text-white/g, replacement: 'text-gray-900' },
  { regex: /text-zinc-300/g, replacement: 'text-gray-700' },
  { regex: /text-zinc-400/g, replacement: 'text-gray-500' },
  { regex: /text-zinc-500/g, replacement: 'text-gray-400' },
  { regex: /text-emerald-400/g, replacement: 'text-slate-700' },
  { regex: /text-emerald-500/g, replacement: 'text-slate-800' },
  
  // Borders
  { regex: /border-zinc-850/g, replacement: 'border-gray-200' },
  { regex: /border-zinc-800/g, replacement: 'border-gray-200' },
  { regex: /border-zinc-900\/60/g, replacement: 'border-gray-200' },
  { regex: /border-zinc-900/g, replacement: 'border-gray-200' },
  { regex: /border-emerald-500\/20/g, replacement: 'border-slate-300' },
  { regex: /border-white\/10/g, replacement: 'border-gray-200' },
  { regex: /border-zinc-700/g, replacement: 'border-gray-300' },
  
  // Hover states
  { regex: /hover:bg-zinc-800/g, replacement: 'hover:bg-gray-100' },
  { regex: /hover:bg-zinc-900/g, replacement: 'hover:bg-gray-50' },
  { regex: /hover:text-white/g, replacement: 'hover:text-gray-900' },
  { regex: /hover:text-emerald-300/g, replacement: 'hover:text-slate-900' },
  
  // Specific landing page gradients and bg
  { regex: /rgba\(9, 9, 11, 0\.4\)/g, replacement: 'rgba(255, 255, 255, 0.9)' },
  { regex: /rgba\(9, 9, 11, 0\.95\)/g, replacement: 'rgba(255, 255, 255, 1)' },
  { regex: /rgba\(16, 185, 129, 0\.08\)/g, replacement: 'rgba(226, 232, 240, 0.5)' },
  
  // Button overrides (white text on dark buttons)
  { regex: /bg-white text-black/g, replacement: 'bg-slate-900 text-white' },
  { regex: /bg-emerald-500/g, replacement: 'bg-slate-800' },
  { regex: /bg-emerald-500\/10/g, replacement: 'bg-slate-100' },
  { regex: /bg-emerald-500\/20/g, replacement: 'bg-slate-200' },
  
  // Custom scrollbar classes (if any exist using zinc)
  { regex: /scrollbar-thumb-zinc-800/g, replacement: 'scrollbar-thumb-gray-300' },
  { regex: /scrollbar-track-zinc-950/g, replacement: 'scrollbar-track-gray-50' },
];

replacements.forEach(({ regex, replacement }) => {
  content = content.replace(regex, replacement);
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored App.jsx classes to light theme.');
