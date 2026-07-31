import React from "react";

// Sticker 1: Syringe with pink bow
export const CuteSyringe: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_4px_rgba(255,182,193,0.5)]">
    {/* Needle */}
    <path d="M50 25V10" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
    <path d="M48 10H52" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    {/* Cap adapter */}
    <rect x="46" y="25" width="8" height="4" rx="1" fill="#F472B6" />
    {/* Main Syringe body */}
    <rect x="40" y="29" width="20" height="45" rx="3" fill="#E0F2FE" fillOpacity="0.8" stroke="#F472B6" strokeWidth="2" />
    {/* Piston inside */}
    <rect x="47" y="32" width="6" height="15" fill="#F472B6" rx="1" />
    {/* Liquid inside - cute pastel pink with some space */}
    <rect x="41" y="48" width="18" height="23" fill="#FBCFE8" />
    {/* Measurement lines */}
    <line x1="43" y1="36" x2="47" y2="36" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="43" y1="42" x2="47" y2="42" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="43" y1="48" x2="47" y2="48" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="43" y1="54" x2="47" y2="54" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="43" y1="60" x2="47" y2="60" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="43" y1="66" x2="47" y2="66" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
    {/* Plunger shaft and thumb press */}
    <path d="M50 74V88" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 88H58" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
    {/* Big cute pink ribbon bow wrapped around the middle */}
    {/* Left Loop */}
    <path d="M50 56C38 48 30 58 42 62C50 64 50 58 50 56Z" fill="#FFB6C1" stroke="#F472B6" strokeWidth="1.5" />
    {/* Right Loop */}
    <path d="M50 56C62 48 70 58 58 62C50 64 50 58 50 56Z" fill="#FFB6C1" stroke="#F472B6" strokeWidth="1.5" />
    {/* Left Ribbon tail */}
    <path d="M46 60C40 68 35 72 34 76" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" />
    {/* Right Ribbon tail */}
    <path d="M54 60C60 68 65 72 66 76" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" />
    {/* Center Knot */}
    <circle cx="50" cy="57" r="4.5" fill="#FFF0F5" stroke="#F472B6" strokeWidth="1.5" />
    {/* Tiny sparkles */}
    <circle cx="34" cy="22" r="1.5" fill="#FDF2F8" />
    <path d="M68 32L71 35L68 38L65 35Z" fill="#FFF" />
  </svg>
);

// Sticker 2: Stethoscope with angel wings
export const AngelStethoscope: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_4px_rgba(255,182,193,0.5)]">
    {/* Headset tubes */}
    <path d="M35 25C35 40 65 40 65 25" stroke="#FBCFE8" strokeWidth="4" strokeLinecap="round" />
    <path d="M35 25V20" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
    <path d="M65 25V20" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
    {/* Earpieces */}
    <circle cx="35" cy="18" r="4" fill="#F472B6" />
    <circle cx="65" cy="18" r="4" fill="#F472B6" />
    {/* Bottom tube y-connection */}
    <path d="M50 36C50 48 50 55 50 65" stroke="#FBCFE8" strokeWidth="4" strokeLinecap="round" />
    {/* Chestpiece ring */}
    <circle cx="50" cy="70" r="10" fill="#FFF" stroke="#F472B6" strokeWidth="3" />
    <circle cx="50" cy="70" r="6" fill="#FBCFE8" />
    {/* Angel Wings behind the chestpiece */}
    {/* Left Wing */}
    <path d="M40 65C30 65 20 55 24 45C28 35 38 48 40 58Z" fill="#FFF" stroke="#F472B6" strokeWidth="1.5" />
    <path d="M38 61C31 61 25 54 28 48" stroke="#FBCFE8" strokeWidth="1" strokeLinecap="round" />
    {/* Right Wing */}
    <path d="M60 65C70 65 80 55 76 45C72 35 62 48 60 58Z" fill="#FFF" stroke="#F472B6" strokeWidth="1.5" />
    <path d="M62 61C69 61 75 54 72 48" stroke="#FBCFE8" strokeWidth="1" strokeLinecap="round" />
    {/* Tiny sparkles */}
    <circle cx="20" cy="30" r="2" fill="#FDE047" />
    <circle cx="80" cy="35" r="1.5" fill="#FFF" />
  </svg>
);

// Sticker 3: Nurse Cap
export const NurseCap: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_4px_rgba(255,182,193,0.4)]">
    {/* Curved back base */}
    <path d="M20 65C20 40 80 40 80 65" fill="#FFF" stroke="#E2E8F0" strokeWidth="2" />
    {/* Cap crown */}
    <path d="M15 65C22 55 35 42 50 42C65 42 78 55 85 65C80 68 65 72 50 72C35 72 20 68 15 65Z" fill="#FFF" stroke="#F472B6" strokeWidth="2" strokeLinejoin="round" />
    {/* Dark rim line inside hat */}
    <path d="M16 63C25 66 38 68 50 68C62 68 75 66 84 63" stroke="#F1F5F9" strokeWidth="2" />
    {/* Pastel pink cross in the middle */}
    <rect x="46" y="48" width="8" height="16" rx="2" fill="#FFB6C1" />
    <rect x="42" y="52" width="16" height="8" rx="2" fill="#FFB6C1" />
    <rect x="47" y="49" width="6" height="14" rx="1" fill="#F472B6" />
    <rect x="43" y="53" width="14" height="6" rx="1" fill="#F472B6" />
    {/* Tiny sparkles */}
    <path d="M82 40L84 43L82 46L80 43Z" fill="#FFF" />
  </svg>
);

// Sticker 4: Patch-style Angel Wings
export const AngelWings: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_4px_rgba(255,182,193,0.5)]">
    <g transform="translate(10, 15)">
      {/* Left Wing */}
      <path d="M35 45C30 45 10 38 5 28C0 18 10 10 22 18C30 24 33 32 35 45Z" fill="#FFF" stroke="#FFB6C1" strokeWidth="3" />
      <path d="M35 45C30 45 10 38 5 28C0 18 10 10 22 18C30 24 33 32 35 45Z" fill="#FFF" stroke="#F472B6" strokeWidth="1.5" />
      {/* Inner feathers detailing */}
      <path d="M28 35C22 35 12 30 14 24" stroke="#FBCFE8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30 28C26 28 18 24 20 20" stroke="#FBCFE8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right Wing */}
      <path d="M45 45C50 45 70 38 75 28C80 18 70 10 58 18C50 24 47 32 45 45Z" fill="#FFF" stroke="#FFB6C1" strokeWidth="3" />
      <path d="M45 45C50 45 70 38 75 28C80 18 70 10 58 18C50 24 47 32 45 45Z" fill="#FFF" stroke="#F472B6" strokeWidth="1.5" />
      {/* Inner feathers detailing */}
      <path d="M52 35C58 35 68 30 66 24" stroke="#FBCFE8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 28C54 28 62 24 60 20" stroke="#FBCFE8" strokeWidth="1.5" strokeLinecap="round" />
    </g>
    {/* Tiny floating hearts above wings */}
    <path d="M50 20C50 20 48 16 46 16C44 16 43 18 43 20C43 23 50 26 50 26C50 26 57 23 57 20C57 18 56 16 54 16C52 16 50 20 50 20Z" fill="#F472B6" />
  </svg>
);

// Sticker 5: Love Magic Potion
export const LovePotion: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_5px_rgba(244,114,182,0.5)]">
    {/* Bottle cork stopper */}
    <rect x="45" y="16" width="10" height="8" rx="1.5" fill="#D97706" stroke="#92400E" strokeWidth="1" />
    {/* Bottle neck */}
    <rect x="42" y="24" width="16" height="12" fill="#E0F2FE" fillOpacity="0.8" stroke="#F472B6" strokeWidth="2" />
    {/* Cute Pink Bow on the neck */}
    <ellipse cx="42" cy="28" rx="5" ry="3" fill="#FFB6C1" stroke="#F472B6" strokeWidth="1" />
    <ellipse cx="58" cy="28" rx="5" ry="3" fill="#FFB6C1" stroke="#F472B6" strokeWidth="1" />
    <circle cx="50" cy="28" r="3" fill="#FFF" stroke="#F472B6" strokeWidth="1" />
    
    {/* Heart-shaped Glass flask body */}
    <path d="M50 84C18 64 24 38 50 48C76 38 82 64 50 84Z" fill="#FFF" fillOpacity="0.3" stroke="#F472B6" strokeWidth="2.5" strokeLinejoin="round" />
    
    {/* Potion fluid with a shiny pink-yellow magical gradient */}
    <defs>
      <linearGradient id="potionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF" />
        <stop offset="30%" stopColor="#FFD4F3" />
        <stop offset="70%" stopColor="#FFB6C1" />
        <stop offset="100%" stopColor="#F472B6" />
      </linearGradient>
    </defs>
    <path d="M50 82C23 65 28 44 50 53C72 44 77 65 50 82Z" fill="url(#potionGrad)" />
    
    {/* Magic Bubbles and sparkle shine in the bottle */}
    <circle cx="45" cy="65" r="3" fill="#FFF" fillOpacity="0.6" />
    <circle cx="56" cy="58" r="2" fill="#FFF" fillOpacity="0.8" />
    <circle cx="48" cy="74" r="1.5" fill="#FFF" />
    
    {/* Outer magic stars */}
    <path d="M18 42L20 45L18 48L16 45Z" fill="#FDE047" />
    <path d="M80 65L82 67L80 69L78 67Z" fill="#FDE047" />
  </svg>
);

// Sticker 6: Candy Hearts & Pills
export const CandyPills: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_4px_rgba(244,114,182,0.4)]">
    {/* Conversation Candy Heart */}
    <g transform="translate(15, 20) rotate(-10)">
      <path d="M25 45C25 45 4 33 4 18C4 8 13 4 25 14C37 4 46 8 46 18C46 33 25 45 25 45Z" fill="#FFD4F3" stroke="#F472B6" strokeWidth="2" />
      {/* LOVE text inside heart */}
      <text x="25" y="24" fill="#F472B6" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">LOVE</text>
    </g>
    
    {/* Capsule pill */}
    <g transform="translate(50, 48) rotate(35)">
      <rect x="4" y="4" width="14" height="28" rx="7" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
      {/* Pink half of capsule */}
      <path d="M4 18H18V25C18 28.87 14.87 32 11 32C7.13 32 4 28.87 4 25V18Z" fill="#FFB6C1" stroke="#F472B6" strokeWidth="1.5" />
      {/* Tiny face or eyes on pill */}
      <circle cx="8" cy="11" r="1" fill="#334155" />
      <circle cx="14" cy="11" r="1" fill="#334155" />
      <path d="M10 13C10 13 11 14 12 13" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
    </g>

    {/* Sparkles */}
    <circle cx="20" cy="15" r="2" fill="#FDE047" />
    <path d="M78 28L80 30L78 32L76 30Z" fill="#FFF" />
  </svg>
);

// Sticker 7: Planet Heart (Saturn Heart)
export const SaturnHeart: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_5px_rgba(244,114,182,0.5)]">
    {/* Background stars */}
    <path d="M22 24L24 27L22 30L20 27Z" fill="#FDE047" />
    <path d="M78 74L80 77L78 80L76 77Z" fill="#FDE047" />

    {/* Back portion of planetary ring */}
    <path d="M20 54C25 44 75 44 80 54" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" />
    <path d="M22 54C26 46 74 46 78 54" stroke="#FFD4F3" strokeWidth="3" strokeLinecap="round" />

    {/* Center Heart body */}
    <path d="M50 78C50 78 18 60 18 38C18 24 31 18 50 34C69 18 82 24 82 38C82 60 50 78 50 78Z" fill="#FFB6C1" stroke="#F472B6" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M42 35C34 35 25 38 25 45" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />

    {/* Front portion of planetary ring overlay */}
    <path d="M16 48C20 58 80 58 84 48" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" />
    <path d="M18 48C22 56 78 56 82 48" stroke="#FFD4F3" strokeWidth="3" strokeLinecap="round" />

    {/* Cute little floating hearts around it */}
    <path d="M30 70C30 70 28 67 27 67C26 67 25 68 25 69C25 71 30 73 30 73C30 73 35 71 35 69C35 68 34 67 33 67C32 67 30 70 30 70Z" fill="#F472B6" />
    <path d="M70 25C70 25 68 22 67 22C66 22 65 23 65 24C65 26 70 28 70 28C70 28 75 26 75 24C75 23 74 22 73 22C72 22 70 25 70 25Z" fill="#FFD4F3" />
  </svg>
);

// Sticker 8: Cute Crossed Band-Aids with Heart
export const CuteBandAids: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_4px_rgba(244,114,182,0.4)]">
    {/* Diagonal Band-Aid 1 (Bottom Left to Top Right) */}
    <g transform="translate(50, 50) rotate(-45) translate(-50, -50)">
      <rect x="15" y="40" width="70" height="20" rx="10" fill="#FFE4E6" stroke="#FDA4AF" strokeWidth="2" />
      {/* Gauze pad in middle */}
      <rect x="38" y="41" width="24" height="18" fill="#FFF" />
      {/* Perforated dots */}
      <circle cx="25" cy="46" r="1" fill="#FDA4AF" />
      <circle cx="30" cy="50" r="1" fill="#FDA4AF" />
      <circle cx="25" cy="54" r="1" fill="#FDA4AF" />
      <circle cx="75" cy="46" r="1" fill="#FDA4AF" />
      <circle cx="70" cy="50" r="1" fill="#FDA4AF" />
      <circle cx="75" cy="54" r="1" fill="#FDA4AF" />
    </g>

    {/* Diagonal Band-Aid 2 (Top Left to Bottom Right) */}
    <g transform="translate(50, 50) rotate(45) translate(-50, -50)">
      <rect x="15" y="40" width="70" height="20" rx="10" fill="#FFE4E6" stroke="#FDA4AF" strokeWidth="2" />
      {/* Gauze pad in middle */}
      <rect x="38" y="41" width="24" height="18" fill="#FFF" />
      {/* Perforated dots */}
      <circle cx="25" cy="46" r="1" fill="#FDA4AF" />
      <circle cx="30" cy="50" r="1" fill="#FDA4AF" />
      <circle cx="25" cy="54" r="1" fill="#FDA4AF" />
      <circle cx="75" cy="46" r="1" fill="#FDA4AF" />
      <circle cx="70" cy="50" r="1" fill="#FDA4AF" />
      <circle cx="75" cy="54" r="1" fill="#FDA4AF" />
    </g>

    {/* Raised Shiny Pink Heart Sticker exactly in the center */}
    <path d="M50 62C50 62 38 52 38 43C38 37 43 34 50 41C57 34 62 37 62 43C62 52 50 62 50 62Z" fill="#FFB6C1" stroke="#F472B6" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Shiny crescent reflection inside the heart */}
    <path d="M44 42C41 42 41 46 41 46" stroke="#FFF" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// All stickers in one export array for easy random selection
export const PastelStickerComponents = [
  CuteSyringe,
  AngelStethoscope,
  NurseCap,
  AngelWings,
  LovePotion,
  CandyPills,
  SaturnHeart,
  CuteBandAids
];
