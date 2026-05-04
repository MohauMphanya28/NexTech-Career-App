'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Send,
  SkipForward,
  RotateCcw,
  ChevronRight,
  Star,
  MessageSquare,
  Target,
  Award,
  ArrowLeft,
  TrendingUp,
  Volume2,
  VolumeX,
  Keyboard,
  Phone,
  PhoneOff,
  Clock,
  Headphones,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// ─── Types ───────────────────────────────────────────────────────────────────

type InterviewMode = 'setup' | 'interview' | 'results'
type InputMode = 'voice' | 'text'

interface ChatMessage {
  id: string
  role: 'ai' | 'user' | 'feedback'
  content: string
  timestamp: number
  scores?: {
    relevance: number
    clarity: number
    confidence: number
  }
  audioUrl?: string
}

interface LiveScores {
  relevance: number
  clarity: number
  confidence: number
}

interface SessionResults {
  overallScore: number
  relevance: number
  clarity: number
  confidence: number
  feedbackSummary: string
  improvementTips: string[]
  closingMessage: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Government',
  'Education',
  'Engineering',
  'Creative',
  'General',
]

const QUESTION_COUNTS = [3, 5, 7, 10]

// Maximum recording duration in seconds (ASR API limit is 30s, we use 25s for safety)
const MAX_RECORDING_SECONDS = 25

const INDUSTRY_ICONS: Record<string, string> = {
  Technology: '💻',
  Finance: '🏦',
  Healthcare: '🏥',
  Retail: '🛍️',
  Government: '🏛️',
  Education: '📚',
  Engineering: '⚙️',
  Creative: '🎨',
  General: '🌟',
}

// ─── Interviewer Avatars ─────────────────────────────────────────────────

interface InterviewerProfile {
  id: string
  name: string
  title: string
  description: string
  voice: string
  speed: number
  volume: number
  accentColor: string
  accentBg: string
  accentBorder: string
  avatarGradient: string
  initials: string
  personality: string
}

const INTERVIEWERS: InterviewerProfile[] = [
  {
    id: 'kazi',
    name: 'Kazi',
    title: 'The Coach',
    description: 'Warm and natural. The most human-sounding coach for building real confidence.',
    voice: 'douji',
    speed: 1.3,
    volume: 1.0,
    accentColor: 'text-teal-400',
    accentBg: 'bg-teal-400/15',
    accentBorder: 'border-teal-400/60',
    avatarGradient: 'from-teal-400 to-cyan-400',
    initials: 'KZ',
    personality: 'You are Kazi, a supportive and encouraging interview coach who sounds like a real person, not a robot. You speak naturally, using contractions and occasional filler words like "Hmm" and "Right". You ask clear questions, give warm and constructive feedback in a conversational way, and celebrate improvements. You often add words of encouragement like "Great start!" or "You\'re making good progress!" Keep your spoken responses concise — 2-3 short sentences of feedback, then ask the next question.',
  },
  {
    id: 'thabo',
    name: 'Thabo',
    title: 'The Corporate',
    description: 'Professional and measured. A deep, calm voice for realistic corporate interviews.',
    voice: 'xiaochen',
    speed: 1.2,
    volume: 0.9,
    accentColor: 'text-slate-300',
    accentBg: 'bg-slate-400/15',
    accentBorder: 'border-slate-400/60',
    avatarGradient: 'from-slate-300 to-slate-500',
    initials: 'TH',
    personality: 'You are Thabo, a senior corporate HR director who speaks with authority and deliberation. You use measured, professional language with occasional phrases like "I see" and "Let me push back on that." You ask sharp, probing questions that challenge candidates to think deeply. You give direct, no-nonsense feedback focused on professionalism and business impact. Keep your spoken responses concise — 2-3 short sentences of feedback, then ask the next question.',
  },
  {
    id: 'naledi',
    name: 'Naledi',
    title: 'The Friendly',
    description: 'Warm and conversational. Makes interviews feel like a relaxed chat over coffee.',
    voice: 'tongtong',
    speed: 1.25,
    volume: 1.0,
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-400/15',
    accentBorder: 'border-amber-400/60',
    avatarGradient: 'from-amber-400 to-orange-400',
    initials: 'NL',
    personality: 'You are Naledi, a warm and friendly interviewer who puts candidates at ease with your natural, flowing conversation style. You use phrases like "Oh, that\'s interesting!" and "Tell me more about that..." You ask questions in a conversational, story-telling way. Your feedback is gentle and supportive, like a mentor who genuinely cares. Keep your spoken responses concise — 2-3 short sentences of feedback, then ask the next question naturally.',
  },
  {
    id: 'james',
    name: 'James',
    title: 'The Executive',
    description: 'Sharp and commanding. A British-accented voice for high-stakes executive interviews.',
    voice: 'jam',
    speed: 1.35,
    volume: 1.1,
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-400/15',
    accentBorder: 'border-violet-400/60',
    avatarGradient: 'from-violet-400 to-purple-500',
    initials: 'JM',
    personality: 'You are James, a seasoned C-suite executive with a British accent who conducts high-stakes interviews with crisp authority. You use phrases like "Quite" and "I\'d challenge you on that." You ask demanding, strategic questions that test leadership thinking. Your feedback is analytical and focused on executive presence. Keep your spoken responses concise and commanding — 1-2 sharp sentences of feedback, then directly ask the next question.',
  },
  {
    id: 'zanele',
    name: 'Zanele',
    title: 'The Motivator',
    description: 'Energetic and expressive. A passionate voice that fires you up to do your best.',
    voice: 'luodo',
    speed: 1.4,
    volume: 1.2,
    accentColor: 'text-rose-400',
    accentBg: 'bg-rose-400/15',
    accentBorder: 'border-rose-400/60',
    avatarGradient: 'from-rose-400 to-pink-500',
    initials: 'ZN',
    personality: 'You are Zanele, a passionate and energetic career coach who speaks with fire and conviction! You use powerful phrases like "I love that!" and "Now we\'re talking!" and "You\'ve got so much potential!" You push candidates to dig deeper and aim higher. Your feedback is enthusiastic and action-oriented. Keep your spoken responses punchy and high-energy — 2 short sentences of feedback with excitement, then fire the next question!',
  },
]

// ─── Animation Variants ─────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const messageVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

const scoreRevealVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── WAV Encoding Utilities ─────────────────────────────────────────────────
// Convert browser-recorded audio to WAV format for the ASR API
// (The ASR API requires WAV or WebM, but format detection from base64 can fail.
//  Converting to WAV ensures reliable format recognition.)

function writeStringToDataView(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

function encodeAudioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = 1 // Mono for ASR
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  // Get first channel only (mono — sufficient for ASR)
  const channelData = audioBuffer.getChannelData(0)
  const dataLength = channelData.length * 2 // 16-bit = 2 bytes per sample
  const headerLength = 44
  const totalLength = headerLength + dataLength

  const arrayBuffer = new ArrayBuffer(totalLength)
  const view = new DataView(arrayBuffer)

  // WAV header
  writeStringToDataView(view, 0, 'RIFF')
  view.setUint32(4, totalLength - 8, true)
  writeStringToDataView(view, 8, 'WAVE')
  writeStringToDataView(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, format, true) // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true) // byte rate
  view.setUint16(32, numChannels * 2, true) // block align
  view.setUint16(34, bitDepth, true)
  writeStringToDataView(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Write audio samples
  let offset = 44
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
    offset += 2
  }

  return arrayBuffer
}

async function convertBlobToWavBase64(audioBlob: Blob): Promise<string> {
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioContext = new AudioContext({ sampleRate: 16000 }) // 16kHz is ideal for ASR
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const wavBuffer = encodeAudioBufferToWav(audioBuffer)
    // Convert ArrayBuffer to base64
    const bytes = new Uint8Array(wavBuffer)
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length))
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }
    return btoa(binary)
  } finally {
    await audioContext.close()
  }
}

// ─── Helper: Score Color ─────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 7) return 'text-teal-400'
  if (score >= 4) return 'text-yellow-400'
  return 'text-red-400'
}

function getScoreBgColor(score: number): string {
  if (score >= 7) return 'bg-teal-400'
  if (score >= 4) return 'bg-yellow-400'
  return 'bg-red-400'
}

function getScoreInterpretation(score: number): { label: string; color: string } {
  if (score >= 9) return { label: 'Exceptional', color: 'text-teal-400' }
  if (score >= 7) return { label: 'Strong Performer', color: 'text-teal-400' }
  if (score >= 4) return { label: 'Good Foundation, Keep Practicing', color: 'text-yellow-400' }
  return { label: 'Needs Significant Improvement', color: 'text-red-400' }
}

// ─── Circular Progress Component ─────────────────────────────────────────────

function CircularScore({
  score,
  size = 160,
  strokeWidth = 10,
  animate = true,
}: {
  score: number
  size?: number
  strokeWidth?: number
  animate?: boolean
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 10) * circumference
  const center = size / 2

  const color = score >= 7 ? '#14b8a6' : score >= 4 ? '#facc15' : '#f87171'
  const glowColor = score >= 7 ? 'oklch(0.72 0.15 180 / 30%)' : score >= 4 ? 'oklch(0.85 0.15 90 / 30%)' : 'oklch(0.65 0.2 25 / 30%)'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="oklch(0.2 0.02 260)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : undefined}
          animate={animate ? { strokeDashoffset: offset } : undefined}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={!animate ? { strokeDashoffset: offset } : undefined}
          filter={`drop-shadow(0 0 8px ${glowColor})`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-bold"
          style={{ color }}
          initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
          animate={animate ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {score.toFixed(1)}
        </motion.span>
        <span className="text-xs text-muted-foreground">out of 10</span>
      </div>
    </div>
  )
}

// ─── Score Bar Component ─────────────────────────────────────────────────────

function ScoreBar({
  label,
  score,
  icon,
  delay = 0,
}: {
  label: string
  score: number
  icon: React.ReactNode
  delay?: number
}) {
  const fillColor = score >= 7 ? 'bg-teal-400' : score >= 4 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <motion.div
      className="flex flex-col gap-1.5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-foreground/90">{label}</span>
        </div>
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}/10
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={`h-full rounded-full ${fillColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, delay: delay + 0.3, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      className="flex items-start gap-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border-l-2 border-teal-400 bg-secondary/60 px-4 py-3">
        <div className="flex gap-1">
          <span className="typing-dot size-2 rounded-full bg-teal-400" />
          <span className="typing-dot size-2 rounded-full bg-teal-400" />
          <span className="typing-dot size-2 rounded-full bg-teal-400" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Voice Wave Animation ────────────────────────────────────────────────────

function VoiceWaveVisualizer({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px]">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-teal-400"
          animate={
            isActive
              ? {
                  height: [8, 20 + i * 4, 12, 24 - i * 2, 8],
                }
              : { height: 8 }
          }
          transition={
            isActive
              ? {
                  duration: 0.8 + i * 0.1,
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

// ─── AI Speaking Indicator ───────────────────────────────────────────────────

function AiSpeakingIndicator() {
  return (
    <div className="flex items-center justify-center gap-1">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="size-2 rounded-full bg-teal-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Recording Timer ─────────────────────────────────────────────────────────

function RecordingTimer({ startTime }: { startTime: number | null }) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup on unmount or startTime change
  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [startTime])

  // Reset when no startTime
  if (!startTime) {
    return <span className="font-mono text-sm tabular-nums text-red-400">00:00</span>
  }

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <span className="font-mono text-sm tabular-nums text-red-400">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InterviewCoach() {
  const {
    interviewSession,
    setInterviewSession,
    interviewHistory,
    setInterviewHistory,
    setIsLoading,
    aiTyping,
    setAiTyping,
  } = useAppStore()

  // Local state
  const [mode, setMode] = useState<InterviewMode>('setup')
  const [selectedIndustry, setSelectedIndustry] = useState('Technology')
  const [questionCount, setQuestionCount] = useState(5)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0)
  const [liveScores, setLiveScores] = useState<LiveScores>({ relevance: 0, clarity: 0, confidence: 0 })
  const [results, setResults] = useState<SessionResults | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showReview, setShowReview] = useState(false)

  // Voice state
  const [inputMode, setInputMode] = useState<InputMode>('voice')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [micPermission, setMicPermission] = useState<PermissionState | 'unknown'>('unknown')
  const [isMuted, setIsMuted] = useState(false)
  const [interviewDuration, setInterviewDuration] = useState(0)

  // Interviewer state
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile>(INTERVIEWERS[0])

  // Audio unlock ref for autoplay policy
  const audioContextRef = useRef<AudioContext | null>(null)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const interviewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref for sendAnswer to avoid stale closures in mediaRecorder.onstop
  const sendAnswerRef = useRef<(text: string) => Promise<void>>(async () => {})
  // Ref for isMuted to avoid stale closures in playTTS
  const isMutedRef = useRef(false)

  // ─── Check Mic Permission ────────────────────────────────────────────

  useEffect(() => {
    async function checkPermission() {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setMicPermission(result.state)
        result.onchange = () => setMicPermission(result.state)
      } catch {
        setMicPermission('unknown')
      }
    }
    checkPermission()
  }, [])

  // ─── Interview Timer ─────────────────────────────────────────────────

  useEffect(() => {
    if (mode === 'interview') {
      interviewTimerRef.current = setInterval(() => {
        setInterviewDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current)
        interviewTimerRef.current = null
      }
    }
    return () => {
      if (interviewTimerRef.current) clearInterval(interviewTimerRef.current)
    }
  }, [mode])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, aiTyping, scrollToBottom])

  // Focus input when in text mode
  useEffect(() => {
    if (mode === 'interview' && !isSending && inputMode === 'text') {
      inputRef.current?.focus()
    }
  }, [mode, isSending, inputMode])

  // ─── Unlock Browser Audio ────────────────────────────────────────────
  // Browsers block audio.play() in callbacks unless unlocked by a user gesture.
  // We unlock on the "Start Interview" button click so all subsequent TTS plays work.

  const unlockAudio = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const ctx = new AudioContext()
        audioContextRef.current = ctx
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
      // Play a silent buffer to fully unlock the audio pipeline
      const buffer = audioContextRef.current.createBuffer(1, 1, 22050)
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffer
      source.connect(audioContextRef.current.destination)
      source.start(0)
    } catch (e) {
      console.warn('Audio unlock failed:', e)
    }
  }, [])

  // ─── Play TTS Audio ──────────────────────────────────────────────────

  const playTTS = useCallback(async (text: string): Promise<void> => {
    // If user has muted the AI, skip TTS playback but continue the conversation
    if (isMutedRef.current) return

    try {
      setIsAiSpeaking(true)

      // Stop any currently playing audio — null the ref BEFORE pause so
      // the onended/onerror handlers know it was intentionally stopped
      if (currentAudioRef.current) {
        const oldAudio = currentAudioRef.current
        currentAudioRef.current = null
        oldAudio.pause()
      }

      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedInterviewer.voice,
          speed: selectedInterviewer.speed,
          volume: selectedInterviewer.volume,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('TTS API error:', res.status, errorData)
        setIsAiSpeaking(false)
        return // Graceful degradation — interview continues without audio
      }

      const audioBlob = await res.blob()

      // Validate the blob is actual audio data
      if (audioBlob.size < 100) {
        console.error('TTS returned empty/too-small audio blob:', audioBlob.size, 'bytes')
        setIsAiSpeaking(false)
        return
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      // Slightly speed up playback for more natural, human-like speech pace
      audio.playbackRate = 1.05
      currentAudioRef.current = audio

      audio.onended = () => {
        // Only update state if this is still the active audio
        if (currentAudioRef.current === audio) {
          setIsAiSpeaking(false)
          currentAudioRef.current = null
        }
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        // Only update state if this is still the active audio
        if (currentAudioRef.current === audio) {
          console.error('Audio playback error')
          setIsAiSpeaking(false)
          currentAudioRef.current = null
        }
        URL.revokeObjectURL(audioUrl)
      }

      // Ensure audio context is active (handles browser autoplay policy)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // play() returns a Promise — catch AbortError which occurs when pause()
      // is called before the play promise resolves (e.g., user stops audio or
      // a new TTS call interrupts this one). This is expected, not an error.
      try {
        await audio.play()
      } catch (playError: unknown) {
        const err = playError as DOMException
        if (err.name === 'AbortError') {
          // Audio was interrupted by pause() — this is normal (e.g., user started recording)
          // Don't update state since the audio was intentionally stopped
          return
        }
        // Re-throw unexpected errors
        throw playError
      }
    } catch (error) {
      console.error('TTS playback error:', error)
      setIsAiSpeaking(false)
    }
  }, [selectedInterviewer])

  // ─── Stop TTS Audio ──────────────────────────────────────────────────

  const stopTTS = useCallback(() => {
    if (currentAudioRef.current) {
      // Null the ref BEFORE pause() so the onended/onerror handlers
      // know the audio was intentionally stopped and skip state updates.
      // This prevents the "play() interrupted by pause()" AbortError.
      const audio = currentAudioRef.current
      currentAudioRef.current = null
      audio.pause()
    }
    setIsAiSpeaking(false)
  }, [])

  // ─── Replay AI Message Audio ─────────────────────────────────────────

  const handleReplayAudio = useCallback((msg: ChatMessage) => {
    if (isAiSpeaking) {
      stopTTS()
      return
    }
    playTTS(msg.content)
  }, [isAiSpeaking, playTTS, stopTTS])

  // Keep isMutedRef in sync with isMuted state
  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  // ─── Voice Recording ─────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        },
      })

      // Stop TTS if it's playing
      stopTTS()

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/ogg',
      })

      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks on the stream
        stream.getTracks().forEach((track) => track.stop())

        // Clear the auto-stop timer
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current)
          recordingTimeoutRef.current = null
        }

        if (audioChunksRef.current.length === 0) {
          setIsTranscribing(false)
          return
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType })
        setIsTranscribing(true)

        try {
          // Convert recorded audio to WAV format for reliable ASR format detection
          const wavBase64 = await convertBlobToWavBase64(audioBlob)

          const asrRes = await fetch('/api/ai/asr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: wavBase64,
              audioFormat: 'audio/wav',
            }),
          })

          const asrData = await asrRes.json()

          if (asrData.success && asrData.transcription && !asrData.isEmpty) {
            setCurrentInput(asrData.transcription)
            // Auto-send the transcribed answer using the ref to avoid stale closure
            await sendAnswerRef.current(asrData.transcription)
          } else if (asrData.error) {
            // ASR returned an error message - show it to the user
            console.error('ASR error:', asrData.error)
            const errorMsg: ChatMessage = {
              id: `system-asr-error-${Date.now()}`,
              role: 'feedback',
              content: `Could not transcribe your voice: ${asrData.error}. Please try again or switch to text input.`,
              timestamp: Date.now(),
            }
            setMessages((prev) => [...prev, errorMsg])
            setIsTranscribing(false)
          } else {
            // No speech detected
            const noSpeechMsg: ChatMessage = {
              id: `system-no-speech-${Date.now()}`,
              role: 'feedback',
              content: 'No speech was detected. Please try recording again — speak clearly into your microphone.',
              timestamp: Date.now(),
            }
            setMessages((prev) => [...prev, noSpeechMsg])
            setIsTranscribing(false)
          }
        } catch (error) {
          console.error('ASR/Conversion error:', error)
          const errorMsg: ChatMessage = {
            id: `system-error-${Date.now()}`,
            role: 'feedback',
            content: 'Voice transcription failed. Please try again or switch to text input.',
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, errorMsg])
          setIsTranscribing(false)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(500) // Collect data every 500ms
      setIsRecording(true)
      setRecordingStartTime(Date.now())
      setMicPermission('granted')

      // Auto-stop recording after MAX_RECORDING_SECONDS (ASR API has 30s limit)
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          // Directly stop the recorder instead of calling stopRecording() to avoid circular deps
          if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current)
            recordingTimeoutRef.current = null
          }
          mediaRecorderRef.current.stop()
          setIsRecording(false)
          setRecordingStartTime(null)
        }
      }, MAX_RECORDING_SECONDS * 1000)
    } catch (error) {
      console.error('Microphone access error:', error)
      setMicPermission('denied')
      // Fall back to text mode
      setInputMode('text')
    }
  }, [stopTTS])

  const stopRecording = useCallback(() => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setRecordingStartTime(null)
  }, [])

  // ─── Start Interview ─────────────────────────────────────────────────

  const handleStartInterview = async () => {
    // Unlock browser audio on user gesture BEFORE any TTS calls
    unlockAudio()

    setIsLoading(true)
    setAiTyping(true)
    setMode('interview')
    setMessages([])
    setLiveScores({ relevance: 0, clarity: 0, confidence: 0 })
    setCurrentQuestionNum(1)
    setInterviewDuration(0)

    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          industry: selectedIndustry,
          totalQuestions: questionCount,
          interviewerPersonality: selectedInterviewer.personality,
          interviewerName: selectedInterviewer.name,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const welcomeMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: data.question,
          timestamp: Date.now(),
        }
        setMessages([welcomeMsg])

        // Auto-speak the first question immediately — no delay for responsiveness
        playTTS(data.question)

        // Create session in store
        setInterviewSession({
          id: `session-${Date.now()}`,
          type: 'mock',
          industry: selectedIndustry,
          messages: [{ role: 'ai', content: data.question, timestamp: Date.now() }],
          score: 0,
          confidence: 0,
          clarity: 0,
          relevance: 0,
          completed: false,
          currentQuestion: 1,
          totalQuestions: questionCount,
        })
      }
    } catch (error) {
      console.error('Failed to start interview:', error)
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: "Hi there! I'm your interview coach. Let's start — tell me about yourself and why you're interested in this field.",
        timestamp: Date.now(),
      }
      setMessages([errorMsg])
      playTTS(errorMsg.content)
    } finally {
      setIsLoading(false)
      setAiTyping(false)
    }
  }

  // ─── Send Answer (shared by text & voice) ────────────────────────────

  const sendAnswer = useCallback(async (answerText: string) => {
    const answer = answerText.trim()
    if (!answer) return

    setIsSending(true)
    setCurrentInput('')
    setIsTranscribing(false)

    // Stop any TTS playback
    stopTTS()

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: answer,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setAiTyping(true)

    // Track whether we're in the "next question" path to manage finally block
    let isWaitingForNextQuestion = false

    try {
      // Use a ref for currentQuestionNum to avoid stale closures
      const questionNum = currentQuestionNum

      // Build conversation history for context continuity
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role === 'feedback' ? 'ai' as const : msg.role as 'ai' | 'user',
        content: msg.content,
      }))

      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          industry: selectedIndustry,
          questionNumber: questionNum,
          answer,
          totalQuestions: questionCount,
          interviewerPersonality: selectedInterviewer.personality,
          interviewerName: selectedInterviewer.name,
          conversationHistory,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const scores = data.scores || { relevance: 5, clarity: 5, confidence: 5 }

        // Update live scores (running average) — single source of truth
        setLiveScores((prev) => {
          const count = questionNum
          if (count <= 0) return { relevance: scores.relevance, clarity: scores.clarity, confidence: scores.confidence }
          return {
            relevance: Math.round(((prev.relevance * (count - 1)) + scores.relevance) / count * 10) / 10,
            clarity: Math.round(((prev.clarity * (count - 1)) + scores.clarity) / count * 10) / 10,
            confidence: Math.round(((prev.confidence * (count - 1)) + scores.confidence) / count * 10) / 10,
          }
        })

        // The feedback from the API is now conversational (spokenText format)
        // It already includes the reaction + brief feedback + transition to next question,
        // so speaking it gives the most natural conversation flow.
        const feedbackText = data.feedback || 'Good point.'
        const feedbackMsg: ChatMessage = {
          id: `feedback-${Date.now()}`,
          role: 'feedback',
          content: feedbackText,
          timestamp: Date.now(),
          scores,
        }
        setMessages((prev) => [...prev, feedbackMsg])

        // Check if interview is complete
        if (data.isComplete || questionNum >= questionCount) {
          // Interview complete - add closing message
          const closingContent = data.closingMessage || "Great job completing the interview! You've shown real effort. Let me compile your results..."
          const closingMsg: ChatMessage = {
            id: `ai-closing-${Date.now()}`,
            role: 'ai',
            content: closingContent,
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, closingMsg])

          // Speak closing message immediately
          playTTS(closingContent)

          // Calculate final scores from the updated live scores
          // The live scores have already been updated above, so use functional state
          setLiveScores((currentLiveScores) => {
            const overallScore = Math.round(
              ((currentLiveScores.relevance + currentLiveScores.clarity + currentLiveScores.confidence) / 3) * 10
            ) / 10

            // Delay showing results for dramatic effect
            setTimeout(() => {
              const sessionResults: SessionResults = {
                overallScore,
                ...currentLiveScores,
                feedbackSummary: data.closingMessage || 'You completed the interview with solid effort. Keep practicing to improve your scores!',
                improvementTips: generateImprovementTips(currentLiveScores),
                closingMessage: data.closingMessage || '',
              }
              setResults(sessionResults)
              setMode('results')

              // Update store session
              if (interviewSession) {
                const completedSession = {
                  ...interviewSession,
                  score: overallScore,
                  relevance: currentLiveScores.relevance,
                  clarity: currentLiveScores.clarity,
                  confidence: currentLiveScores.confidence,
                  completed: true,
                }
                setInterviewSession(completedSession)
                setInterviewHistory([...interviewHistory, completedSession])
              }
            }, 2500)

            return currentLiveScores // Don't modify — just read for final calculation
          })
        } else {
          // Speak the full conversational feedback immediately (includes reaction + transition + question)
          // This is more natural than speaking just the next question separately
          playTTS(feedbackText)

          // Add next question to chat display after a brief pause for visual flow
          isWaitingForNextQuestion = true
          setTimeout(() => {
            const nextQuestion = data.nextQuestion || 'Can you tell me more about your experience?'
            const nextMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              role: 'ai',
              content: nextQuestion,
              timestamp: Date.now(),
            }
            setMessages((prev) => [...prev, nextMsg])
            setCurrentQuestionNum((prev) => prev + 1)
            setAiTyping(false)
            setIsSending(false)
          }, 400)
          return
        }
      }
    } catch (error) {
      console.error('Failed to evaluate answer:', error)
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: "No worries — let's keep going. Can you describe a challenge you've overcome and how you handled it?",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMsg])
      playTTS(errorMsg.content)
    } finally {
      // Only clear loading states if we're NOT waiting for the next question timeout
      // (the timeout callback will handle clearing them)
      if (!isWaitingForNextQuestion) {
        setAiTyping(false)
        setIsSending(false)
      }
    }
  }, [currentQuestionNum, selectedIndustry, questionCount, interviewSession, interviewHistory, playTTS, stopTTS, setInterviewSession, setInterviewHistory, setAiTyping, setIsLoading])

  // Keep the ref updated with the latest sendAnswer to avoid stale closures
  useEffect(() => {
    sendAnswerRef.current = sendAnswer
  }, [sendAnswer])

  // ─── Send from Text Input ────────────────────────────────────────────

  const handleSendAnswer = () => {
    const answer = currentInput.trim()
    if (!answer) return
    sendAnswer(answer)
  }

  // ─── Handle Mic Press (Push-to-Talk) ─────────────────────────────────

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // ─── Skip Question ───────────────────────────────────────────────────

  const handleSkipQuestion = async () => {
    if (isSending) return

    stopTTS()

    const skipMsg: ChatMessage = {
      id: `user-skip-${Date.now()}`,
      role: 'user',
      content: '[Skipped this question]',
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, skipMsg])

    // Move to next question or complete
    if (currentQuestionNum >= questionCount) {
      // End interview with current scores
      const overallScore = Math.round(
        ((liveScores.relevance + liveScores.clarity + liveScores.confidence) / 3) * 10
      ) / 10

      const sessionResults: SessionResults = {
        overallScore,
        ...liveScores,
        feedbackSummary: "You've completed the interview. Some questions were skipped — try to answer all questions next time for a more accurate assessment.",
        improvementTips: ['Try to answer every question, even briefly', 'Practice answering under time pressure', 'Review common interview questions in your industry'],
        closingMessage: 'Interview completed. Keep practicing!',
      }
      setResults(sessionResults)
      setMode('results')
    } else {
      // Ask next question via API
      setIsSending(true)
      setAiTyping(true)

      try {
        const res = await fetch('/api/ai/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            industry: selectedIndustry,
            totalQuestions: questionCount,
            interviewerPersonality: selectedInterviewer.personality,
            interviewerName: selectedInterviewer.name,
          }),
        })
        const data = await res.json()
        if (data.success) {
          setTimeout(() => {
            const nextMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              role: 'ai',
              content: data.question,
              timestamp: Date.now(),
            }
            setMessages((prev) => [...prev, nextMsg])
            setCurrentQuestionNum((prev) => prev + 1)
            playTTS(data.question)
          }, 200)
        }
      } catch {
        const nextMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: "That's okay, let's move on. Tell me about a time you demonstrated leadership or initiative.",
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, nextMsg])
        setCurrentQuestionNum((prev) => prev + 1)
      } finally {
        setAiTyping(false)
        setIsSending(false)
      }
    }
  }

  // ─── End Interview Early ─────────────────────────────────────────────

  const handleEndInterview = () => {
    stopTTS()
    stopRecording()

    const overallScore = Math.round(
      ((liveScores.relevance + liveScores.clarity + liveScores.confidence) / 3) * 10
    ) / 10

    const sessionResults: SessionResults = {
      overallScore: overallScore || 0,
      relevance: liveScores.relevance || 0,
      clarity: liveScores.clarity || 0,
      confidence: liveScores.confidence || 0,
      feedbackSummary: liveScores.relevance > 0
        ? "You ended the interview early. Keep practicing to build your confidence and improve your scores!"
        : "The interview was ended before any questions were answered. Try again when you're ready!",
      improvementTips: liveScores.relevance > 0
        ? generateImprovementTips(liveScores)
        : ['Practice with a shorter session first', 'Try the 3-question option to build confidence'],
      closingMessage: 'Interview ended.',
    }
    setResults(sessionResults)
    setMode('results')
  }

  // ─── Generate Improvement Tips ───────────────────────────────────────

  function generateImprovementTips(scores: LiveScores): string[] {
    const tips: string[] = []

    if (scores.relevance < 7) {
      tips.push('Focus on directly answering the question asked — avoid going off-topic')
      tips.push('Use the STAR method: Situation, Task, Action, Result to structure your answers')
    }
    if (scores.clarity < 7) {
      tips.push('Practice speaking more concisely — aim for clear, structured responses')
      tips.push('Start with your main point, then provide supporting details')
    }
    if (scores.confidence < 7) {
      tips.push('Use stronger language — replace "I think" with "I believe" or "I am confident"')
      tips.push('Highlight specific achievements with measurable results to sound more assured')
    }

    if (tips.length === 0) {
      tips.push('You performed exceptionally well — keep refining your storytelling ability')
      tips.push('Try more challenging industry-specific questions to push your limits')
    }

    return tips
  }

  // ─── Keyboard Handler ────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendAnswer()
    }
  }

  // ─── Reset ───────────────────────────────────────────────────────────

  const handleReset = () => {
    stopTTS()
    stopRecording()
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setMode('setup')
    setMessages([])
    setCurrentInput('')
    setCurrentQuestionNum(0)
    setLiveScores({ relevance: 0, clarity: 0, confidence: 0 })
    setResults(null)
    setShowReview(false)
    setInterviewSession(null)
    setIsRecording(false)
    setIsAiSpeaking(false)
    setIsTranscribing(false)
    setInterviewDuration(0)
    setRecordingStartTime(null)
  }

  // ─── Format Duration ─────────────────────────────────────────────────

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // ─── Character Count Feedback ────────────────────────────────────────

  const charCount = currentInput.length
  const charFeedback =
    charCount === 0
      ? ''
      : charCount < 200
        ? `${charCount} chars — aim for 200-500`
        : charCount <= 500
          ? `${charCount} chars — great length!`
          : `${charCount} chars — consider being more concise`

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  // ─── Setup Screen ────────────────────────────────────────────────────

  if (mode === 'setup') {
    return (
      <motion.div
        className="flex min-h-screen flex-col gap-6 px-4 pb-28 pt-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header variants={fadeInUp} className="flex items-center gap-3">
          <button
            onClick={() => useAppStore.getState().setCurrentView('dashboard')}
            className="flex size-10 items-center justify-center rounded-xl bg-secondary/60 transition-colors hover:bg-secondary"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-5 text-foreground/70" />
          </button>
          <div>
            <h1 className="gradient-text text-2xl font-bold tracking-tight">
              Interview Coach
            </h1>
            <p className="text-sm text-muted-foreground">
              Voice-powered virtual interview practice
            </p>
          </div>
        </motion.header>

        {/* Voice Interview Feature Card */}
        <motion.div
          variants={fadeInUp}
          className="glass-strong relative overflow-hidden rounded-2xl p-5"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-4 -left-4 size-20 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-400/15">
              <Headphones className="size-6 text-teal-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-foreground">Virtual Voice Interview</h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                Have a real verbal conversation with your AI interviewer. Speak your answers
                out loud and get real-time feedback — just like a real interview!
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="border-0 bg-teal-400/15 text-teal-400 text-[10px]">
                  <Mic className="mr-1 size-3" /> Voice Input
                </Badge>
                <Badge className="border-0 bg-cyan-400/15 text-cyan-400 text-[10px]">
                  <Volume2 className="mr-1 size-3" /> AI Speaks
                </Badge>
                <Badge className="border-0 bg-purple-400/15 text-purple-400 text-[10px]">
                  <Keyboard className="mr-1 size-3" /> Type Option
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Industry Selector */}
        <motion.section variants={fadeInUp}>
          <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Industry / Job Type
          </label>
          <div className="flex flex-wrap gap-2.5">
            {INDUSTRIES.map((industry) => {
              const isSelected = selectedIndustry === industry
              return (
                <motion.button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`
                    flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium
                    transition-all duration-200 active:scale-[0.97]
                    ${
                      isSelected
                        ? 'border border-teal-400/60 bg-teal-400/15 text-teal-400 shadow-sm shadow-teal-400/10'
                        : 'border border-border/50 bg-secondary/40 text-foreground/70 hover:border-border hover:bg-secondary/60'
                    }
                  `}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{INDUSTRY_ICONS[industry]}</span>
                  <span>{industry}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* Question Count */}
        <motion.section variants={fadeInUp}>
          <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Number of Questions
          </label>
          <div className="flex gap-3">
            {QUESTION_COUNTS.map((count) => {
              const isSelected = questionCount === count
              return (
                <motion.button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`
                    flex size-14 items-center justify-center rounded-2xl text-lg font-bold
                    transition-all duration-200 active:scale-[0.95]
                    ${
                      isSelected
                        ? 'border border-teal-400/60 bg-teal-400/15 text-teal-400 shadow-sm shadow-teal-400/10'
                        : 'border border-border/50 bg-secondary/40 text-foreground/60 hover:border-border hover:bg-secondary/60'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {count}
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* Interviewer Selection */}
        <motion.section variants={fadeInUp}>
          <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Choose Your Interviewer
          </label>
          <div className="flex flex-col gap-3">
            {INTERVIEWERS.map((interviewer) => {
              const isSelected = selectedInterviewer.id === interviewer.id
              return (
                <motion.button
                  key={interviewer.id}
                  onClick={() => setSelectedInterviewer(interviewer)}
                  className={`
                    flex items-center gap-4 rounded-2xl p-4 text-left
                    transition-all duration-200 active:scale-[0.98]
                    ${
                      isSelected
                        ? `border ${interviewer.accentBorder} ${interviewer.accentBg} shadow-sm`
                        : 'border border-border/50 bg-secondary/40 hover:border-border hover:bg-secondary/60'
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Avatar */}
                  <div className={`
                    flex size-12 shrink-0 items-center justify-center rounded-full
                    bg-gradient-to-br ${interviewer.avatarGradient}
                    shadow-lg
                  `}>
                    <span className="text-sm font-bold text-white">{interviewer.initials}</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isSelected ? interviewer.accentColor : 'text-foreground'}`}>
                        {interviewer.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{interviewer.title}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-foreground/60 line-clamp-2">{interviewer.description}</p>
                  </div>
                  {/* Check mark */}
                  {isSelected && (
                    <div className={`flex size-6 shrink-0 items-center justify-center rounded-full ${interviewer.accentBg}`}>
                      <svg className={`size-4 ${interviewer.accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* Start Button */}
        <motion.section variants={fadeInUp} className="pt-2">
          <motion.button
            onClick={handleStartInterview}
            className="glow-teal-sm flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-500 px-6 py-4 text-lg font-bold text-white transition-all duration-200 hover:bg-teal-400 active:scale-[0.98]"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Phone className="size-5" />
            Start Voice Interview
          </motion.button>
        </motion.section>

        {/* Previous Sessions */}
        {interviewHistory.length > 0 && (
          <motion.section variants={fadeInUp}>
            <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Previous Sessions
            </label>
            <div className="flex flex-col gap-3">
              {interviewHistory.slice(-3).reverse().map((session, i) => (
                <motion.div
                  key={session.id}
                  className="glass flex items-center justify-between rounded-2xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-teal-400/15">
                      <MessageSquare className="size-5 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {session.industry} Interview
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.totalQuestions} questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-teal-400">
                      {session.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">/10</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Encouragement */}
        <motion.div
          variants={fadeInUp}
          className="glass relative overflow-hidden rounded-2xl p-4"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-teal-400/10 blur-2xl" />
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-400/15">
              <Star className="size-4 text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Pro Tip
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                The AI interviewer will speak questions aloud. Answer with your voice for
                the most realistic practice, or type if you prefer. Headphones recommended!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ─── Review Answers (within results) ─────────────────────────────────

  if (showReview && results) {
    const qaPairs: { question: string; answer: string; feedback: string; scores?: { relevance: number; clarity: number; confidence: number } }[] = []
    let currentQ = ''
    let currentA = ''
    let currentFeedback = ''
    let currentScores: { relevance: number; clarity: number; confidence: number } | undefined

    messages.forEach((msg) => {
      if (msg.role === 'ai' && msg.id.includes('closing') === false) {
        if (currentQ) {
          qaPairs.push({ question: currentQ, answer: currentA, feedback: currentFeedback, scores: currentScores })
        }
        currentQ = msg.content
        currentA = ''
        currentFeedback = ''
        currentScores = undefined
      } else if (msg.role === 'user') {
        currentA = msg.content
      } else if (msg.role === 'feedback') {
        currentFeedback = msg.content
        currentScores = msg.scores
      }
    })
    if (currentQ) {
      qaPairs.push({ question: currentQ, answer: currentA, feedback: currentFeedback, scores: currentScores })
    }

    return (
      <motion.div
        className="flex min-h-screen flex-col gap-4 px-4 pb-28 pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReview(false)}
            className="flex size-10 items-center justify-center rounded-xl bg-secondary/60 transition-colors hover:bg-secondary"
            aria-label="Back to results"
          >
            <ArrowLeft className="size-5 text-foreground/70" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Review Answers</h1>
            <p className="text-sm text-muted-foreground">{qaPairs.length} questions answered</p>
          </div>
        </div>

        {/* Q&A Pairs */}
        <div className="flex flex-col gap-4">
          {qaPairs.map((pair, i) => (
            <motion.div
              key={i}
              className="glass overflow-hidden rounded-2xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Question */}
              <div className="border-b border-border/30 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge className="bg-teal-400/15 text-teal-400 border-0 text-[10px]">
                    Q{i + 1}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Question</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{pair.question}</p>
              </div>

              {/* Answer */}
              <div className="border-b border-border/30 bg-secondary/20 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-0 text-[10px]">
                    You
                  </Badge>
                  <span className="text-xs text-muted-foreground">Your Answer</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {pair.answer || '(Skipped)'}
                </p>
              </div>

              {/* Feedback */}
              {pair.feedback && (
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Star className="size-3.5 text-yellow-400" />
                    <span className="text-xs font-medium text-muted-foreground">Feedback</span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-foreground/80">
                    {pair.feedback}
                  </p>
                  {pair.scores && (
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className={`text-sm font-bold ${getScoreColor(pair.scores.relevance)}`}>
                          {pair.scores.relevance}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Relevance</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${getScoreColor(pair.scores.clarity)}`}>
                          {pair.scores.clarity}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Clarity</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${getScoreColor(pair.scores.confidence)}`}>
                          {pair.scores.confidence}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  // ─── Results Screen ──────────────────────────────────────────────────

  if (mode === 'results' && results) {
    const interpretation = getScoreInterpretation(results.overallScore)

    return (
      <motion.div
        className="flex min-h-screen flex-col gap-6 px-4 pb-28 pt-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header variants={fadeInUp} className="flex items-center gap-3">
          <button
            onClick={() => useAppStore.getState().setCurrentView('dashboard')}
            className="flex size-10 items-center justify-center rounded-xl bg-secondary/60 transition-colors hover:bg-secondary"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-5 text-foreground/70" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview Results</h1>
            <p className="text-sm text-muted-foreground">
              {selectedIndustry} • {questionCount} questions • {formatDuration(interviewDuration)}
            </p>
          </div>
        </motion.header>

        {/* Overall Score */}
        <motion.section
          variants={scoreRevealVariants}
          className="flex flex-col items-center gap-3 py-4"
        >
          <CircularScore score={results.overallScore} size={180} strokeWidth={12} />
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className={`text-lg font-bold ${interpretation.color}`}>
              {interpretation.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Overall Performance
            </p>
          </motion.div>
        </motion.section>

        {/* Score Breakdown */}
        <motion.section variants={fadeInUp} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Score Breakdown
          </h2>
          <Card className="glass border-0 p-5">
            <div className="flex flex-col gap-5">
              <ScoreBar
                label="Relevance"
                score={results.relevance}
                icon={<Target className="size-4 text-teal-400" />}
                delay={0.2}
              />
              <ScoreBar
                label="Clarity"
                score={results.clarity}
                icon={<MessageSquare className="size-4 text-cyan-400" />}
                delay={0.4}
              />
              <ScoreBar
                label="Confidence"
                score={results.confidence}
                icon={<TrendingUp className="size-4 text-purple-400" />}
                delay={0.6}
              />
            </div>
          </Card>
        </motion.section>

        {/* Score Interpretation Guide */}
        <motion.section variants={fadeInUp}>
          <Card className="border-0 bg-secondary/40 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground/80">
              Score Guide
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { range: '9-10', label: 'Exceptional', color: 'text-teal-400', dot: 'bg-teal-400' },
                { range: '7-8', label: 'Strong Performer', color: 'text-teal-400', dot: 'bg-teal-400' },
                { range: '4-6', label: 'Good Foundation, Keep Practicing', color: 'text-yellow-400', dot: 'bg-yellow-400' },
                { range: '0-3', label: 'Needs Significant Improvement', color: 'text-red-400', dot: 'bg-red-400' },
              ].map((item) => (
                <div key={item.range} className="flex items-center gap-2.5">
                  <div className={`size-2 rounded-full ${item.dot}`} />
                  <span className="text-xs font-mono text-muted-foreground">{item.range}</span>
                  <span className={`text-xs font-medium ${item.color}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Feedback Summary */}
        <motion.section variants={fadeInUp}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Feedback Summary
          </h2>
          <Card className="glass border-0 p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-400/15">
                <Award className="size-4 text-teal-400" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">
                {results.feedbackSummary}
              </p>
            </div>
          </Card>
        </motion.section>

        {/* Improvement Tips */}
        <motion.section variants={fadeInUp}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Improvement Tips
          </h2>
          <div className="flex flex-col gap-3">
            {results.improvementTips.map((tip, i) => (
              <motion.div
                key={i}
                className="glass flex items-start gap-3 rounded-2xl p-4"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-teal-400/15">
                  <ChevronRight className="size-4 text-teal-400" />
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Action Buttons */}
        <motion.section variants={fadeInUp} className="flex flex-col gap-3 pt-2">
          <motion.button
            onClick={handleReset}
            className="glow-teal-sm flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-500 px-6 py-4 text-base font-bold text-white transition-all hover:bg-teal-400 active:scale-[0.98]"
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="size-4" />
            Practice Again
          </motion.button>

          <motion.button
            onClick={() => setShowReview(true)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/50 bg-secondary/40 px-6 py-4 text-base font-medium text-foreground/80 transition-all hover:bg-secondary/60 active:scale-[0.98]"
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare className="size-4" />
            Review Answers
          </motion.button>

          <motion.button
            onClick={() => useAppStore.getState().setCurrentView('dashboard')}
            className="flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </motion.button>
        </motion.section>
      </motion.div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INTERVIEW MODE — Virtual Interview UI
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <motion.div
      className="flex min-h-screen flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ─── Top Bar: Virtual Interview Header ─────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-border/30 bg-background/90 px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative flex size-10 items-center justify-center rounded-2xl ${selectedInterviewer.accentBg}`}>
              <span className={`text-sm font-bold ${selectedInterviewer.accentColor}`}>{selectedInterviewer.initials}</span>
              {isAiSpeaking && (
                <motion.div
                  className={`absolute -right-0.5 -top-0.5 size-3 rounded-full ${selectedInterviewer.accentColor.replace('text-', 'bg-')}`}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedInterviewer.name} — {selectedIndustry}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Q{currentQuestionNum}/{questionCount}</span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDuration(interviewDuration)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border-0 bg-teal-400/15 text-teal-400">
              <Target className="mr-1 size-3" />
              {Math.round(((liveScores.relevance + liveScores.clarity + liveScores.confidence) / 3) * 10) / 10} avg
            </Badge>
            {/* End Call Button */}
            <motion.button
              onClick={handleEndInterview}
              className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 text-red-400 transition-colors hover:bg-red-500/25"
              whileTap={{ scale: 0.9 }}
              aria-label="End interview"
            >
              <PhoneOff className="size-4" />
            </motion.button>
          </div>
        </div>

        {/* Live Score Bars */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span className="w-20 text-[11px] font-medium text-muted-foreground">Relevance</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={`h-full rounded-full ${getScoreBgColor(liveScores.relevance)}`}
                animate={{ width: `${liveScores.relevance * 10}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className={`w-8 text-right text-xs font-bold ${getScoreColor(liveScores.relevance)}`}>
              {liveScores.relevance > 0 ? liveScores.relevance.toFixed(1) : '-'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-[11px] font-medium text-muted-foreground">Clarity</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={`h-full rounded-full ${getScoreBgColor(liveScores.clarity)}`}
                animate={{ width: `${liveScores.clarity * 10}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className={`w-8 text-right text-xs font-bold ${getScoreColor(liveScores.clarity)}`}>
              {liveScores.clarity > 0 ? liveScores.clarity.toFixed(1) : '-'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-[11px] font-medium text-muted-foreground">Confidence</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={`h-full rounded-full ${getScoreBgColor(liveScores.confidence)}`}
                animate={{ width: `${liveScores.confidence * 10}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className={`w-8 text-right text-xs font-bold ${getScoreColor(liveScores.confidence)}`}>
              {liveScores.confidence > 0 ? liveScores.confidence.toFixed(1) : '-'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <Progress
            value={(currentQuestionNum / questionCount) * 100}
            className="h-1 bg-secondary"
          />
        </div>
      </div>

      {/* ─── AI Speaking Overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {isAiSpeaking && (
          <motion.div
            className="glass-strong flex items-center justify-center gap-3 px-4 py-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`flex size-8 items-center justify-center rounded-full ${selectedInterviewer.accentBg}`}>
              <Volume2 className={`size-4 ${selectedInterviewer.accentColor}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-semibold ${selectedInterviewer.accentColor}`}>{selectedInterviewer.name} is speaking...</span>
              <AiSpeakingIndicator />
            </div>
            <motion.button
              onClick={stopTTS}
              className="ml-auto flex size-8 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground"
              whileTap={{ scale: 0.9 }}
              aria-label="Stop speaking"
            >
              <VolumeX className="size-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Transcribing Overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {isTranscribing && (
          <motion.div
            className="flex items-center justify-center gap-3 bg-purple-400/5 px-4 py-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex size-8 items-center justify-center rounded-full bg-purple-400/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Mic className="size-4 text-purple-400" />
            </motion.div>
            <span className="text-xs font-semibold text-purple-400">Transcribing your answer...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Chat Messages ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => {
              // AI message (left-aligned)
              if (msg.role === 'ai') {
                return (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-start gap-2"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-400">
                      <span className="text-[10px] font-bold text-white">{selectedInterviewer.initials}</span>
                    </div>
                    <div className={`max-w-[80%] rounded-2xl rounded-tl-sm border-l-2 ${selectedInterviewer.accentBorder} bg-secondary/60 px-4 py-3`}>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {msg.content}
                      </p>
                      {/* Replay button */}
                      <button
                        onClick={() => handleReplayAudio(msg)}
                        className={`mt-2 flex items-center gap-1.5 text-[11px] ${selectedInterviewer.accentColor}/70 transition-colors hover:${selectedInterviewer.accentColor}`}
                        aria-label={isAiSpeaking ? 'Stop audio' : 'Replay audio'}
                      >
                        {isAiSpeaking ? (
                          <>
                            <VolumeX className="size-3" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="size-3" />
                            Replay
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              }

              // User message (right-aligned)
              if (msg.role === 'user') {
                return (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-start justify-end gap-2"
                  >
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary/20 px-4 py-3">
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {msg.content}
                      </p>
                    </div>
                  </motion.div>
                )
              }

              // Feedback message (centered)
              if (msg.role === 'feedback') {
                return (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center gap-2 py-1"
                  >
                    <div className={`flex max-w-[90%] items-start gap-2 rounded-2xl ${selectedInterviewer.accentBg} px-4 py-3 ring-1 ring-${selectedInterviewer.accentColor.replace('text-', '')}/20`}>
                      <Star className="mt-0.5 size-4 shrink-0 text-yellow-400" />
                      <div>
                        <p className="text-xs leading-relaxed text-foreground/75">
                          {msg.content}
                        </p>
                        {msg.scores && (
                          <div className="mt-2 flex gap-3">
                            <span className={`text-[10px] font-bold ${getScoreColor(msg.scores.relevance)}`}>
                              R:{msg.scores.relevance}
                            </span>
                            <span className={`text-[10px] font-bold ${getScoreColor(msg.scores.clarity)}`}>
                              C:{msg.scores.clarity}
                            </span>
                            <span className={`text-[10px] font-bold ${getScoreColor(msg.scores.confidence)}`}>
                              Co:{msg.scores.confidence}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              }

              return null
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {aiTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ─── Bottom Control Area ────────────────────────────────────────── */}
      <div className="sticky bottom-0 border-t border-border/30 bg-background/95 px-4 pb-20 pt-3 backdrop-blur-md">

        {/* Mode Toggle */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-secondary/60 p-1">
            <button
              onClick={() => setInputMode('voice')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                inputMode === 'voice'
                  ? 'bg-teal-400/20 text-teal-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mic className="size-3" />
              Voice
            </button>
            <button
              onClick={() => { setInputMode('text'); stopRecording(); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                inputMode === 'text'
                  ? 'bg-teal-400/20 text-teal-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Keyboard className="size-3" />
              Type
            </button>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="recording-dot size-2 rounded-full bg-red-400" />
              <RecordingTimer startTime={recordingStartTime} />
              <span className="text-xs text-muted-foreground">/ 0:{MAX_RECORDING_SECONDS}</span>
            </div>
          )}
        </div>

        {/* Voice Mode Controls */}
        {inputMode === 'voice' ? (
          <div className="flex items-center justify-center gap-4">
            {/* Skip Button */}
            <motion.button
              onClick={handleSkipQuestion}
              disabled={isSending || aiTyping || isTranscribing}
              className="flex size-12 items-center justify-center rounded-xl bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
              whileTap={{ scale: 0.9 }}
              aria-label="Skip this question"
            >
              <SkipForward className="size-5" />
            </motion.button>

            {/* Main Mic Button */}
            <motion.button
              onClick={handleMicPress}
              disabled={isSending || aiTyping || isTranscribing || isAiSpeaking}
              className={`relative flex size-20 items-center justify-center rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : isTranscribing
                    ? 'bg-purple-500/80 text-white'
                    : 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-400'
              } disabled:opacity-30 disabled:shadow-none`}
              whileTap={{ scale: 0.92 }}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {/* Recording pulse rings */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-400/40"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-400/20"
                    animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}

              {/* Transcribing spinner */}
              {isTranscribing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Mic className="size-8" />
                </motion.div>
              ) : isRecording ? (
                <div className="flex flex-col items-center gap-1">
                  <MicOff className="size-7" />
                  <VoiceWaveVisualizer isActive={isRecording} />
                </div>
              ) : (
                <Mic className="size-8" />
              )}
            </motion.button>

            {/* Mute/Speaker Toggle — controls whether AI auto-speaks */}
            <motion.button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex size-12 items-center justify-center rounded-xl transition-colors ${
                isMuted
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label={isMuted ? 'Unmute AI speaker' : 'Mute AI speaker'}
            >
              {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </motion.button>
          </div>
        ) : (
          /* Text Mode Controls */
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                disabled={isSending || aiTyping}
                className="rounded-xl border-border bg-secondary py-3 pr-4 pl-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary"
                aria-label="Type your interview answer"
              />
            </div>

            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                onClick={handleSendAnswer}
                disabled={!currentInput.trim() || isSending || aiTyping}
                size="icon"
                className="size-12 rounded-xl bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-40"
                aria-label="Send answer"
              >
                <Send className="size-5" />
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                onClick={handleSkipQuestion}
                disabled={isSending || aiTyping}
                variant="ghost"
                size="icon"
                className="size-12 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Skip this question"
              >
                <SkipForward className="size-5" />
              </Button>
            </motion.div>
          </div>
        )}

        {/* Voice Mode Hint */}
        {inputMode === 'voice' && !isRecording && !isTranscribing && !isAiSpeaking && (
          <motion.p
            className="mt-2 text-center text-[11px] text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Tap the microphone to speak your answer
          </motion.p>
        )}

        {/* Character counter for text mode */}
        {inputMode === 'text' && charCount > 0 && (
          <motion.p
            className={`mt-2 text-[11px] ${
              charCount < 200
                ? 'text-muted-foreground'
                : charCount <= 500
                  ? 'text-teal-400'
                  : 'text-yellow-400'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {charFeedback}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
