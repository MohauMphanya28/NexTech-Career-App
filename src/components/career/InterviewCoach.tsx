'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
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
  Video,
  VideoOff,
  MessageCircle,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import InterviewAvatar from '@/components/career/InterviewAvatar'
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
  image: string
}

const INTERVIEWERS: InterviewerProfile[] = [
  {
    id: 'kazi',
    name: 'Kazi',
    title: 'The Coach',
    description: 'Warm and natural with a Cape Town accent. Uses SA slang like "ja" and "lekker" while coaching you to success.',
    voice: 'xiaochen',
    speed: 1.15,
    volume: 0.95,
    accentColor: 'text-teal-400',
    accentBg: 'bg-teal-400/15',
    accentBorder: 'border-teal-400/60',
    avatarGradient: 'from-teal-400 to-cyan-400',
    initials: 'KZ',
    personality: 'You are Kazi, a South African interview coach from Cape Town with a warm, slightly melodic accent. You speak in a relaxed, encouraging tone typical of South African English — using words like "ja", "lekker", "sho", and "eish" naturally. You say things like "Ja, that\'s a solid answer!" and "Lekker, let\'s keep going!" You use contractions and filler words like "Hmm" and "Right" to sound human. You give warm, constructive feedback and celebrate improvements. Keep your spoken responses concise — 2-3 short sentences of feedback, then ask the next question.',
    image: '/interviewers/kazi.png',
  },
  {
    id: 'thabo',
    name: 'Thabo',
    title: 'The Corporate',
    description: 'Professional and measured with a Jozi corporate accent. Direct, no-nonsense, and sharp.',
    voice: 'xiaochen',
    speed: 1.0,
    volume: 0.85,
    accentColor: 'text-slate-300',
    accentBg: 'bg-slate-400/15',
    accentBorder: 'border-slate-400/60',
    avatarGradient: 'from-slate-300 to-slate-500',
    initials: 'TH',
    personality: 'You are Thabo, a senior corporate HR director from Johannesburg with a deep, measured South African accent. You speak with deliberate authority, using corporate South African English with phrases like "I see", "Let me push back on that", "Absolutely not acceptable", and "Shaping up nicely." You pronounce words crisply and use a slightly formal register. You ask sharp, probing questions and give direct, no-nonsense feedback focused on business impact. Keep your spoken responses concise — 2-3 short sentences of feedback, then ask the next question.',
    image: '/interviewers/thabo.png',
  },
  {
    id: 'naledi',
    name: 'Naledi',
    title: 'The Friendly',
    description: 'Warm and conversational with a Durban accent. Says "hey?" and "shame" — makes interviews feel like coffee chat.',
    voice: 'tongtong',
    speed: 1.1,
    volume: 1.0,
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-400/15',
    accentBorder: 'border-amber-400/60',
    avatarGradient: 'from-amber-400 to-orange-400',
    initials: 'NL',
    personality: 'You are Naledi, a warm and friendly interviewer from Durban with a soft, musical South African Indian accent. You speak with a gentle, flowing rhythm and use expressions like "Oh shame, that\'s interesting!" and "Tell me more about that, hey?" and "Brilliant, absolutely brilliant!" You put candidates at ease with your natural, storytelling conversation style. Your feedback is gentle and supportive, like a caring mentor. Keep your spoken responses concise — 2-3 short sentences of feedback, then ask the next question naturally.',
    image: '/interviewers/naledi.png',
  },
  {
    id: 'james',
    name: 'James',
    title: 'The Executive',
    description: 'Sharp and commanding with a crisp British RP accent. Slow, deliberate, and authoritative.',
    voice: 'xiaochen',
    speed: 0.85,
    volume: 0.8,
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-400/15',
    accentBorder: 'border-violet-400/60',
    avatarGradient: 'from-violet-400 to-purple-500',
    initials: 'JM',
    personality: 'You are James, a seasoned British C-suite executive who conducts high-stakes interviews with crisp Received Pronunciation (British RP accent). You use quintessentially British expressions like "Quite right", "Rather", "I\'d challenge you on that", "Jolly good", and "That\'s rather concerning." You speak slowly and precisely with clipped consonants. You ask demanding, strategic questions that test leadership thinking. Your feedback is analytical and focused on executive presence. Keep your spoken responses concise and commanding — 1-2 sharp sentences of feedback, then directly ask the next question.',
    image: '/interviewers/james.png',
  },
  {
    id: 'zanele',
    name: 'Zanele',
    title: 'The Motivator',
    description: 'Fiery and passionate with a vibrant Soweto accent. Says "Hayi bo!" and "Asambe!" — pure energy!',
    voice: 'tongtong',
    speed: 1.3,
    volume: 1.1,
    accentColor: 'text-rose-400',
    accentBg: 'bg-rose-400/15',
    accentBorder: 'border-rose-400/60',
    avatarGradient: 'from-rose-400 to-pink-500',
    initials: 'ZN',
    personality: 'You are Zanele, a fiery and passionate career coach from Soweto with a vibrant, energetic South African township accent. You speak with infectious enthusiasm using expressions like "Hayi bo, that was amazing!" and "Siybang!" and "Mara why not aim higher?" and "Wowo, you\'re on fire!" and "Asambe! Let\'s go!" You push candidates to dig deeper and aim higher. Your feedback is enthusiastic and action-oriented. Keep your spoken responses punchy and high-energy — 2 short sentences of feedback with excitement, then fire the next question!',
    image: '/interviewers/zanele.png',
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

// ─── Fetch with Retry ───────────────────────────────────────────────────────
// Retries transient network failures (like "Failed to fetch") up to 3 times
// with exponential backoff before giving up.

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 500,
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options)
      // If we get a response (even an error status), return it —
      // retries are only for network-level failures
      return res
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      // Only retry on network errors (Failed to fetch, NetworkError, etc.)
      const isNetworkError =
        lastError.message.includes('Failed to fetch') ||
        lastError.message.includes('NetworkError') ||
        lastError.message.includes('Network request failed') ||
        lastError.name === 'TypeError'

      if (!isNetworkError || attempt === maxRetries - 1) {
        throw lastError
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms...
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
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

  // End interview confirmation dialog
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  // Restart with settings panel (on results screen)
  const [showRestartSettings, setShowRestartSettings] = useState(false)

  // Camera & transcript state for Zoom-like UI
  const [cameraOn, setCameraOn] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const userVideoRef = useRef<HTMLVideoElement | null>(null)
  const userStreamRef = useRef<MediaStream | null>(null)

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

  // ─── Toggle Camera ──────────────────────────────────────────────────

  const toggleCamera = useCallback(async () => {
    if (cameraOn) {
      // Turn off
      userStreamRef.current?.getTracks().forEach(t => t.stop())
      userStreamRef.current = null
      setCameraOn(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        userStreamRef.current = stream
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream
        }
        setCameraOn(true)
      } catch {
        // Could not access camera - silent fail
      }
    }
  }, [cameraOn])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      userStreamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

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
      // Stop any currently playing audio — null the ref BEFORE pause so
      // the onended/onerror handlers know it was intentionally stopped
      if (currentAudioRef.current) {
        const oldAudio = currentAudioRef.current
        currentAudioRef.current = null
        oldAudio.pause()
      }

      // NOTE: We do NOT set isAiSpeaking=true here — the TTS fetch takes 2-6s
      // and we don't want to show "speaking" state before audio is actually playing.
      // The caller (handleStartInterview, sendAnswer) manages the "thinking" state
      // via aiTyping while we wait for TTS. isAiSpeaking is set true only when
      // audio.play() succeeds below.

      const res = await fetchWithRetry('/api/ai/tts', {
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
        return // Graceful degradation — interview continues without audio
      }

      const audioBlob = await res.blob()

      // Validate the blob is actual audio data
      if (audioBlob.size < 100) {
        console.error('TTS returned empty/too-small audio blob:', audioBlob.size, 'bytes')
        return
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      // Use a natural playback rate — no artificial speed-up since the TTS speed
      // parameter already controls the pace. Over-acceleration causes robotic sound.
      audio.playbackRate = 1.0
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
        // ✅ Audio is NOW actually playing — show "speaking" state
        setIsAiSpeaking(true)
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

  // When audio actually starts playing, clear isLoading (but NOT aiTyping —
  // that should already be cleared when the LLM response text arrives)
  useEffect(() => {
    if (isAiSpeaking) {
      setIsLoading(false)
    }
  }, [isAiSpeaking])

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

          const asrRes = await fetchWithRetry('/api/ai/asr', {
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
      const res = await fetchWithRetry('/api/ai/interview', {
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
        // Clear "thinking" state immediately — the text is now visible.
        // Audio will follow shortly via playTTS, and isAiSpeaking will be
        // set true only when the audio actually starts playing.
        setAiTyping(false)

        // Auto-speak the first question (don't await — let it play in background)
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

      const res = await fetchWithRetry('/api/ai/interview', {
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

        // Clear "thinking" state immediately — the text is now visible.
        // Audio will follow via playTTS, and isAiSpeaking will be set true
        // only when the audio actually starts playing (not during the TTS fetch).
        setAiTyping(false)
        setIsSending(false)

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

          // Speak closing message (non-blocking)
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
          // Speak the full conversational feedback (non-blocking — audio plays when ready)
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
      if (!isWaitingForNextQuestion) {
        // Note: aiTyping and isSending may already be cleared above,
        // but this ensures they're reset even on error paths
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
        const res = await fetchWithRetry('/api/ai/interview', {
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
          const nextMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'ai',
            content: data.question,
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, nextMsg])
          setCurrentQuestionNum((prev) => prev + 1)
          // Clear "thinking" state — text is visible, audio will follow
          setAiTyping(false)
          setIsSending(false)
          // Play TTS in background (non-blocking)
          playTTS(data.question)
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
    // Clean up camera stream
    userStreamRef.current?.getTracks().forEach(t => t.stop())
    userStreamRef.current = null
    setCameraOn(false)
    setShowEndConfirm(false)

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
    // Clean up camera stream
    userStreamRef.current?.getTracks().forEach(t => t.stop())
    userStreamRef.current = null
    setCameraOn(false)
    setShowTranscript(false)
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
    setShowEndConfirm(false)
    setShowRestartSettings(false)
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

  // ─── Derived state for interview mode UI ──────────────────────────────
  const latestAiQuestion = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'ai') return messages[i].content
    }
    return ''
  }, [messages])

  const avgScore = Math.round(((liveScores.relevance + liveScores.clarity + liveScores.confidence) / 3) * 10) / 10

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
                  {/* Avatar - 3D Face Thumbnail */}
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full shadow-lg"
                    style={{
                      padding: '2px',
                      background: isSelected
                        ? `linear-gradient(135deg, ${interviewer.accentColor.replace('text-', '')}, transparent)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                    }}
                  >
                    <div className="relative size-full overflow-hidden rounded-full">
                      <Image
                        src={interviewer.image}
                        alt={interviewer.name}
                        fill
                        className="object-cover object-top"
                        sizes="48px"
                      />
                    </div>
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
            Practice Again (Same Settings)
          </motion.button>

          <motion.button
            onClick={() => setShowRestartSettings(!showRestartSettings)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-teal-400/40 bg-teal-400/10 px-6 py-4 text-base font-medium text-teal-400 transition-all hover:bg-teal-400/15 active:scale-[0.98]"
            whileTap={{ scale: 0.98 }}
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Customize &amp; Restart
            <svg
              className={`size-4 transition-transform duration-200 ${showRestartSettings ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          {/* Restart Settings Panel */}
          <AnimatePresence>
            {showRestartSettings && (
              <motion.div
                className="overflow-hidden rounded-2xl border border-border/30 bg-secondary/30"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="flex flex-col gap-4 p-4">
                  {/* Question Count */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Number of Questions
                    </label>
                    <div className="flex gap-2">
                      {QUESTION_COUNTS.map((count) => {
                        const isSelected = questionCount === count
                        return (
                          <button
                            key={count}
                            onClick={() => setQuestionCount(count)}
                            className={`
                              flex size-10 items-center justify-center rounded-xl text-sm font-bold
                              transition-all duration-200 active:scale-[0.95]
                              ${
                                isSelected
                                  ? 'border border-teal-400/60 bg-teal-400/15 text-teal-400'
                                  : 'border border-border/50 bg-secondary/40 text-foreground/60 hover:border-border hover:bg-secondary/60'
                              }
                            `}
                          >
                            {count}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Interviewer Selection */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Interviewer
                    </label>
                    <div className="flex flex-col gap-2">
                      {INTERVIEWERS.map((interviewer) => {
                        const isSelected = selectedInterviewer.id === interviewer.id
                        return (
                          <button
                            key={interviewer.id}
                            onClick={() => setSelectedInterviewer(interviewer)}
                            className={`
                              flex items-center gap-3 rounded-xl p-2.5 text-left
                              transition-all duration-200 active:scale-[0.98]
                              ${
                                isSelected
                                  ? `border ${interviewer.accentBorder} ${interviewer.accentBg}`
                                  : 'border border-border/30 bg-secondary/20 hover:bg-secondary/40'
                              }
                            `}
                          >
                            <div className="relative size-8 shrink-0 overflow-hidden rounded-full shadow-md">
                              <Image
                                src={interviewer.image}
                                alt={interviewer.name}
                                fill
                                className="object-cover object-top"
                                sizes="32px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${isSelected ? interviewer.accentColor : 'text-foreground'}`}>
                                  {interviewer.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{interviewer.title}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className={`flex size-5 shrink-0 items-center justify-center rounded-full ${interviewer.accentBg}`}>
                                <svg className={`size-3 ${interviewer.accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Start with new settings */}
                  <motion.button
                    onClick={() => {
                      setShowRestartSettings(false)
                      handleReset()
                      // handleReset sets mode to 'setup', which will use the updated questionCount and selectedInterviewer
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-400 active:scale-[0.98]"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="size-4" />
                    Start Interview with These Settings
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
  // INTERVIEW MODE — Zoom-like Virtual Interview UI
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <motion.div
      className="relative flex min-h-screen flex-col bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ─── Top Bar ────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-between bg-black/60 px-3 py-2 backdrop-blur-md sm:px-4 sm:py-3">
        {/* Left: Interviewer info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`relative flex size-9 items-center justify-center rounded-xl sm:size-10 sm:rounded-2xl ${selectedInterviewer.accentBg}`}>
            <div className="relative size-7 overflow-hidden rounded-lg sm:size-8">
              <Image
                src={selectedInterviewer.image}
                alt={selectedInterviewer.name}
                fill
                className="object-cover object-top"
                sizes="32px"
              />
            </div>
            {isAiSpeaking && (
              <motion.div
                className={`absolute -right-0.5 -top-0.5 size-2.5 rounded-full sm:size-3 ${selectedInterviewer.accentColor.replace('text-', 'bg-')}`}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-white sm:text-sm">
              {selectedInterviewer.name} <span className="hidden sm:inline">— {selectedIndustry}</span>
            </p>
            <p className="text-[10px] text-white/50 sm:text-xs">{selectedInterviewer.title}</p>
          </div>
        </div>

        {/* Center: Timer + Progress */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-white/80">
            <Clock className="size-3.5 sm:size-4" />
            <span className="font-mono text-xs tabular-nums sm:text-sm">{formatDuration(interviewDuration)}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80 sm:px-3">
            <span>Q{currentQuestionNum}/{questionCount}</span>
          </div>
        </div>

        {/* Right: Score + End */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Badge className="border-0 bg-white/10 text-white/90">
            <Target className="mr-1 size-3" />
            {avgScore > 0 ? avgScore : '-'}
          </Badge>
          <motion.button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/30 sm:px-3"
            whileTap={{ scale: 0.9 }}
            aria-label="End interview"
          >
            <PhoneOff className="size-3.5" />
            <span className="hidden sm:inline">End</span>
          </motion.button>
        </div>
      </div>

      {/* ─── Main Video Area ────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${selectedInterviewer.accentColor.includes('teal') ? 'rgba(20,184,166,0.08)' : selectedInterviewer.accentColor.includes('slate') ? 'rgba(148,163,184,0.08)' : selectedInterviewer.accentColor.includes('amber') ? 'rgba(245,158,11,0.08)' : selectedInterviewer.accentColor.includes('violet') ? 'rgba(139,92,246,0.08)' : 'rgba(244,63,94,0.08)'} 0%, transparent 70%)`,
          }}
        />

        {/* AI Avatar */}
        <motion.div
          className="relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <InterviewAvatar
            interviewer={selectedInterviewer}
            isSpeaking={isAiSpeaking}
            audioElementRef={currentAudioRef}
            size={240}
          />
        </motion.div>

        {/* Interviewer Name Badge */}
        <motion.div
          className={`mt-3 flex items-center gap-2 rounded-full ${selectedInterviewer.accentBg} px-4 py-1.5`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isAiSpeaking && (
            <span className={`flex items-center gap-1 text-xs font-medium ${selectedInterviewer.accentColor}`}>
              <AiSpeakingIndicator />
            </span>
          )}
          <span className={`text-xs font-semibold ${selectedInterviewer.accentColor}`}>
            {selectedInterviewer.name}
          </span>
        </motion.div>

        {/* Status Indicators */}
        <AnimatePresence mode="wait">
          {isAiSpeaking && (
            <motion.div
              key="speaking"
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-1 rounded-full ${selectedInterviewer.accentColor.replace('text-', 'bg-')}`}
                    animate={{ height: [4, 12 + i * 2, 6, 16 - i, 4] }}
                    transition={{ duration: 0.6 + i * 0.08, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  />
                ))}
              </div>
              <span className={`text-[11px] font-medium ${selectedInterviewer.accentColor}`}>
                {selectedInterviewer.name} is speaking...
              </span>
            </motion.div>
          )}

          {aiTyping && !isAiSpeaking && (
            <motion.div
              key="thinking"
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="size-1.5 rounded-full bg-white/50"
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-white/50">
                {selectedInterviewer.name} is thinking...
              </span>
            </motion.div>
          )}

          {isTranscribing && (
            <motion.div
              key="transcribing"
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <motion.div
                className="flex size-4 items-center justify-center rounded-full bg-purple-400/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Mic className="size-2.5 text-purple-400" />
              </motion.div>
              <span className="text-[11px] font-medium text-purple-400">
                Transcribing your answer...
              </span>
            </motion.div>
          )}

          {!isAiSpeaking && !aiTyping && !isTranscribing && !isRecording && inputMode === 'voice' && (
            <motion.div
              key="ready"
              className="mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-[11px] text-white/30">Ready for your answer</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Question Subtitle */}
        <AnimatePresence>
          {latestAiQuestion && !isAiSpeaking && (
            <motion.div
              className="mx-4 mt-4 max-w-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-2xl bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-center text-xs leading-relaxed text-white/70 sm:text-sm">
                  {latestAiQuestion}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Collapsible Chat Transcript ────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 right-4 z-10 sm:bottom-6 sm:left-6 sm:right-auto sm:w-80">
          {/* Toggle button */}
          <motion.button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`mb-2 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/15 hover:text-white/80 ${showTranscript ? 'hidden' : ''}`}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="size-3" />
            Transcript ({messages.length})
          </motion.button>

          <AnimatePresence>
            {showTranscript && (
              <motion.div
                className="overflow-hidden rounded-2xl bg-black/60 backdrop-blur-md"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <span className="text-[11px] font-medium text-white/60">Transcript</span>
                  <motion.button
                    onClick={() => setShowTranscript(false)}
                    className="flex size-5 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close transcript"
                  >
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Messages */}
                <div className="max-h-48 overflow-y-auto px-3 py-2 sm:max-h-64" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
                  <div className="flex flex-col gap-2">
                    {messages.map((msg) => {
                      if (msg.role === 'ai') {
                        return (
                          <div key={msg.id} className="flex items-start gap-2">
                            <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${selectedInterviewer.accentBg}`}>
                              <div className="relative size-4 overflow-hidden rounded-full">
                                <Image
                                  src={selectedInterviewer.image}
                                  alt={selectedInterviewer.name}
                                  fill
                                  className="object-cover object-top"
                                  sizes="16px"
                                />
                              </div>
                            </div>
                            <p className="text-[11px] leading-relaxed text-white/70">{msg.content}</p>
                          </div>
                        )
                      }
                      if (msg.role === 'user') {
                        return (
                          <div key={msg.id} className="flex items-start justify-end gap-2">
                            <p className="max-w-[80%] text-[11px] leading-relaxed text-white/50">{msg.content}</p>
                          </div>
                        )
                      }
                      if (msg.role === 'feedback') {
                        return (
                          <div key={msg.id} className="flex items-start gap-1.5 rounded-lg bg-white/5 px-2 py-1.5">
                            <Star className="mt-0.5 size-3 shrink-0 text-yellow-400/70" />
                            <div>
                              <p className="text-[10px] leading-relaxed text-white/50">{msg.content}</p>
                              {msg.scores && (
                                <div className="mt-1 flex gap-2">
                                  <span className="text-[9px] font-bold text-teal-400/70">R:{msg.scores.relevance}</span>
                                  <span className="text-[9px] font-bold text-teal-400/70">C:{msg.scores.clarity}</span>
                                  <span className="text-[9px] font-bold text-teal-400/70">Co:{msg.scores.confidence}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })}
                    {aiTyping && (
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${selectedInterviewer.accentBg}`}>
                          <div className="relative size-4 overflow-hidden rounded-full">
                            <Image
                              src={selectedInterviewer.image}
                              alt={selectedInterviewer.name}
                              fill
                              className="object-cover object-top"
                              sizes="16px"
                            />
                          </div>
                        </div>
                        <div className="flex gap-1 pt-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="size-1.5 rounded-full bg-white/30"
                              animate={{ y: [0, -3, 0], opacity: [0.3, 0.8, 0.3] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── User Camera PiP ──────────────────────────────────────────── */}
        <div className="absolute bottom-4 right-4 z-10 sm:bottom-6 sm:right-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-lg" style={{ width: 120, height: 90 }}>
            {cameraOn ? (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className="size-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-white/5">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/10">
                  <svg className="size-5 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <p className="mt-1 text-center text-[9px] text-white/30">You</p>
        </div>
      </div>

      {/* ─── Text Input Area (shown when in text mode) ──────────────────── */}
      <AnimatePresence>
        {inputMode === 'text' && (
          <motion.div
            className="relative z-20 border-t border-white/10 bg-black/60 px-4 py-3 backdrop-blur-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                disabled={isSending || aiTyping}
                className="rounded-xl border-white/10 bg-white/5 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/20"
                aria-label="Type your interview answer"
              />
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={handleSendAnswer}
                  disabled={!currentInput.trim() || isSending || aiTyping}
                  size="icon"
                  className={`size-11 rounded-xl ${selectedInterviewer.accentBg} ${selectedInterviewer.accentColor} hover:opacity-80 disabled:opacity-30`}
                  aria-label="Send answer"
                >
                  <Send className="size-5" />
                </Button>
              </motion.div>
            </div>
            {charCount > 0 && (
              <p className={`mt-1.5 text-[10px] ${charCount < 200 ? 'text-white/30' : charCount <= 500 ? 'text-teal-400/70' : 'text-yellow-400/70'}`}>
                {charFeedback}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Bottom Control Bar ──────────────────────────────────────────── */}
      <div className="relative z-20 border-t border-white/10 bg-black/60 px-4 pb-8 pt-4 backdrop-blur-xl sm:pb-6">
        {/* Recording indicator row */}
        {isRecording && inputMode === 'voice' && (
          <motion.div
            className="mb-3 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="size-2 animate-pulse rounded-full bg-red-500" />
            <RecordingTimer startTime={recordingStartTime} />
            <span className="text-[10px] text-white/30">/ 0:{MAX_RECORDING_SECONDS}</span>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* Camera Toggle */}
          <motion.button
            onClick={toggleCamera}
            className={`relative flex size-11 items-center justify-center rounded-full transition-all sm:size-12 ${
              cameraOn
                ? 'bg-white/15 text-white hover:bg-white/20'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
            whileTap={{ scale: 0.9 }}
            aria-label={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
            {cameraOn && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-green-400" />}
          </motion.button>

          {/* Mute AI Toggle */}
          <motion.button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex size-11 items-center justify-center rounded-full transition-all sm:size-12 ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
            }`}
            whileTap={{ scale: 0.9 }}
            aria-label={isMuted ? 'Unmute AI speaker' : 'Mute AI speaker'}
          >
            {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </motion.button>

          {/* Main Mic Button (Voice mode) or Input Mode Switch (Text mode) */}
          {inputMode === 'voice' ? (
            <motion.button
              onClick={handleMicPress}
              disabled={isSending || aiTyping || isTranscribing || isAiSpeaking}
              className={`relative flex size-16 items-center justify-center rounded-full transition-all sm:size-20 ${
                isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                  : isTranscribing
                    ? 'bg-purple-500/80 text-white'
                    : `bg-white text-black shadow-lg shadow-white/20 hover:bg-white/90`
              } disabled:opacity-30 disabled:shadow-none`}
              whileTap={{ scale: 0.92 }}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {/* Recording pulse rings */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-400/40"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-400/20"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}
              {isTranscribing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Mic className="size-7 sm:size-8" />
                </motion.div>
              ) : isRecording ? (
                <MicOff className="size-7 sm:size-8" />
              ) : (
                <Mic className="size-7 sm:size-8" />
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setInputMode('voice')}
              className="flex size-16 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/20 transition-all hover:bg-white/90 sm:size-20"
              whileTap={{ scale: 0.92 }}
              aria-label="Switch to voice mode"
            >
              <Mic className="size-7 sm:size-8" />
            </motion.button>
          )}

          {/* Skip Question */}
          <motion.button
            onClick={handleSkipQuestion}
            disabled={isSending || aiTyping || isTranscribing}
            className="flex size-11 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60 disabled:opacity-20 sm:size-12"
            whileTap={{ scale: 0.9 }}
            aria-label="Skip this question"
          >
            <SkipForward className="size-5" />
          </motion.button>

          {/* Switch Input Mode (small) */}
          <motion.button
            onClick={() => {
              if (inputMode === 'voice') {
                setInputMode('text')
                stopRecording()
              } else {
                setInputMode('voice')
              }
            }}
            className="flex size-11 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60 sm:size-12"
            whileTap={{ scale: 0.9 }}
            aria-label={inputMode === 'voice' ? 'Switch to text input' : 'Switch to voice input'}
          >
            {inputMode === 'voice' ? <Keyboard className="size-5" /> : <MessageCircle className="size-5" />}
          </motion.button>
        </div>

        {/* Hint text */}
        {inputMode === 'voice' && !isRecording && !isTranscribing && !isAiSpeaking && (
          <motion.p
            className="mt-2 text-center text-[10px] text-white/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Tap the microphone to speak your answer
          </motion.p>
        )}
        {isRecording && inputMode === 'voice' && (
          <motion.p
            className="mt-2 text-center text-[10px] text-red-400/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Recording... tap again to stop
          </motion.p>
        )}
      </div>

      {/* ─── End Interview Confirmation Dialog ────────────────────────── */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEndConfirm(false)}
          >
            <motion.div
              className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div className="flex flex-col items-center gap-3 px-6 pb-4 pt-8">
                <div className="flex size-16 items-center justify-center rounded-full bg-red-500/15">
                  <PhoneOff className="size-7 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white">End Interview?</h3>
                <p className="text-center text-sm text-white/60">
                  {currentQuestionNum > 1
                    ? `You've answered ${currentQuestionNum - 1} of ${questionCount} questions. You'll still get your scores for the answers you've given.`
                    : "You haven't answered any questions yet. You'll get a chance to restart after ending."}
                </p>
              </div>

              {/* Dialog Actions */}
              <div className="flex flex-col gap-2 px-6 pb-6 pt-2">
                <motion.button
                  onClick={() => {
                    setShowEndConfirm(false)
                    handleEndInterview()
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-400 active:scale-[0.98]"
                  whileTap={{ scale: 0.98 }}
                >
                  <PhoneOff className="size-4" />
                  Yes, End Interview
                </motion.button>
                <motion.button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 active:scale-[0.98]"
                  whileTap={{ scale: 0.98 }}
                >
                  Continue Interview
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
