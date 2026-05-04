'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface InterviewAvatarProps {
  interviewer: {
    id: string
    name: string
    title: string
    accentColor: string
    accentBg: string
    avatarGradient: string
    initials: string
  }
  isSpeaking: boolean
  audioElementRef: React.RefObject<HTMLAudioElement | null>
  size?: number // default 280
}

// ─── Color Mappings ───────────────────────────────────────────────────────────
// Maps interviewer id to specific SVG colors for skin, hair, etc.

const AVATAR_PALETTE: Record<
  string,
  {
    skin: string
    skinShadow: string
    hair: string
    hairHighlight: string
    eyeColor: string
    lipColor: string
    mouthInner: string
    accentHex: string
    accentGlow: string
    bgStart: string
    bgEnd: string
    badgeBg: string
    badgeBorder: string
    badgeText: string
    earring?: string
    necklace?: string
    stubble?: string
  }
> = {
  kazi: {
    skin: '#8D6E63',
    skinShadow: '#6D4C41',
    hair: '#3E2723',
    hairHighlight: '#5D4037',
    eyeColor: '#1B5E20',
    lipColor: '#A1887F',
    mouthInner: '#5D4037',
    accentHex: '#14B8A6',
    accentGlow: 'rgba(20,184,166,0.35)',
    bgStart: '#0D9488',
    bgEnd: '#06B6D4',
    badgeBg: 'rgba(20,184,166,0.2)',
    badgeBorder: '#14B8A6',
    badgeText: '#14B8A6',
  },
  thabo: {
    skin: '#5D4037',
    skinShadow: '#4E342E',
    hair: '#212121',
    hairHighlight: '#424242',
    eyeColor: '#263238',
    lipColor: '#6D4C41',
    mouthInner: '#3E2723',
    accentHex: '#94A3B8',
    accentGlow: 'rgba(148,163,184,0.35)',
    bgStart: '#64748B',
    bgEnd: '#475569',
    badgeBg: 'rgba(148,163,184,0.2)',
    badgeBorder: '#94A3B8',
    badgeText: '#94A3B8',
  },
  naledi: {
    skin: '#A1887F',
    skinShadow: '#8D6E63',
    hair: '#4E342E',
    hairHighlight: '#6D4C41',
    eyeColor: '#4E342E',
    lipColor: '#BCAAA4',
    mouthInner: '#5D4037',
    accentHex: '#F59E0B',
    accentGlow: 'rgba(245,158,11,0.35)',
    bgStart: '#F59E0B',
    bgEnd: '#F97316',
    badgeBg: 'rgba(245,158,11,0.2)',
    badgeBorder: '#F59E0B',
    badgeText: '#F59E0B',
    earring: '#F59E0B',
  },
  james: {
    skin: '#EFEBE9',
    skinShadow: '#D7CCC8',
    hair: '#546E7A',
    hairHighlight: '#78909C',
    eyeColor: '#37474F',
    lipColor: '#BCAAA4',
    mouthInner: '#8D6E63',
    accentHex: '#8B5CF6',
    accentGlow: 'rgba(139,92,246,0.35)',
    bgStart: '#8B5CF6',
    bgEnd: '#7C3AED',
    badgeBg: 'rgba(139,92,246,0.2)',
    badgeBorder: '#8B5CF6',
    badgeText: '#8B5CF6',
    stubble: '#90A4AE',
  },
  zanele: {
    skin: '#6D4C41',
    skinShadow: '#5D4037',
    hair: '#212121',
    hairHighlight: '#424242',
    eyeColor: '#1B5E20',
    lipColor: '#A1887F',
    mouthInner: '#5D4037',
    accentHex: '#F43F5E',
    accentGlow: 'rgba(244,63,94,0.35)',
    bgStart: '#F43F5E',
    bgEnd: '#EC4899',
    badgeBg: 'rgba(244,63,94,0.2)',
    badgeBorder: '#F43F5E',
    badgeText: '#F43F5E',
    necklace: '#F43F5E',
  },
}

// ─── Individual Avatar Renderers ──────────────────────────────────────────────

function KaziAvatar({
  palette,
  mouthOpen,
  blinkOpen,
  eyeShiftX,
  breathing,
}: {
  palette: (typeof AVATAR_PALETTE)['kazi']
  mouthOpen: number
  blinkOpen: number
  eyeShiftX: number
  breathing: number
}) {
  return (
    <g transform={`translate(0, ${breathing})`}>
      {/* Neck */}
      <rect x="88" y="120" width="24" height="22" rx="6" fill={palette.skin} />
      <rect x="88" y="130" width="24" height="14" rx="4" fill={palette.skinShadow} opacity="0.3" />

      {/* Shoulders / Body */}
      <path
        d="M40,170 Q40,145 70,140 L80,138 Q100,134 120,138 L130,140 Q160,145 160,170 L160,190 L40,190 Z"
        fill={palette.skinShadow}
        opacity="0.6"
      />
      <path
        d="M50,170 Q50,150 75,145 L85,142 Q100,138 115,142 L125,145 Q150,150 150,170 L150,190 L50,190 Z"
        fill="#374151"
      />
      {/* Collar hint */}
      <path d="M85,142 L100,155 L115,142" fill="none" stroke="#4B5563" strokeWidth="2" />

      {/* Head - round friendly face */}
      <ellipse cx="100" cy="85" rx="52" ry="58" fill={palette.skin} />
      {/* Face shadow */}
      <ellipse cx="100" cy="95" rx="48" ry="50" fill={palette.skinShadow} opacity="0.12" />

      {/* Ears */}
      <ellipse cx="48" cy="85" rx="8" ry="12" fill={palette.skin} />
      <ellipse cx="48" cy="85" rx="5" ry="8" fill={palette.skinShadow} opacity="0.2" />
      <ellipse cx="152" cy="85" rx="8" ry="12" fill={palette.skin} />
      <ellipse cx="152" cy="85" rx="5" ry="8" fill={palette.skinShadow} opacity="0.2" />

      {/* Short curly hair */}
      <ellipse cx="100" cy="52" rx="54" ry="38" fill={palette.hair} />
      {/* Curly texture - small bumps */}
      <circle cx="55" cy="48" r="10" fill={palette.hair} />
      <circle cx="72" cy="38" r="10" fill={palette.hair} />
      <circle cx="88" cy="34" r="10" fill={palette.hair} />
      <circle cx="100" cy="32" r="10" fill={palette.hair} />
      <circle cx="112" cy="34" r="10" fill={palette.hair} />
      <circle cx="128" cy="38" r="10" fill={palette.hair} />
      <circle cx="145" cy="48" r="10" fill={palette.hair} />
      <circle cx="62" cy="42" r="8" fill={palette.hairHighlight} opacity="0.3" />
      <circle cx="100" cy="36" r="8" fill={palette.hairHighlight} opacity="0.2" />
      <circle cx="138" cy="42" r="8" fill={palette.hairHighlight} opacity="0.3" />
      {/* Side hair */}
      <ellipse cx="52" cy="62" rx="10" ry="16" fill={palette.hair} />
      <ellipse cx="148" cy="62" rx="10" ry="16" fill={palette.hair} />

      {/* Glasses - round */}
      <circle cx="78" cy="82" r="16" fill="none" stroke="#546E7A" strokeWidth="2.5" />
      <circle cx="122" cy="82" r="16" fill="none" stroke="#546E7A" strokeWidth="2.5" />
      <line x1="94" y1="82" x2="106" y2="82" stroke="#546E7A" strokeWidth="2" />
      <line x1="62" y1="82" x2="52" y2="78" stroke="#546E7A" strokeWidth="2" />
      <line x1="138" y1="82" x2="148" y2="78" stroke="#546E7A" strokeWidth="2" />
      {/* Lens reflection */}
      <circle cx="72" cy="76" r="4" fill="white" opacity="0.12" />
      <circle cx="116" cy="76" r="4" fill="white" opacity="0.12" />

      {/* Eyes behind glasses */}
      <ellipse
        cx={78 + eyeShiftX}
        cy="83"
        rx="6"
        ry={blinkOpen * 6 + 1}
        fill="white"
      />
      <ellipse
        cx={122 + eyeShiftX}
        cy="83"
        rx="6"
        ry={blinkOpen * 6 + 1}
        fill="white"
      />
      {/* Pupils */}
      <ellipse
        cx={80 + eyeShiftX}
        cy="83"
        rx="3.5"
        ry={blinkOpen * 3.5 + 0.5}
        fill={palette.eyeColor}
      />
      <ellipse
        cx={124 + eyeShiftX}
        cy="83"
        rx="3.5"
        ry={blinkOpen * 3.5 + 0.5}
        fill={palette.eyeColor}
      />
      {/* Eye shine */}
      <circle cx={81 + eyeShiftX} cy="81" r="1.5" fill="white" opacity={blinkOpen > 0.3 ? 0.7 : 0} />
      <circle cx={125 + eyeShiftX} cy="81" r="1.5" fill="white" opacity={blinkOpen > 0.3 ? 0.7 : 0} />

      {/* Nose */}
      <path d="M97,88 Q100,98 103,88" fill="none" stroke={palette.skinShadow} strokeWidth="1.5" opacity="0.5" />

      {/* Smile lines */}
      <path d="M68,98 Q72,102 78,100" fill="none" stroke={palette.skinShadow} strokeWidth="1" opacity="0.3" />
      <path d="M132,98 Q128,102 122,100" fill="none" stroke={palette.skinShadow} strokeWidth="1" opacity="0.3" />

      {/* Mouth */}
      <ellipse
        cx="100"
        cy="108"
        rx="14"
        ry={Math.max(1, mouthOpen * 9 + 1.5)}
        fill={palette.lipColor}
      />
      {mouthOpen > 0.15 && (
        <ellipse
          cx="100"
          cy="108"
          rx="10"
          ry={Math.max(0.5, mouthOpen * 7)}
          fill={palette.mouthInner}
        />
      )}
      {/* Upper lip line */}
      <path
        d="M86,106 Q93,103 100,104 Q107,103 114,106"
        fill="none"
        stroke={palette.skinShadow}
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Eyebrows */}
      <path d="M65,68 Q78,63 91,68" fill="none" stroke={palette.hair} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M109,68 Q122,63 135,68" fill="none" stroke={palette.hair} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

function ThaboAvatar({
  palette,
  mouthOpen,
  blinkOpen,
  eyeShiftX,
  breathing,
}: {
  palette: (typeof AVATAR_PALETTE)['thabo']
  mouthOpen: number
  blinkOpen: number
  eyeShiftX: number
  breathing: number
}) {
  return (
    <g transform={`translate(0, ${breathing})`}>
      {/* Neck */}
      <rect x="89" y="118" width="22" height="24" rx="5" fill={palette.skin} />
      <rect x="89" y="130" width="22" height="14" rx="4" fill={palette.skinShadow} opacity="0.25" />

      {/* Shoulders / Body - broad, corporate suit */}
      <path
        d="M32,170 Q32,142 68,136 L82,133 Q100,130 118,133 L132,136 Q168,142 168,170 L168,190 L32,190 Z"
        fill="#1F2937"
      />
      {/* Suit lapels */}
      <path d="M82,133 L95,158 L100,155 L105,158 L118,133" fill="#111827" />
      {/* Tie */}
      <path d="M97,150 L100,170 L103,150" fill={palette.accentHex} opacity="0.8" />
      {/* Shirt collar */}
      <path d="M88,133 L95,148 L100,145 L105,148 L112,133" fill="#E5E7EB" />

      {/* Head - angular, strong jawline */}
      <path
        d="M100,28 Q145,28 148,70 L150,85 Q150,110 140,118 Q125,135 100,135 Q75,135 60,118 Q50,110 50,85 L52,70 Q55,28 100,28 Z"
        fill={palette.skin}
      />
      {/* Jawline shadow */}
      <path
        d="M60,118 Q75,132 100,135 Q125,132 140,118 L138,122 Q125,140 100,142 Q75,140 62,122 Z"
        fill={palette.skinShadow}
        opacity="0.2"
      />

      {/* Ears */}
      <ellipse cx="50" cy="82" rx="7" ry="11" fill={palette.skin} />
      <ellipse cx="50" cy="82" rx="4" ry="7" fill={palette.skinShadow} opacity="0.2" />
      <ellipse cx="150" cy="82" rx="7" ry="11" fill={palette.skin} />
      <ellipse cx="150" cy="82" rx="4" ry="7" fill={palette.skinShadow} opacity="0.2" />

      {/* Short neat hair - close-cropped, structured */}
      <path
        d="M52,70 Q52,25 100,22 Q148,25 148,70 L148,55 Q148,32 100,28 Q52,32 52,55 Z"
        fill={palette.hair}
      />
      <path
        d="M55,55 Q55,34 100,30 Q145,34 145,55 L145,50 Q145,36 100,32 Q55,36 55,50 Z"
        fill={palette.hairHighlight}
        opacity="0.15"
      />
      {/* Hairline definition */}
      <path
        d="M56,65 Q56,40 100,36 Q144,40 144,65"
        fill="none"
        stroke={palette.hairHighlight}
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Eyes */}
      <ellipse
        cx={80 + eyeShiftX}
        cy="80"
        rx="7"
        ry={blinkOpen * 6 + 1}
        fill="white"
      />
      <ellipse
        cx={120 + eyeShiftX}
        cy="80"
        rx="7"
        ry={blinkOpen * 6 + 1}
        fill="white"
      />
      {/* Pupils */}
      <ellipse
        cx={82 + eyeShiftX}
        cy="80"
        rx="4"
        ry={blinkOpen * 4 + 0.5}
        fill={palette.eyeColor}
      />
      <ellipse
        cx={122 + eyeShiftX}
        cy="80"
        rx="4"
        ry={blinkOpen * 4 + 0.5}
        fill={palette.eyeColor}
      />
      {/* Eye shine */}
      <circle cx={83 + eyeShiftX} cy="78" r="1.8" fill="white" opacity={blinkOpen > 0.3 ? 0.7 : 0} />
      <circle cx={123 + eyeShiftX} cy="78" r="1.8" fill="white" opacity={blinkOpen > 0.3 ? 0.7 : 0} />
      {/* Lower eyelid definition */}
      <path d="M73,84 Q80,87 87,84" fill="none" stroke={palette.skinShadow} strokeWidth="0.8" opacity="0.3" />
      <path d="M113,84 Q120,87 127,84" fill="none" stroke={palette.skinShadow} strokeWidth="0.8" opacity="0.3" />

      {/* Nose - defined, angular */}
      <path d="M98,78 Q95,92 93,96 Q96,99 100,100 Q104,99 107,96 Q105,92 102,78" fill={palette.skinShadow} opacity="0.2" />

      {/* Mouth - thin, professional */}
      <ellipse
        cx="100"
        cy="112"
        rx="13"
        ry={Math.max(0.8, mouthOpen * 8 + 1)}
        fill={palette.lipColor}
      />
      {mouthOpen > 0.15 && (
        <ellipse
          cx="100"
          cy="112"
          rx="9"
          ry={Math.max(0.5, mouthOpen * 6)}
          fill={palette.mouthInner}
        />
      )}

      {/* Eyebrows - sharp, defined */}
      <path d="M67,68 Q80,62 93,67" fill="none" stroke={palette.hair} strokeWidth="3" strokeLinecap="round" />
      <path d="M107,67 Q120,62 133,68" fill="none" stroke={palette.hair} strokeWidth="3" strokeLinecap="round" />

      {/* Cheekbone definition */}
      <path d="M62,92 Q70,96 78,93" fill="none" stroke={palette.skinShadow} strokeWidth="1" opacity="0.2" />
      <path d="M138,92 Q130,96 122,93" fill="none" stroke={palette.skinShadow} strokeWidth="1" opacity="0.2" />
    </g>
  )
}

function NalediAvatar({
  palette,
  mouthOpen,
  blinkOpen,
  eyeShiftX,
  breathing,
}: {
  palette: (typeof AVATAR_PALETTE)['naledi']
  mouthOpen: number
  blinkOpen: number
  eyeShiftX: number
  breathing: number
}) {
  return (
    <g transform={`translate(0, ${breathing})`}>
      {/* Neck */}
      <rect x="90" y="120" width="20" height="22" rx="5" fill={palette.skin} />
      <rect x="90" y="130" width="20" height="14" rx="4" fill={palette.skinShadow} opacity="0.25" />

      {/* Shoulders / Body */}
      <path
        d="M38,170 Q38,145 70,138 L82,135 Q100,132 118,135 L130,138 Q162,145 162,170 L162,190 L38,190 Z"
        fill="#4A2545"
      />
      {/* Neckline detail */}
      <path d="M78,135 Q100,150 122,135" fill={palette.skin} opacity="0.6" />
      {/* Necklace */}
      <path d="M78,135 Q88,145 100,148 Q112,145 122,135" fill="none" stroke="#FFD54F" strokeWidth="1.5" />
      <circle cx="100" cy="148" r="3" fill="#FFD54F" />

      {/* Head - oval face */}
      <ellipse cx="100" cy="82" rx="48" ry="58" fill={palette.skin} />
      {/* Face shadow */}
      <ellipse cx="100" cy="92" rx="44" ry="50" fill={palette.skinShadow} opacity="0.1" />

      {/* Ears */}
      <ellipse cx="52" cy="82" rx="7" ry="11" fill={palette.skin} />
      <ellipse cx="148" cy="82" rx="7" ry="11" fill={palette.skin} />
      {/* Earrings */}
      <circle cx="52" cy="95" r="4" fill={palette.earring!} opacity="0.9" />
      <circle cx="148" cy="95" r="4" fill={palette.earring!} opacity="0.9" />
      <circle cx="52" cy="95" r="2" fill="#FFD54F" opacity="0.6" />
      <circle cx="148" cy="95" r="2" fill="#FFD54F" opacity="0.6" />

      {/* Braided updo hair */}
      <ellipse cx="100" cy="45" rx="52" ry="35" fill={palette.hair} />
      {/* Hair volume on top */}
      <ellipse cx="100" cy="30" rx="40" ry="22" fill={palette.hair} />
      {/* Braid texture lines */}
      <path d="M65,35 Q70,20 80,15" fill="none" stroke={palette.hairHighlight} strokeWidth="1.5" opacity="0.3" />
      <path d="M80,30 Q85,15 95,10" fill="none" stroke={palette.hairHighlight} strokeWidth="1.5" opacity="0.3" />
      <path d="M100,28 Q100,12 105,8" fill="none" stroke={palette.hairHighlight} strokeWidth="1.5" opacity="0.3" />
      <path d="M120,30 Q115,15 110,10" fill="none" stroke={palette.hairHighlight} strokeWidth="1.5" opacity="0.3" />
      <path d="M135,35 Q130,20 125,15" fill="none" stroke={palette.hairHighlight} strokeWidth="1.5" opacity="0.3" />
      {/* Braid bun on top */}
      <ellipse cx="100" cy="18" rx="22" ry="14" fill={palette.hair} />
      <ellipse cx="100" cy="16" rx="18" ry="10" fill={palette.hairHighlight} opacity="0.15" />
      {/* Braid wrap detail */}
      <path d="M85,14 Q92,8 100,6 Q108,8 115,14" fill="none" stroke={palette.hairHighlight} strokeWidth="1" opacity="0.4" />
      <path d="M88,20 Q95,15 100,13 Q105,15 112,20" fill="none" stroke={palette.hairHighlight} strokeWidth="1" opacity="0.3" />
      {/* Side hair */}
      <ellipse cx="54" cy="58" rx="8" ry="18" fill={palette.hair} />
      <ellipse cx="146" cy="58" rx="8" ry="18" fill={palette.hair} />

      {/* Eyes - bright, warm */}
      <ellipse
        cx={82 + eyeShiftX}
        cy="78"
        rx="7"
        ry={blinkOpen * 6 + 1.5}
        fill="white"
      />
      <ellipse
        cx={118 + eyeShiftX}
        cy="78"
        rx="7"
        ry={blinkOpen * 6 + 1.5}
        fill="white"
      />
      {/* Pupils */}
      <ellipse
        cx={83 + eyeShiftX}
        cy="78"
        rx="4"
        ry={blinkOpen * 4 + 0.8}
        fill={palette.eyeColor}
      />
      <ellipse
        cx={119 + eyeShiftX}
        cy="78"
        rx="4"
        ry={blinkOpen * 4 + 0.8}
        fill={palette.eyeColor}
      />
      {/* Eye shine */}
      <circle cx={84 + eyeShiftX} cy="76" r="2" fill="white" opacity={blinkOpen > 0.3 ? 0.8 : 0} />
      <circle cx={120 + eyeShiftX} cy="76" r="2" fill="white" opacity={blinkOpen > 0.3 ? 0.8 : 0} />
      {/* Eyelashes */}
      <path d="M74,75 Q78,73 82,74" fill="none" stroke={palette.hair} strokeWidth="1" opacity="0.5" />
      <path d="M118,74 Q122,73 126,75" fill="none" stroke={palette.hair} strokeWidth="1" opacity="0.5" />

      {/* Nose */}
      <ellipse cx="100" cy="92" rx="5" ry="4" fill={palette.skinShadow} opacity="0.25" />

      {/* Mouth - warm smile */}
      <ellipse
        cx="100"
        cy="106"
        rx="14"
        ry={Math.max(1, mouthOpen * 9 + 2)}
        fill={palette.lipColor}
      />
      {mouthOpen > 0.15 && (
        <ellipse
          cx="100"
          cy="107"
          rx="10"
          ry={Math.max(0.5, mouthOpen * 7)}
          fill={palette.mouthInner}
        />
      )}
      {/* Smile line */}
      <path
        d="M86,104 Q93,101 100,102 Q107,101 114,104"
        fill="none"
        stroke={palette.skinShadow}
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Eyebrows - arched, expressive */}
      <path d="M70,65 Q82,58 94,64" fill="none" stroke={palette.hair} strokeWidth="2" strokeLinecap="round" />
      <path d="M106,64 Q118,58 130,65" fill="none" stroke={palette.hair} strokeWidth="2" strokeLinecap="round" />

      {/* Dimples */}
      <circle cx="72" cy="105" r="2" fill={palette.skinShadow} opacity="0.2" />
      <circle cx="128" cy="105" r="2" fill={palette.skinShadow} opacity="0.2" />
    </g>
  )
}

function JamesAvatar({
  palette,
  mouthOpen,
  blinkOpen,
  eyeShiftX,
  breathing,
}: {
  palette: (typeof AVATAR_PALETTE)['james']
  mouthOpen: number
  blinkOpen: number
  eyeShiftX: number
  breathing: number
}) {
  return (
    <g transform={`translate(0, ${breathing})`}>
      {/* Neck */}
      <rect x="90" y="118" width="20" height="24" rx="5" fill={palette.skin} />
      <rect x="90" y="128" width="20" height="16" rx="4" fill={palette.skinShadow} opacity="0.2" />

      {/* Shoulders / Body - executive suit */}
      <path
        d="M30,170 Q30,140 68,134 L84,131 Q100,128 116,131 L132,134 Q170,140 170,170 L170,190 L30,190 Z"
        fill="#1E293B"
      />
      {/* Suit lapels - wider, more structured */}
      <path d="M84,131 L94,160 L100,157 L106,160 L116,131" fill="#0F172A" />
      {/* Tie */}
      <path d="M96,152 L100,175 L104,152" fill={palette.accentHex} opacity="0.7" />
      {/* Shirt */}
      <path d="M90,131 L95,150 L100,148 L105,150 L110,131" fill="#F1F5F9" />
      {/* Pocket square */}
      <path d="M130,148 L135,142 L140,148" fill={palette.accentHex} opacity="0.5" />

      {/* Head - rectangular, distinguished */}
      <path
        d="M100,26 Q148,26 150,68 L152,85 Q152,112 142,120 Q128,138 100,140 Q72,138 58,120 Q48,112 48,85 L50,68 Q52,26 100,26 Z"
        fill={palette.skin}
      />
      {/* Jaw shadow */}
      <path
        d="M58,120 Q72,136 100,140 Q128,136 142,120 L140,124 Q128,142 100,144 Q72,142 60,124 Z"
        fill={palette.skinShadow}
        opacity="0.15"
      />

      {/* Stubble */}
      <g opacity="0.12">
        <circle cx="80" cy="125" r="0.8" fill={palette.stubble!} />
        <circle cx="84" cy="128" r="0.8" fill={palette.stubble!} />
        <circle cx="88" cy="126" r="0.8" fill={palette.stubble!} />
        <circle cx="92" cy="130" r="0.8" fill={palette.stubble!} />
        <circle cx="96" cy="128" r="0.8" fill={palette.stubble!} />
        <circle cx="100" cy="132" r="0.8" fill={palette.stubble!} />
        <circle cx="104" cy="129" r="0.8" fill={palette.stubble!} />
        <circle cx="108" cy="127" r="0.8" fill={palette.stubble!} />
        <circle cx="112" cy="130" r="0.8" fill={palette.stubble!} />
        <circle cx="116" cy="127" r="0.8" fill={palette.stubble!} />
        <circle cx="120" cy="125" r="0.8" fill={palette.stubble!} />
        <circle cx="86" cy="132" r="0.8" fill={palette.stubble!} />
        <circle cx="94" cy="133" r="0.8" fill={palette.stubble!} />
        <circle cx="106" cy="133" r="0.8" fill={palette.stubble!} />
        <circle cx="114" cy="131" r="0.8" fill={palette.stubble!} />
      </g>

      {/* Ears */}
      <ellipse cx="48" cy="82" rx="7" ry="12" fill={palette.skin} />
      <ellipse cx="48" cy="82" rx="4" ry="8" fill={palette.skinShadow} opacity="0.15" />
      <ellipse cx="152" cy="82" rx="7" ry="12" fill={palette.skin} />
      <ellipse cx="152" cy="82" rx="4" ry="8" fill={palette.skinShadow} opacity="0.15" />

      {/* Side-parted hair */}
      <path
        d="M48,68 Q48,22 100,20 Q152,22 152,68 L152,58 Q152,30 100,28 Q48,30 48,58 Z"
        fill={palette.hair}
      />
      {/* Side part - thicker on left, swept right */}
      <path d="M48,58 Q48,30 82,24 L100,22 Q60,26 52,58 Z" fill={palette.hair} />
      <path d="M52,55 Q55,32 95,26" fill="none" stroke={palette.hairHighlight} strokeWidth="1" opacity="0.3" />
      {/* Hair sweep to right */}
      <path d="M95,26 Q130,28 148,40 L152,55 Q150,35 100,28 Z" fill={palette.hair} opacity="0.9" />
      {/* Side part line */}
      <path d="M82,24 Q85,35 88,45" fill="none" stroke={palette.skinShadow} strokeWidth="0.8" opacity="0.3" />

      {/* Eyes - sharp, piercing */}
      <ellipse
        cx={82 + eyeShiftX}
        cy="80"
        rx="7"
        ry={blinkOpen * 5.5 + 1}
        fill="white"
      />
      <ellipse
        cx={118 + eyeShiftX}
        cy="80"
        rx="7"
        ry={blinkOpen * 5.5 + 1}
        fill="white"
      />
      {/* Pupils */}
      <ellipse
        cx={83 + eyeShiftX}
        cy="80"
        rx="3.5"
        ry={blinkOpen * 3.5 + 0.5}
        fill={palette.eyeColor}
      />
      <ellipse
        cx={119 + eyeShiftX}
        cy="80"
        rx="3.5"
        ry={blinkOpen * 3.5 + 0.5}
        fill={palette.eyeColor}
      />
      {/* Eye shine */}
      <circle cx={84 + eyeShiftX} cy="78" r="1.5" fill="white" opacity={blinkOpen > 0.3 ? 0.7 : 0} />
      <circle cx={120 + eyeShiftX} cy="78" r="1.5" fill="white" opacity={blinkOpen > 0.3 ? 0.7 : 0} />
      {/* Intense brow ridge shadow */}
      <path d="M74,78 Q82,75 90,78" fill="none" stroke={palette.skinShadow} strokeWidth="1" opacity="0.2" />
      <path d="M110,78 Q118,75 126,78" fill="none" stroke={palette.skinShadow} strokeWidth="1" opacity="0.2" />

      {/* Nose - strong, defined */}
      <path d="M97,75 Q94,90 92,96 Q96,100 100,101 Q104,100 108,96 Q106,90 103,75" fill={palette.skinShadow} opacity="0.15" />
      <ellipse cx="100" cy="97" rx="6" ry="4" fill={palette.skinShadow} opacity="0.1" />

      {/* Mouth - thin-lipped, precise */}
      <ellipse
        cx="100"
        cy="114"
        rx="12"
        ry={Math.max(0.8, mouthOpen * 7 + 1)}
        fill={palette.lipColor}
      />
      {mouthOpen > 0.15 && (
        <ellipse
          cx="100"
          cy="114"
          rx="8"
          ry={Math.max(0.5, mouthOpen * 5.5)}
          fill={palette.mouthInner}
        />
      )}
      {/* Lip definition */}
      <path d="M88,113 Q94,110 100,111 Q106,110 112,113" fill="none" stroke={palette.skinShadow} strokeWidth="0.7" opacity="0.35" />

      {/* Eyebrows - sharp, commanding */}
      <path d="M68,66 Q82,58 96,65" fill="none" stroke={palette.hair} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M104,65 Q118,58 132,66" fill="none" stroke={palette.hair} strokeWidth="2.8" strokeLinecap="round" />

      {/* Cheekbone highlight */}
      <path d="M62,90 Q68,94 76,90" fill="none" stroke="white" strokeWidth="1" opacity="0.08" />
      <path d="M138,90 Q132,94 124,90" fill="none" stroke="white" strokeWidth="1" opacity="0.08" />
    </g>
  )
}

function ZaneleAvatar({
  palette,
  mouthOpen,
  blinkOpen,
  eyeShiftX,
  breathing,
}: {
  palette: (typeof AVATAR_PALETTE)['zanele']
  mouthOpen: number
  blinkOpen: number
  eyeShiftX: number
  breathing: number
}) {
  return (
    <g transform={`translate(0, ${breathing})`}>
      {/* Neck */}
      <rect x="90" y="122" width="20" height="20" rx="5" fill={palette.skin} />
      <rect x="90" y="132" width="20" height="12" rx="4" fill={palette.skinShadow} opacity="0.2" />

      {/* Statement necklace */}
      <path d="M72,138 Q80,148 100,152 Q120,148 128,138" fill="none" stroke={palette.necklace!} strokeWidth="3" />
      <circle cx="100" cy="153" r="5" fill={palette.necklace!} />
      <circle cx="85" cy="148" r="3.5" fill={palette.necklace!} opacity="0.8" />
      <circle cx="115" cy="148" r="3.5" fill={palette.necklace!} opacity="0.8" />
      <circle cx="76" cy="142" r="2.5" fill={palette.necklace!} opacity="0.6" />
      <circle cx="124" cy="142" r="2.5" fill={palette.necklace!} opacity="0.6" />

      {/* Shoulders / Body - bold colored top */}
      <path
        d="M35,170 Q35,145 70,138 L82,135 Q100,132 118,135 L130,138 Q165,145 165,170 L165,190 L35,190 Z"
        fill="#7C2D12"
      />
      {/* Neckline */}
      <path d="M80,135 Q100,148 120,135" fill={palette.skin} opacity="0.5" />

      {/* Head - round face */}
      <ellipse cx="100" cy="84" rx="50" ry="56" fill={palette.skin} />
      {/* Face shadow */}
      <ellipse cx="100" cy="94" rx="46" ry="50" fill={palette.skinShadow} opacity="0.1" />

      {/* Ears */}
      <ellipse cx="50" cy="84" rx="7" ry="11" fill={palette.skin} />
      <ellipse cx="150" cy="84" rx="7" ry="11" fill={palette.skin} />

      {/* Afro hairstyle - big, bold, beautiful */}
      <ellipse cx="100" cy="50" rx="68" ry="52" fill={palette.hair} />
      {/* Afro volume */}
      <ellipse cx="100" cy="35" rx="62" ry="42" fill={palette.hair} />
      {/* Afro texture - small circular bumps */}
      <circle cx="45" cy="40" r="12" fill={palette.hair} />
      <circle cx="60" cy="22" r="12" fill={palette.hair} />
      <circle cx="78" cy="10" r="12" fill={palette.hair} />
      <circle cx="100" cy="6" r="12" fill={palette.hair} />
      <circle cx="122" cy="10" r="12" fill={palette.hair} />
      <circle cx="140" cy="22" r="12" fill={palette.hair} />
      <circle cx="155" cy="40" r="12" fill={palette.hair} />
      <circle cx="38" cy="60" r="12" fill={palette.hair} />
      <circle cx="162" cy="60" r="12" fill={palette.hair} />
      <circle cx="35" cy="75" r="10" fill={palette.hair} />
      <circle cx="165" cy="75" r="10" fill={palette.hair} />
      {/* Highlights */}
      <circle cx="65" cy="18" r="8" fill={palette.hairHighlight} opacity="0.15" />
      <circle cx="100" cy="12" r="8" fill={palette.hairHighlight} opacity="0.12" />
      <circle cx="135" cy="18" r="8" fill={palette.hairHighlight} opacity="0.15" />
      <circle cx="50" cy="35" r="6" fill={palette.hairHighlight} opacity="0.1" />
      <circle cx="150" cy="35" r="6" fill={palette.hairHighlight} opacity="0.1" />

      {/* Eyes - bright, energetic */}
      <ellipse
        cx={82 + eyeShiftX}
        cy="80"
        rx="7.5"
        ry={blinkOpen * 6.5 + 1.5}
        fill="white"
      />
      <ellipse
        cx={118 + eyeShiftX}
        cy="80"
        rx="7.5"
        ry={blinkOpen * 6.5 + 1.5}
        fill="white"
      />
      {/* Pupils */}
      <ellipse
        cx={83 + eyeShiftX}
        cy="80"
        rx="4.5"
        ry={blinkOpen * 4.5 + 0.8}
        fill={palette.eyeColor}
      />
      <ellipse
        cx={119 + eyeShiftX}
        cy="80"
        rx="4.5"
        ry={blinkOpen * 4.5 + 0.8}
        fill={palette.eyeColor}
      />
      {/* Eye shine */}
      <circle cx={84 + eyeShiftX} cy="77" r="2.2" fill="white" opacity={blinkOpen > 0.3 ? 0.8 : 0} />
      <circle cx={120 + eyeShiftX} cy="77" r="2.2" fill="white" opacity={blinkOpen > 0.3 ? 0.8 : 0} />
      {/* Eyelashes */}
      <path d="M73,76 Q78,73 84,75" fill="none" stroke={palette.hair} strokeWidth="1.2" opacity="0.5" />
      <path d="M116,75 Q122,73 127,76" fill="none" stroke={palette.hair} strokeWidth="1.2" opacity="0.5" />
      <path d="M74,78 Q78,76 82,77" fill="none" stroke={palette.hair} strokeWidth="0.8" opacity="0.3" />
      <path d="M118,77 Q122,76 126,78" fill="none" stroke={palette.hair} strokeWidth="0.8" opacity="0.3" />

      {/* High cheekbones */}
      <path d="M62,90 Q70,86 80,90" fill="none" stroke={palette.skinShadow} strokeWidth="1" opacity="0.2" />
      <path d="M138,90 Q130,86 120,90" fill="none" stroke={palette.skinShadow} strokeWidth="1" opacity="0.2" />
      <ellipse cx="70" cy="92" rx="8" ry="3" fill={palette.skinShadow} opacity="0.08" />
      <ellipse cx="130" cy="92" rx="8" ry="3" fill={palette.skinShadow} opacity="0.08" />

      {/* Nose */}
      <ellipse cx="100" cy="94" rx="5" ry="4" fill={palette.skinShadow} opacity="0.2" />

      {/* Mouth - bold, expressive */}
      <ellipse
        cx="100"
        cy="108"
        rx="15"
        ry={Math.max(1.2, mouthOpen * 10 + 2)}
        fill={palette.lipColor}
      />
      {mouthOpen > 0.15 && (
        <ellipse
          cx="100"
          cy="109"
          rx="11"
          ry={Math.max(0.5, mouthOpen * 8)}
          fill={palette.mouthInner}
        />
      )}
      {/* Lip definition - full lips */}
      <path
        d="M85,105 Q93,101 100,102 Q107,101 115,105"
        fill="none"
        stroke={palette.skinShadow}
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Lower lip highlight */}
      <ellipse cx="100" cy="111" rx="8" ry="2" fill="white" opacity="0.08" />

      {/* Eyebrows - bold, arched */}
      <path d="M68,64 Q82,56 96,63" fill="none" stroke={palette.hair} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M104,63 Q118,56 132,64" fill="none" stroke={palette.hair} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InterviewAvatar({
  interviewer,
  isSpeaking,
  audioElementRef,
  size = 280,
}: InterviewAvatarProps) {
  // ── Animation state ──
  const [mouthOpen, setMouthOpen] = useState(0)
  const [blinkOpen, setBlinkOpen] = useState(1)
  const [eyeShiftX, setEyeShiftX] = useState(0)
  const [breathing, setBreathing] = useState(0)

  // ── Audio analysis refs ──
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const sourceCreatedRef = useRef(false) // Track if MediaElementSource was already created
  const rafRef = useRef<number>(0)
  const smoothedAmplitudeRef = useRef(0)

  // ── Blink timing refs ──
  const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eyeShiftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const breathingRafRef = useRef<number>(0)

  // ── Palette ──
  const palette = AVATAR_PALETTE[interviewer.id] || AVATAR_PALETTE.kazi

  // ─────────────────────────────────────────────────────────────────────────
  // LIP-SYNC: Web Audio API → AnalyserNode → RMS amplitude → mouthOpen
  // ─────────────────────────────────────────────────────────────────────────

  const connectAudio = useCallback(() => {
    const audioEl = audioElementRef.current
    if (!audioEl) return

    try {
      // Create AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      const ctx = audioContextRef.current

      // Resume if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // IMPORTANT: MediaElementSource can only be created ONCE per audio element
      if (!sourceCreatedRef.current) {
        const source = ctx.createMediaElementSource(audioEl)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8

        source.connect(analyser)
        analyser.connect(ctx.destination)

        sourceRef.current = source
        analyserRef.current = analyser
        sourceCreatedRef.current = true
      }
    } catch (err) {
      console.warn('InterviewAvatar: Failed to connect audio analyser', err)
    }
  }, [audioElementRef])

  const disconnectAudio = useCallback(() => {
    // Don't disconnect the MediaElementSource — it can only be created once.
    // Just stop reading from it by clearing the animation frame.
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  // ── Animation frame loop for reading amplitude ──

  const startLipSyncLoop = useCallback(() => {
    const tick = () => {
      const analyser = analyserRef.current
      if (!analyser) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)

      // Calculate RMS amplitude from frequency data
      let sum = 0
      const len = dataArray.length
      for (let i = 0; i < len; i++) {
        const normalized = dataArray[i] / 255
        sum += normalized * normalized
      }
      const rms = Math.sqrt(sum / len)

      // Smooth the amplitude to avoid jittery movement
      const smoothingFactor = 0.3
      const smoothed = smoothedAmplitudeRef.current * (1 - smoothingFactor) + rms * smoothingFactor
      smoothedAmplitudeRef.current = smoothed

      // Map to mouth open amount (0–1)
      // Boost the mapping for better visual response — quiet speech still shows movement
      const mouthAmount = Math.min(1, smoothed * 5)

      setMouthOpen(mouthAmount)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Start/stop lip sync based on isSpeaking ──

  useEffect(() => {
    if (isSpeaking) {
      connectAudio()
      // Small delay to allow audio element to start playing
      const startDelay = setTimeout(() => {
        startLipSyncLoop()
      }, 100)
      return () => clearTimeout(startDelay)
    } else {
      disconnectAudio()
      // Smoothly close mouth when not speaking
      const closeDelay = setTimeout(() => {
        setMouthOpen(0)
      }, 150)
      return () => clearTimeout(closeDelay)
    }
  }, [isSpeaking, connectAudio, disconnectAudio, startLipSyncLoop])

  // ─────────────────────────────────────────────────────────────────────────
  // IDLE ANIMATIONS: Blinking, eye shifts, breathing
  // ─────────────────────────────────────────────────────────────────────────

  // Blinking
  useEffect(() => {
    const scheduleBlink = () => {
      // Random interval between 2–5 seconds
      const delay = 2000 + Math.random() * 3000
      blinkTimeoutRef.current = setTimeout(() => {
        // Blink: close then open
        setBlinkOpen(0)
        setTimeout(() => {
          setBlinkOpen(1)
          // Occasional double blink
          if (Math.random() < 0.2) {
            setTimeout(() => {
              setBlinkOpen(0)
              setTimeout(() => setBlinkOpen(1), 80)
            }, 120)
          }
        }, 100)
        scheduleBlink()
      }, delay)
    }
    scheduleBlink()

    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current)
    }
  }, [])

  // Eye micro-movements
  useEffect(() => {
    const scheduleEyeShift = () => {
      const delay = 3000 + Math.random() * 4000
      eyeShiftTimeoutRef.current = setTimeout(() => {
        // Shift slightly, then return
        const shift = (Math.random() - 0.5) * 3
        setEyeShiftX(shift)
        setTimeout(() => {
          setEyeShiftX(0)
        }, 800 + Math.random() * 600)
        scheduleEyeShift()
      }, delay)
    }
    scheduleEyeShift()

    return () => {
      if (eyeShiftTimeoutRef.current) clearTimeout(eyeShiftTimeoutRef.current)
    }
  }, [])

  // Breathing / subtle head bob animation
  useEffect(() => {
    let startTime: number | null = null
    const breathCycle = 4000 // 4 seconds per breath cycle

    const animateBreathing = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = (elapsed % breathCycle) / breathCycle

      // Gentle sine wave: subtle up/down oscillation
      const amplitude = isSpeaking ? 1.5 : 0.8
      const offset = Math.sin(progress * Math.PI * 2) * amplitude

      setBreathing(offset)
      breathingRafRef.current = requestAnimationFrame(animateBreathing)
    }

    breathingRafRef.current = requestAnimationFrame(animateBreathing)

    return () => {
      if (breathingRafRef.current) cancelAnimationFrame(breathingRafRef.current)
    }
  }, [isSpeaking])

  // ── Cleanup on unmount ──

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (breathingRafRef.current) cancelAnimationFrame(breathingRafRef.current)
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current)
      if (eyeShiftTimeoutRef.current) clearTimeout(eyeShiftTimeoutRef.current)
      // Don't close AudioContext here — it might be shared
      // The MediaElementSource stays connected for the lifetime of the audio element
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // Select avatar renderer based on interviewer id
  const avatarRenderer = () => {
    switch (interviewer.id) {
      case 'kazi':
        return (
          <KaziAvatar
            palette={AVATAR_PALETTE.kazi}
            mouthOpen={mouthOpen}
            blinkOpen={blinkOpen}
            eyeShiftX={eyeShiftX}
            breathing={breathing}
          />
        )
      case 'thabo':
        return (
          <ThaboAvatar
            palette={AVATAR_PALETTE.thabo}
            mouthOpen={mouthOpen}
            blinkOpen={blinkOpen}
            eyeShiftX={eyeShiftX}
            breathing={breathing}
          />
        )
      case 'naledi':
        return (
          <NalediAvatar
            palette={AVATAR_PALETTE.naledi}
            mouthOpen={mouthOpen}
            blinkOpen={blinkOpen}
            eyeShiftX={eyeShiftX}
            breathing={breathing}
          />
        )
      case 'james':
        return (
          <JamesAvatar
            palette={AVATAR_PALETTE.james}
            mouthOpen={mouthOpen}
            blinkOpen={blinkOpen}
            eyeShiftX={eyeShiftX}
            breathing={breathing}
          />
        )
      case 'zanele':
        return (
          <ZaneleAvatar
            palette={AVATAR_PALETTE.zanele}
            mouthOpen={mouthOpen}
            blinkOpen={blinkOpen}
            eyeShiftX={eyeShiftX}
            breathing={breathing}
          />
        )
      default:
        return (
          <KaziAvatar
            palette={AVATAR_PALETTE.kazi}
            mouthOpen={mouthOpen}
            blinkOpen={blinkOpen}
            eyeShiftX={eyeShiftX}
            breathing={breathing}
          />
        )
    }
  }

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: size, height: size }}
    >
      {/* Glow / Aura effect when speaking */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.04, 1],
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{
              background: `radial-gradient(circle, ${palette.accentGlow} 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Background pulse ring */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            <motion.div
              className="absolute rounded-full"
              style={{
                width: size * 0.85,
                height: size * 0.85,
                top: size * 0.05,
                left: size * 0.075,
                border: `2px solid ${palette.accentHex}`,
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.02, 0.98] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main avatar SVG */}
      <motion.svg
        viewBox="0 0 200 240"
        width={size}
        height={size * 0.86}
        className="relative z-10"
        style={{ overflow: 'visible' }}
        animate={isSpeaking ? { x: [0, -0.5, 0.5, 0] } : {}}
        transition={
          isSpeaking
            ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        <defs>
          {/* Background gradient */}
          <linearGradient id={`bg-grad-${interviewer.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.bgStart} />
            <stop offset="100%" stopColor={palette.bgEnd} />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`glow-${interviewer.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shadow filter */}
          <filter id={`shadow-${interviewer.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.2)" />
          </filter>
        </defs>

        {/* Background circle */}
        <motion.circle
          cx="100"
          cy="95"
          r="88"
          fill={`url(#bg-grad-${interviewer.id})`}
          filter={`url(#shadow-${interviewer.id})`}
          animate={
            isSpeaking
              ? { scale: [1, 1.015, 1], opacity: [0.9, 1, 0.9] }
              : { scale: 1, opacity: 0.9 }
          }
          transition={
            isSpeaking
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.5 }
          }
          style={{ transformOrigin: '100px 95px' }}
        />

        {/* Speaking glow ring */}
        {isSpeaking && (
          <motion.circle
            cx="100"
            cy="95"
            r="90"
            fill="none"
            stroke={palette.accentHex}
            strokeWidth="2"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            filter={`url(#glow-${interviewer.id})`}
          />
        )}

        {/* Avatar body - clip to circle */}
        <clipPath id={`avatar-clip-${interviewer.id}`}>
          <circle cx="100" cy="95" r="86" />
        </clipPath>

        <g clipPath={`url(#avatar-clip-${interviewer.id})`}>
          {avatarRenderer()}
        </g>
      </motion.svg>

      {/* Name badge */}
      <motion.div
        className="relative z-10 -mt-4 flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm"
        style={{
          background: palette.badgeBg,
          border: `1px solid ${palette.badgeBorder}40`,
          boxShadow: isSpeaking ? `0 0 20px ${palette.accentGlow}` : 'none',
        }}
        animate={isSpeaking ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={
          isSpeaking
            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        {/* Speaking indicator dot */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.span
              className="relative flex h-2.5 w-2.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: palette.accentHex }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: palette.accentHex }}
              />
            </motion.span>
          )}
        </AnimatePresence>
        <span
          className="text-sm font-semibold"
          style={{ color: palette.badgeText }}
        >
          {interviewer.name}
        </span>
        <span className="text-xs opacity-50" style={{ color: palette.badgeText }}>
          {interviewer.title}
        </span>
      </motion.div>
    </div>
  )
}
