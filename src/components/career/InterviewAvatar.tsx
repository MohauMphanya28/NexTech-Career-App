'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

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
    image: string
  }
  isSpeaking: boolean
  audioElementRef: React.RefObject<HTMLAudioElement | null>
  size?: number // default 280
}

// ─── Color Mappings ───────────────────────────────────────────────────────────

const AVATAR_PALETTE: Record<
  string,
  {
    accentHex: string
    accentGlow: string
    bgStart: string
    bgEnd: string
    badgeBg: string
    badgeBorder: string
    badgeText: string
    ringColor1: string
    ringColor2: string
    waveColor: string
  }
> = {
  kazi: {
    accentHex: '#14B8A6',
    accentGlow: 'rgba(20,184,166,0.35)',
    bgStart: '#0D9488',
    bgEnd: '#06B6D4',
    badgeBg: 'rgba(20,184,166,0.2)',
    badgeBorder: '#14B8A6',
    badgeText: '#14B8A6',
    ringColor1: '#14B8A6',
    ringColor2: '#06B6D4',
    waveColor: '#14B8A6',
  },
  thabo: {
    accentHex: '#94A3B8',
    accentGlow: 'rgba(148,163,184,0.35)',
    bgStart: '#64748B',
    bgEnd: '#475569',
    badgeBg: 'rgba(148,163,184,0.2)',
    badgeBorder: '#94A3B8',
    badgeText: '#94A3B8',
    ringColor1: '#94A3B8',
    ringColor2: '#64748B',
    waveColor: '#94A3B8',
  },
  naledi: {
    accentHex: '#F59E0B',
    accentGlow: 'rgba(245,158,11,0.35)',
    bgStart: '#F59E0B',
    bgEnd: '#F97316',
    badgeBg: 'rgba(245,158,11,0.2)',
    badgeBorder: '#F59E0B',
    badgeText: '#F59E0B',
    ringColor1: '#F59E0B',
    ringColor2: '#F97316',
    waveColor: '#F59E0B',
  },
  james: {
    accentHex: '#8B5CF6',
    accentGlow: 'rgba(139,92,246,0.35)',
    bgStart: '#8B5CF6',
    bgEnd: '#7C3AED',
    badgeBg: 'rgba(139,92,246,0.2)',
    badgeBorder: '#8B5CF6',
    badgeText: '#8B5CF6',
    ringColor1: '#8B5CF6',
    ringColor2: '#7C3AED',
    waveColor: '#8B5CF6',
  },
  zanele: {
    accentHex: '#F43F5E',
    accentGlow: 'rgba(244,63,94,0.35)',
    bgStart: '#F43F5E',
    bgEnd: '#EC4899',
    badgeBg: 'rgba(244,63,94,0.2)',
    badgeBorder: '#F43F5E',
    badgeText: '#F43F5E',
    ringColor1: '#F43F5E',
    ringColor2: '#EC4899',
    waveColor: '#F43F5E',
  },
}

// ─── Audio Wave Visualizer Bars ───────────────────────────────────────────────

function AudioWaveBars({ isActive, color, barCount = 7 }: { isActive: boolean; color: string; barCount?: number }) {
  return (
    <div className="flex items-center justify-center gap-[3px]">
      {[...Array(barCount)].map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: color }}
          animate={
            isActive
              ? {
                  height: [8, 16 + i * 3, 10, 22 - i * 2, 8],
                }
              : { height: 6 }
          }
          transition={
            isActive
              ? {
                  duration: 0.7 + i * 0.08,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}

// ─── Speaking Pulse Ring ──────────────────────────────────────────────────────

function SpeakingPulseRing({ size, color1, color2 }: { size: number; color1: string; color2: string }) {
  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 4}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth="2.5"
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 8}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth="1"
        animate={{
          opacity: [0.1, 0.4, 0.1],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      />
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InterviewAvatar({
  interviewer,
  isSpeaking,
  audioElementRef,
  size = 280,
}: InterviewAvatarProps) {
  // ── Audio analysis state ──
  const [amplitude, setAmplitude] = useState(0)

  // ── Audio analysis refs ──
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const sourceCreatedRef = useRef(false)
  const rafRef = useRef<number>(0)
  const smoothedAmplitudeRef = useRef(0)

  // ── Palette ──
  const palette = AVATAR_PALETTE[interviewer.id] || AVATAR_PALETTE.kazi

  // Image size (circular crop area)
  const imageSize = size * 0.88

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIO ANALYSIS: Web Audio API → AnalyserNode → RMS amplitude
  // ─────────────────────────────────────────────────────────────────────────

  const connectAudio = useCallback(() => {
    const audioEl = audioElementRef.current
    if (!audioEl) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      const ctx = audioContextRef.current

      if (ctx.state === 'suspended') {
        ctx.resume()
      }

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

      // Smooth the amplitude
      const smoothingFactor = 0.3
      const smoothed = smoothedAmplitudeRef.current * (1 - smoothingFactor) + rms * smoothingFactor
      smoothedAmplitudeRef.current = smoothed

      // Map to 0-1 range
      const mapped = Math.min(1, smoothed * 5)
      setAmplitude(mapped)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Start/stop lip sync based on isSpeaking ──

  useEffect(() => {
    if (isSpeaking) {
      connectAudio()
      const startDelay = setTimeout(() => {
        startLipSyncLoop()
      }, 100)
      return () => clearTimeout(startDelay)
    } else {
      disconnectAudio()
      const closeDelay = setTimeout(() => {
        setAmplitude(0)
      }, 150)
      return () => clearTimeout(closeDelay)
    }
  }, [isSpeaking, connectAudio, disconnectAudio, startLipSyncLoop])

  // ── Cleanup on unmount ──

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: size }}
    >
      {/* ── Avatar Container (circle with image) ── */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* ── Outer Glow / Aura when speaking ── */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: -size * 0.075,
                background: `radial-gradient(circle, ${palette.accentGlow} 0%, transparent 70%)`,
                filter: 'blur(25px)',
              }}
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
            />
          )}
        </AnimatePresence>

        {/* ── Speaking Pulse Rings ── */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SpeakingPulseRing
                size={size}
                color1={palette.ringColor1}
                color2={palette.ringColor2}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main 3D Face Image ── */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center"
          animate={isSpeaking ? {
            scale: [1, 1.01 + amplitude * 0.015, 1],
          } : { scale: 1 }}
          transition={
            isSpeaking
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        >
          <div
            className="relative"
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: '50%',
              padding: '3px',
              background: isSpeaking
                ? `linear-gradient(135deg, ${palette.ringColor1}, ${palette.ringColor2})`
                : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            }}
          >
            <div
              className="relative size-full overflow-hidden"
              style={{ borderRadius: '50%' }}
            >
              <Image
                src={interviewer.image}
                alt={`${interviewer.name} - ${interviewer.title}`}
                fill
                className="object-cover object-center"
                priority
                sizes={`${Math.round(imageSize)}px`}
              />

              {/* ── Speaking overlay: subtle lower-face glow ── */}
              <AnimatePresence>
                {isSpeaking && amplitude > 0.05 && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      borderRadius: '50%',
                      background: `radial-gradient(ellipse 60% 35% at 50% 70%, ${palette.accentGlow} 0%, transparent 70%)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: amplitude * 0.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>

              {/* ── Idle: subtle breathing overlay ── */}
              {!isSpeaking && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)',
                  }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Audio Wave Visualizer (below face) ── */}
      <div className="relative z-10 -mt-5">
        <AudioWaveBars
          isActive={isSpeaking}
          color={palette.waveColor}
          barCount={9}
        />
      </div>

      {/* ── Name Badge ── */}
      <motion.div
        className="relative z-10 mt-1 flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm"
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
