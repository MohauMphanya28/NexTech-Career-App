'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { Send, Sparkles, Check } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'ai' | 'user'
  content: string
  timestamp: number
}

type InputMode = 'text' | 'chips' | 'multi-chips' | 'chips-with-text' | 'none'

interface StepConfig {
  aiMessage: string | ((data: Record<string, string>) => string)
  inputMode: InputMode
  chips?: string[]
  dataKey: string
  placeholder?: string
}

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS: StepConfig[] = [
  {
    aiMessage: "Welcome to NexTech! 👋 I'm your AI career mentor. I'll help you build an amazing career profile. Let's start — what's your name?",
    inputMode: 'text',
    dataKey: 'name',
    placeholder: 'Type your name...',
  },
  {
    aiMessage: (data) => `Great to meet you, ${data.name}! 🎉 What kind of career are you interested in?`,
    inputMode: 'chips-with-text',
    chips: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Engineering', 'Creative Arts', 'Government', 'Other'],
    dataKey: 'careerInterest',
    placeholder: 'Or type your own...',
  },
  {
    aiMessage: "And where are you on your career journey?",
    inputMode: 'chips',
    chips: ['Still in school', 'Just graduated', 'Some work experience', 'Career changer'],
    dataKey: 'experienceLevel',
  },
  {
    aiMessage: "Tell me about your education. What's your highest qualification?",
    inputMode: 'chips-with-text',
    chips: ['High School / Matric', 'Certificate / Diploma', "Bachelor's Degree", 'Honours / Master\'s', 'Still studying'],
    dataKey: 'education',
    placeholder: 'Add details (e.g. institution, year)...',
  },
  {
    aiMessage: "What skills do you have? Don't worry if you're not sure — just pick what sounds right! ✨",
    inputMode: 'multi-chips',
    chips: ['Communication', 'Problem Solving', 'Teamwork', 'Computer Skills', 'Customer Service', 'Mathematics', 'Writing', 'Leadership', 'Organization', 'Technical Skills'],
    dataKey: 'skills',
  },
  {
    aiMessage: "Where are you based? This helps me find relevant opportunities near you. 📍",
    inputMode: 'text',
    dataKey: 'location',
    placeholder: 'City or province...',
  },
  {
    aiMessage: "Last question! 🎯 What's your biggest career goal right now?",
    inputMode: 'chips',
    chips: ['Get my first job', 'Build a professional CV', 'Prepare for interviews', 'Change careers', 'Get promoted'],
    dataKey: 'careerGoal',
  },
]

// ─── Helper: resolve AI message ──────────────────────────────────────────────

function resolveAiMessage(step: number, data: Record<string, string>): string {
  const config = STEPS[step]
  if (!config) return ''
  if (typeof config.aiMessage === 'function') {
    return config.aiMessage(data)
  }
  return config.aiMessage
}

// ─── Animation variants ─────────────────────────────────────────────────────

const aiMessageVariant = {
  hidden: { opacity: 0, x: -30, y: 10 },
  visible: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

const userMessageVariant = {
  hidden: { opacity: 0, x: 30, y: 10 },
  visible: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
}

const chipsVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

const inputVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.35 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={aiMessageVariant}
      className="flex items-start gap-3 mb-4"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-teal-light" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 border-l-2 border-l-teal">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-teal-light inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-teal-light inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-teal-light inline-block" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Chip component ──────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
  multi,
}: {
  label: string
  selected: boolean
  onClick: () => void
  multi?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        glass
        ${selected
          ? 'border-teal bg-teal/15 text-teal-light shadow-[0_0_12px_oklch(0.72_0.15_180/20%)]'
          : 'border-border text-muted-foreground hover:border-teal/50 hover:text-foreground hover:bg-white/5'
        }
        ${multi ? 'flex items-center gap-2' : ''}
      `}
    >
      {multi && selected && <Check className="w-3.5 h-3.5 text-teal-light" />}
      {label}
    </button>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const {
    onboardingData,
    setOnboardingData,
    setUser,
    setCurrentView,
    setOnboardingStep,
  } = useAppStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)
  const [chipsVisible, setChipsVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── Scroll to bottom ─────────────────────────────────────────────────────

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isAiTyping])

  // ─── Initialize first AI message ──────────────────────────────────────────

  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        setIsAiTyping(true)
        setTimeout(() => {
          setIsAiTyping(false)
          setMessages([{
            id: 'ai-welcome',
            role: 'ai',
            content: STEPS[0].aiMessage as string,
            timestamp: Date.now(),
          }])
          setTimeout(() => {
            setInputVisible(true)
            setChipsVisible(true)
            inputRef.current?.focus()
          }, 300)
        }, 1200)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [])

  // ─── Show next AI question ────────────────────────────────────────────────

  const showAiQuestion = (step: number, data: Record<string, string>) => {
    setIsAiTyping(true)
    setInputVisible(false)
    setChipsVisible(false)
    setSelectedChips([])
    setInputValue('')

    setTimeout(() => {
      setIsAiTyping(false)
      const aiMsg: ChatMessage = {
        id: `ai-step-${step}-${Date.now()}`,
        role: 'ai',
        content: resolveAiMessage(step, data),
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, aiMsg])

      setTimeout(() => {
        setInputVisible(true)
        setChipsVisible(true)
        inputRef.current?.focus()
      }, 400)
    }, 1000)
  }

  // ─── Show completion sequence ─────────────────────────────────────────────

  const showCompletion = (data: Record<string, string>) => {
    setIsCompleting(true)
    setIsAiTyping(true)

    setTimeout(() => {
      setIsAiTyping(false)
      const completionMsg: ChatMessage = {
        id: `ai-complete-${Date.now()}`,
        role: 'ai',
        content: `Amazing, ${data.name}! 🎉 I've got everything I need. Let me set up your profile...`,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, completionMsg])
      setInputVisible(false)
      setChipsVisible(false)

      // Simulate profile creation loading
      setTimeout(() => {
        setIsCompleting(true)
        const readyMsg: ChatMessage = {
          id: `ai-ready-${Date.now()}`,
          role: 'ai',
          content: "You're all set! Let's start building your future together. 🚀",
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, readyMsg])

        // Save user data to store
        const profileData = {
          id: `user-${Date.now()}`,
          name: data.name || '',
          email: '',
          phone: '',
          age: null,
          location: data.location || '',
          education: data.education || '',
          field: data.careerInterest || '',
          experience: data.experienceLevel || '',
          skills: data.skills ? data.skills.split(', ') : [],
          careerGoal: data.careerGoal || '',
          onboardingDone: true,
          onboardingStep: STEPS.length,
        }

        setUser(profileData)
        setOnboardingStep(STEPS.length)

        // Save to API
        fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileData.name,
            location: profileData.location,
            education: profileData.education,
            field: profileData.field,
            experience: profileData.experience,
            skills: profileData.skills,
            careerGoal: profileData.careerGoal,
            onboardingDone: true,
            onboardingStep: STEPS.length,
          }),
        }).catch(console.error)

        setIsComplete(true)
        setIsCompleting(false)
      }, 2500)
    }, 1500)
  }

  // ─── Handle submission ────────────────────────────────────────────────────

  const handleSubmit = () => {
    const stepConfig = STEPS[currentStep]
    if (!stepConfig) return

    let value = ''

    if (stepConfig.inputMode === 'multi-chips') {
      if (selectedChips.length === 0) return
      value = selectedChips.join(', ')
    } else if (stepConfig.inputMode === 'chips') {
      if (selectedChips.length === 0) return
      value = selectedChips[0]
    } else if (stepConfig.inputMode === 'chips-with-text') {
      value = selectedChips[0] || inputValue.trim()
      if (!value) return
      if (selectedChips[0] && inputValue.trim()) {
        value = `${selectedChips[0]} — ${inputValue.trim()}`
      }
    } else {
      value = inputValue.trim()
      if (!value) return
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-step-${currentStep}-${Date.now()}`,
      role: 'user',
      content: value,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])

    // Save to onboarding data
    const newData = { ...onboardingData, [stepConfig.dataKey]: value }
    setOnboardingData(newData)

    const nextStep = currentStep + 1
    setCurrentStep(nextStep)

    if (nextStep >= STEPS.length) {
      // All steps done — show completion
      showCompletion(newData)
      return
    }

    // Get AI encouragement, then show next question
    setIsAiTyping(true)
    setInputVisible(false)
    setChipsVisible(false)

    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `The user just answered "${value}" for the ${stepConfig.dataKey} question. Give a very brief (1 sentence max) encouraging response acknowledging their answer before asking the next question. Be warm and supportive.`,
        type: 'onboarding',
        context: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.response) {
          setIsAiTyping(false)
          const encouragementMsg: ChatMessage = {
            id: `ai-encourage-${Date.now()}`,
            role: 'ai',
            content: data.response,
            timestamp: Date.now(),
          }
          setMessages(prev => [...prev, encouragementMsg])

          setTimeout(() => {
            showAiQuestion(nextStep, newData)
          }, 800)
        } else {
          showAiQuestion(nextStep, newData)
        }
      })
      .catch(() => {
        showAiQuestion(nextStep, newData)
      })
  }

  // ─── Handle chip selection ────────────────────────────────────────────────

  const handleChipClick = (chip: string) => {
    const stepConfig = STEPS[currentStep]
    if (!stepConfig) return

    if (stepConfig.inputMode === 'multi-chips') {
      setSelectedChips(prev =>
        prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
      )
    } else {
      setSelectedChips(prev => prev.includes(chip) ? [] : [chip])
    }
  }

  // ─── Handle key press ─────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // ─── Navigate to dashboard ────────────────────────────────────────────────

  const goToDashboard = () => {
    setCurrentView('dashboard')
  }

  // ─── Derived state ────────────────────────────────────────────────────────

  const stepConfig = STEPS[currentStep]
  const showTextInput = inputVisible && stepConfig && (
    stepConfig.inputMode === 'text' || stepConfig.inputMode === 'chips-with-text'
  )
  const showChips = chipsVisible && stepConfig && stepConfig.chips && stepConfig.chips.length > 0
  const isMultiSelect = stepConfig?.inputMode === 'multi-chips'
  // For chips-with-text, show the text input in a separate bottom bar alongside chips
  const showChipsWithTextInput = inputVisible && stepConfig?.inputMode === 'chips-with-text' && showChips

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 glass-strong border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center glow-teal-sm">
            <Sparkles className="w-4.5 h-4.5 text-teal-light" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">NexTech Career Mentor</h1>
            <p className="text-xs text-teal-light flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-light animate-pulse-teal inline-block" />
              Online
            </p>
          </div>
          {/* Progress indicator */}
          <div className="ml-auto flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i < currentStep
                    ? 'w-6 bg-teal'
                    : i === currentStep
                    ? 'w-6 bg-teal/50'
                    : 'w-3 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Messages area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 max-h-[calc(100vh-200px)]">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={msg.role === 'ai' ? aiMessageVariant : userMessageVariant}
              className={`flex items-start gap-3 mb-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              {msg.role === 'ai' ? (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-light" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {(onboardingData.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'glass rounded-tl-sm border-l-2 border-l-teal text-foreground'
                    : 'bg-teal/15 border border-teal/30 rounded-tr-sm text-foreground ml-auto'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isAiTyping && <TypingIndicator />}
        </AnimatePresence>

        {/* Completion loading animation */}
        <AnimatePresence>
          {isCompleting && !isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-6"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-teal/40 border-t-teal animate-spin" />
                <p className="text-xs text-muted-foreground">Setting up your profile...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Chips area ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showChips && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={chipsVariant}
            className="flex-shrink-0 px-4 pb-2"
          >
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {stepConfig.chips!.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  selected={selectedChips.includes(chip)}
                  onClick={() => handleChipClick(chip)}
                  multi={isMultiSelect}
                />
              ))}
            </div>
            {isMultiSelect && selectedChips.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {selectedChips.length} skill{selectedChips.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Input area: text-only or chips-only submit ──────────────────── */}
      <AnimatePresence>
        {(showTextInput && !showChipsWithTextInput) && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={inputVariant}
            className="flex-shrink-0 glass-strong border-t border-border/50 px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={stepConfig.placeholder || 'Type your answer...'}
                className="flex-1 bg-background/60 border-border/60 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-teal focus-visible:ring-teal/30"
              />
              <Button
                onClick={handleSubmit}
                disabled={!inputValue.trim() && selectedChips.length === 0}
                size="icon"
                className="bg-teal hover:bg-teal-dark text-background shrink-0 h-9 w-9 rounded-lg glow-teal-sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Input area: chips-only submit button ────────────────────────── */}
      <AnimatePresence>
        {inputVisible && stepConfig?.inputMode === 'chips' && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={inputVariant}
            className="flex-shrink-0 glass-strong border-t border-border/50 px-4 py-3"
          >
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={selectedChips.length === 0}
                className="bg-teal hover:bg-teal-dark text-background glow-teal-sm"
              >
                Continue
                <Send className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Input area: multi-chips submit ──────────────────────────────── */}
      <AnimatePresence>
        {inputVisible && stepConfig?.inputMode === 'multi-chips' && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={inputVariant}
            className="flex-shrink-0 glass-strong border-t border-border/50 px-4 py-3 flex justify-end"
          >
            <Button
              onClick={handleSubmit}
              disabled={selectedChips.length === 0}
              className="bg-teal hover:bg-teal-dark text-background glow-teal-sm"
            >
              {selectedChips.length === 0
                ? 'Select at least one skill'
                : `Continue with ${selectedChips.length} skill${selectedChips.length !== 1 ? 's' : ''}`}
              <Send className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Input area: chips-with-text ─────────────────────────────────── */}
      <AnimatePresence>
        {showChipsWithTextInput && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={inputVariant}
            className="flex-shrink-0 glass-strong border-t border-border/50 px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={stepConfig.placeholder || 'Add more details...'}
                className="flex-1 bg-background/60 border-border/60 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-teal focus-visible:ring-teal/30"
              />
              <Button
                onClick={handleSubmit}
                disabled={!inputValue.trim() && selectedChips.length === 0}
                size="icon"
                className="bg-teal hover:bg-teal-dark text-background shrink-0 h-9 w-9 rounded-lg glow-teal-sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Completion CTA ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
            exit={{ opacity: 0 }}
            className="flex-shrink-0 glass-strong border-t border-teal/30 px-4 py-4"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-teal-light">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Profile Complete!</span>
              </div>
              <Button
                onClick={goToDashboard}
                className="w-full bg-teal hover:bg-teal-dark text-background font-semibold glow-teal h-11 rounded-xl text-base"
              >
                Go to Dashboard
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
