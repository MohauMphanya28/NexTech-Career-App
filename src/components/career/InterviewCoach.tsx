'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  const [showMuted, setShowMuted] = useState(false)
  const [interviewDuration, setInterviewDuration] = useState(0)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const interviewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  // ─── Play TTS Audio ──────────────────────────────────────────────────

  const playTTS = useCallback(async (text: string): Promise<void> => {
    try {
      setIsAiSpeaking(true)

      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }

      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'kazi', speed: 1.0 }),
      })

      if (!res.ok) throw new Error('TTS failed')

      const audioBlob = await res.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio

      audio.onended = () => {
        setIsAiSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
      }

      audio.onerror = () => {
        setIsAiSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
      }

      await audio.play()
    } catch (error) {
      console.error('TTS playback error:', error)
      setIsAiSpeaking(false)
    }
  }, [])

  // ─── Stop TTS Audio ──────────────────────────────────────────────────

  const stopTTS = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
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

        if (audioChunksRef.current.length === 0) return

        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType })

        // Convert to base64 and send to ASR
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Data = reader.result as string
          setIsTranscribing(true)

          try {
            const asrRes = await fetch('/api/ai/asr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Data }),
            })

            const asrData = await asrRes.json()

            if (asrData.success && asrData.transcription && !asrData.isEmpty) {
              setCurrentInput(asrData.transcription)
              // Auto-send the transcribed answer
              await sendAnswer(asrData.transcription)
            } else {
              // No speech detected
              setIsTranscribing(false)
            }
          } catch (error) {
            console.error('ASR error:', error)
            setIsTranscribing(false)
          }
        }

        reader.readAsDataURL(audioBlob)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(500) // Collect data every 500ms
      setIsRecording(true)
      setRecordingStartTime(Date.now())
      setMicPermission('granted')
    } catch (error) {
      console.error('Microphone access error:', error)
      setMicPermission('denied')
      // Fall back to text mode
      setInputMode('text')
    }
  }, [stopTTS])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setRecordingStartTime(null)
  }, [])

  // ─── Start Interview ─────────────────────────────────────────────────

  const handleStartInterview = async () => {
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

        // Auto-speak the first question
        setTimeout(() => {
          playTTS(data.question)
        }, 500)

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
      setTimeout(() => playTTS(errorMsg.content), 500)
    } finally {
      setIsLoading(false)
      setAiTyping(false)
    }
  }

  // ─── Send Answer (shared by text & voice) ────────────────────────────

  const sendAnswer = async (answerText: string) => {
    const answer = answerText.trim()
    if (!answer || isSending) return

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

    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          industry: selectedIndustry,
          questionNumber: currentQuestionNum,
          answer,
          totalQuestions: questionCount,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const scores = data.scores || { relevance: 5, clarity: 5, confidence: 5 }

        // Update live scores (running average)
        setLiveScores((prev) => {
          const count = currentQuestionNum
          return {
            relevance: Math.round(((prev.relevance * (count - 1)) + scores.relevance) / count * 10) / 10,
            clarity: Math.round(((prev.clarity * (count - 1)) + scores.clarity) / count * 10) / 10,
            confidence: Math.round(((prev.confidence * (count - 1)) + scores.confidence) / count * 10) / 10,
          }
        })

        // Add feedback message
        const feedbackMsg: ChatMessage = {
          id: `feedback-${Date.now()}`,
          role: 'feedback',
          content: data.feedback || 'Good effort! Keep going.',
          timestamp: Date.now(),
          scores,
        }
        setMessages((prev) => [...prev, feedbackMsg])

        // Check if interview is complete
        if (data.isComplete || currentQuestionNum >= questionCount) {
          // Interview complete - add closing message
          const closingMsg: ChatMessage = {
            id: `ai-closing-${Date.now()}`,
            role: 'ai',
            content: data.closingMessage || "Great job completing the interview! You've shown real effort. Let me compile your results...",
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, closingMsg])

          // Speak closing message
          setTimeout(() => playTTS(closingMsg.content), 800)

          // Calculate final scores
          const finalScores = {
            relevance: Math.round(((liveScores.relevance * currentQuestionNum) + scores.relevance) / (currentQuestionNum + 1) * 10) / 10,
            clarity: Math.round(((liveScores.clarity * currentQuestionNum) + scores.clarity) / (currentQuestionNum + 1) * 10) / 10,
            confidence: Math.round(((liveScores.confidence * currentQuestionNum) + scores.confidence) / (currentQuestionNum + 1) * 10) / 10,
          }

          const overallScore = Math.round(
            ((finalScores.relevance + finalScores.clarity + finalScores.confidence) / 3) * 10
          ) / 10

          // Delay showing results for dramatic effect
          setTimeout(() => {
            const sessionResults: SessionResults = {
              overallScore,
              ...finalScores,
              feedbackSummary: data.closingMessage || 'You completed the interview with solid effort. Keep practicing to improve your scores!',
              improvementTips: generateImprovementTips(finalScores),
              closingMessage: data.closingMessage || '',
            }
            setResults(sessionResults)
            setMode('results')

            // Update store session
            if (interviewSession) {
              const completedSession = {
                ...interviewSession,
                score: overallScore,
                relevance: finalScores.relevance,
                clarity: finalScores.clarity,
                confidence: finalScores.confidence,
                completed: true,
              }
              setInterviewSession(completedSession)
              setInterviewHistory([...interviewHistory, completedSession])
            }
          }, 2500)
        } else {
          // Add next question and speak it
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

            // Auto-speak the next question
            setTimeout(() => playTTS(nextQuestion), 300)
          }, 800)
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
      setTimeout(() => playTTS(errorMsg.content), 500)
    } finally {
      setAiTyping(false)
      setIsSending(false)
    }
  }

  // ─── Send from Text Input ────────────────────────────────────────────

  const handleSendAnswer = () => {
    const answer = currentInput.trim()
    if (!answer || isSending) return
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
            setTimeout(() => playTTS(data.question), 300)
          }, 500)
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
            <div className="relative flex size-10 items-center justify-center rounded-2xl bg-teal-400/15">
              <Headphones className="size-5 text-teal-400" />
              {isAiSpeaking && (
                <motion.div
                  className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-teal-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedIndustry} Interview
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
            <div className="flex size-8 items-center justify-center rounded-full bg-teal-400/20">
              <Volume2 className="size-4 text-teal-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-teal-400">Interviewer is speaking...</span>
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
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-400/15">
                      <Headphones className="size-4 text-teal-400" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm border-l-2 border-teal-400 bg-secondary/60 px-4 py-3">
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {msg.content}
                      </p>
                      {/* Replay button */}
                      <button
                        onClick={() => handleReplayAudio(msg)}
                        className="mt-2 flex items-center gap-1.5 text-[11px] text-teal-400/70 transition-colors hover:text-teal-400"
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
                    <div className="flex max-w-[90%] items-start gap-2 rounded-2xl bg-teal-400/5 px-4 py-3 ring-1 ring-teal-400/20">
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

            {/* Mute/Speaker Toggle */}
            <motion.button
              onClick={() => setShowMuted(!showMuted)}
              className={`flex size-12 items-center justify-center rounded-xl transition-colors ${
                showMuted
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label={showMuted ? 'Unmute AI speaker' : 'Mute AI speaker'}
            >
              {showMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
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
