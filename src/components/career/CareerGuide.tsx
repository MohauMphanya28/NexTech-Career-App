'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ChevronRight, Sparkles, CheckCircle2, ArrowRight, FolderOpen, FileText, Mail, Mic, Bot, Send, Loader2, Lightbulb, MessagesSquare } from 'lucide-react'
import { useAppStore, type AppView } from '@/lib/store'
import { toast } from 'sonner'

interface GuideMessage {
  id: string
  type: 'tip' | 'success' | 'next-step' | 'motivation'
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    view: AppView
  }
}

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

type GuideTab = 'tips' | 'chat'

export default function CareerGuide() {
  const { careerContext, currentView, setCurrentView, savedDocuments, user } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<GuideTab>('tips')
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set())

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Determine contextual messages based on career progress
  const messages = useMemo<GuideMessage[]>(() => {
    const msgs: GuideMessage[] = []

    // Document counts
    const resumeDocs = savedDocuments.filter((d: any) => d.type === 'resume').length
    const letterDocs = savedDocuments.filter((d: any) => d.type === 'cover-letter').length
    const interviewDocs = savedDocuments.filter((d: any) => d.type === 'interview').length

    // Context depends on what the user has completed and current view
    if (!careerContext.resumeCompleted && currentView === 'dashboard') {
      msgs.push({
        id: 'start-resume',
        type: 'next-step',
        icon: <ArrowRight className="w-4 h-4" />,
        title: 'Start with your resume',
        description: "A strong resume is the foundation of your job search. Let's build one that stands out!",
        action: { label: 'Build Resume', view: 'resume' },
      })
    }

    if (careerContext.resumeCompleted && !careerContext.coverLetterCompleted) {
      msgs.push({
        id: 'next-cover-letter',
        type: 'next-step',
        icon: <Sparkles className="w-4 h-4" />,
        title: 'Great resume! Now add a cover letter',
        description: careerContext.resumeJobTitle
          ? `A cover letter for your ${careerContext.resumeJobTitle} role${careerContext.resumeCompany ? ` at ${careerContext.resumeCompany}` : ''} will make your application stand out.`
          : "A tailored cover letter makes your application 50% more likely to get noticed.",
        action: { label: 'Create Cover Letter', view: 'cover-letter' },
      })
    }

    if (careerContext.resumeCompleted && careerContext.coverLetterCompleted && !careerContext.interviewCompleted) {
      msgs.push({
        id: 'next-interview',
        type: 'next-step',
        icon: <MessageCircle className="w-4 h-4" />,
        title: 'Ready for interview practice?',
        description: careerContext.resumeJobTitle
          ? `Practice answering questions for a ${careerContext.resumeJobTitle} role at ${careerContext.resumeCompany || 'your target company'}. Your interviewer will know your background!`
          : "Practice makes perfect! Build confidence with a mock interview.",
        action: { label: 'Start Interview', view: 'interview' },
      })
    }

    if (careerContext.interviewCompleted) {
      msgs.push({
        id: 'interview-done',
        type: 'success',
        icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
        title: 'Career prep complete!',
        description: `You scored ${careerContext.lastInterviewScore}/10 on your last interview. Keep practicing to improve!`,
        action: { label: 'View Progress', view: 'progress' },
      })
    }

    // Document-specific cues — show when user has saved docs but hasn't moved forward
    if (resumeDocs > 0 && !careerContext.resumeCompleted && currentView === 'documents') {
      msgs.push({
        id: 'resume-saved-next',
        type: 'next-step',
        icon: <Sparkles className="w-4 h-4" />,
        title: 'Resume saved! Keep the momentum',
        description: "You've saved a resume. Next step: write a cover letter tailored to your target role.",
        action: { label: 'Create Cover Letter', view: 'cover-letter' },
      })
    }

    // View-specific tips
    if (currentView === 'resume' && !careerContext.resumeCompleted) {
      msgs.push({
        id: 'resume-tip',
        type: 'tip',
        icon: <Sparkles className="w-4 h-4" />,
        title: 'Resume tip',
        description: "Use the AI suggestions to improve your summary and skills. A targeted resume gets more interviews!",
      })
    }

    if (currentView === 'resume-analyzer') {
      msgs.push({
        id: 'analyzer-tip',
        type: 'tip',
        icon: <Sparkles className="w-4 h-4" />,
        title: 'After analysis',
        description: "Once you see your results, click 'Use Improved Resume' to load the AI-polished version into the builder. It auto-saves to My Docs!",
      })
    }

    if (currentView === 'cover-letter' && careerContext.resumeCompleted) {
      msgs.push({
        id: 'cover-letter-context',
        type: 'tip',
        icon: <Sparkles className="w-4 h-4" />,
        title: 'Auto-filled from your resume',
        description: `I've pre-filled the job title and company from your resume. Your cover letter will match your ${careerContext.resumeJobTitle || 'target'} experience.`,
      })
    }

    if (currentView === 'interview' && careerContext.resumeCompleted) {
      const expText = careerContext.resumeExperience?.length === 0
        ? "Your interviewer knows you're new to this field and will focus on transferable skills and motivation."
        : `Your interviewer knows your background as a ${careerContext.resumeJobTitle}${careerContext.resumeCompany ? ` at ${careerContext.resumeCompany}` : ''} and will ask relevant questions.`

      msgs.push({
        id: 'interview-context',
        type: 'tip',
        icon: <Sparkles className="w-4 h-4" />,
        title: 'Interview tailored to you',
        description: expText,
      })
    }

    if (currentView === 'interview' && careerContext.coverLetterCompleted && !careerContext.resumeCompleted) {
      msgs.push({
        id: 'interview-cl-context',
        type: 'tip',
        icon: <Mail className="w-4 h-4" />,
        title: 'Using cover letter context',
        description: `Your interviewer will use your cover letter for ${careerContext.coverLetterJobTitle} at ${careerContext.coverLetterCompany} to tailor questions.`,
      })
    }

    // My Documents view tips
    if (currentView === 'documents') {
      if (savedDocuments.length === 0) {
        msgs.push({
          id: 'docs-empty',
          type: 'motivation',
          icon: <ArrowRight className="w-4 h-4" />,
          title: 'Start creating documents',
          description: "Your saved resumes, cover letters, and interview results will appear here. Build a resume to get started!",
          action: { label: 'Build Resume', view: 'resume' },
        })
      } else {
        msgs.push({
          id: 'docs-tip',
          type: 'tip',
          icon: <FolderOpen className="w-4 h-4" />,
          title: 'Your document vault',
          description: `You have ${resumeDocs} resume${resumeDocs !== 1 ? 's' : ''}, ${letterDocs} cover letter${letterDocs !== 1 ? 's' : ''}, and ${interviewDocs} interview${interviewDocs !== 1 ? 's' : ''} saved. Click any to view details or load into an editor.`,
        })
      }
    }

    // Motivation messages
    if (currentView === 'dashboard' && careerContext.resumeCompleted && careerContext.coverLetterCompleted && careerContext.interviewCompleted) {
      msgs.push({
        id: 'all-complete-motivation',
        type: 'motivation',
        icon: <Sparkles className="w-4 h-4" />,
        title: 'You\'re on fire! 🔥',
        description: "You've completed the full career prep journey. Try a new role or practice more interviews to sharpen your skills.",
        action: { label: 'View Documents', view: 'documents' },
      })
    }

    return msgs
  }, [careerContext, currentView, savedDocuments])

  // Auto-show the guide when there are new messages
  useEffect(() => {
    const undismissed = messages.filter(m => !dismissedMessages.has(m.id))
    if (undismissed.length > 0 && !isOpen) {
      // Brief delay before showing indicator
      const timer = setTimeout(() => {
        // Don't auto-open, but the button will pulse to indicate new messages
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [messages, dismissedMessages, isOpen])

  const hasNewMessages = messages.some(m => !dismissedMessages.has(m.id))

  const handleDismiss = (id: string) => {
    setDismissedMessages(prev => new Set([...prev, id]))
  }

  const handleAction = (view: AppView) => {
    setIsOpen(false)
    setCurrentView(view)
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, activeTab])

  // Focus input when switching to chat tab
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 100)
    }
  }, [activeTab, isOpen])

  // Build career context string for the AI
  const buildCareerContextString = useCallback(() => {
    const parts: string[] = []
    if (user?.name) parts.push(`Name: ${user.name}`)
    if (user?.field) parts.push(`Field: ${user.field}`)
    if (user?.experience) parts.push(`Experience level: ${user.experience}`)
    if (user?.careerGoal) parts.push(`Career goal: ${user.careerGoal}`)
    if (user?.skills?.length) parts.push(`Skills: ${user.skills.join(', ')}`)
    if (careerContext.resumeJobTitle) parts.push(`Target role: ${careerContext.resumeJobTitle}`)
    if (careerContext.resumeCompany) parts.push(`Target company: ${careerContext.resumeCompany}`)
    if (careerContext.resumeCompleted) parts.push('Has completed a resume')
    if (careerContext.coverLetterCompleted) parts.push('Has completed a cover letter')
    if (careerContext.interviewCompleted) parts.push(`Has practiced interviews (last score: ${careerContext.lastInterviewScore}/10)`)
    return parts.length > 0 ? parts.join('. ') : undefined
  }, [user, careerContext])

  const handleSendChat = useCallback(async () => {
    const trimmed = chatInput.trim()
    if (!trimmed || isChatLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }

    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const contextStr = buildCareerContextString()
      const chatContext = chatMessages.slice(-6).map(m => ({
        role: m.role === 'ai' ? 'ai' : 'user',
        content: m.content,
      }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          type: 'general',
          context: [
            ...(contextStr ? [{ role: 'user', content: `User context: ${contextStr}` }] : []),
            ...chatContext,
          ],
        }),
      })

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`)
      }

      const data = await res.json()

      if (!data.success || !data.response) {
        throw new Error(data.error || 'No response from AI')
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.response,
        timestamp: Date.now(),
      }

      setChatMessages(prev => [...prev, aiMsg])
    } catch (error: any) {
      console.error('Chat error:', error)
      toast.error('Failed to get a response. Please try again.')
    } finally {
      setIsChatLoading(false)
    }
  }, [chatInput, isChatLoading, chatMessages, buildCareerContextString])

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendChat()
    }
  }

  const visibleMessages = messages.filter(m => !dismissedMessages.has(m.id))

  // Don't show the guide during onboarding
  if (currentView === 'onboarding') return null

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-24 right-4 z-50 flex size-12 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        aria-label="Career guide"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="size-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="size-5" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Notification dot */}
        {hasNewMessages && !isOpen && (
          <motion.div
            className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-amber-400 border-2 border-background"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        
        {/* Pulse ring when there are new messages */}
        {hasNewMessages && !isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-teal-400"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>

      {/* Guide Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 p-4 border-b border-border/40 shrink-0">
              <div className="size-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Sparkles className="size-4 text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">NexTech Guide</h3>
                <p className="text-xs text-muted-foreground">Your career coach</p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex shrink-0 border-b border-border/40">
              <button
                onClick={() => setActiveTab('tips')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative ${
                  activeTab === 'tips'
                    ? 'text-teal-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Lightbulb className="size-3.5" />
                Tips
                {activeTab === 'tips' && (
                  <motion.div
                    layoutId="guide-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-teal-400 rounded-full"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative ${
                  activeTab === 'chat'
                    ? 'text-teal-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessagesSquare className="size-3.5" />
                Ask AI
                {activeTab === 'chat' && (
                  <motion.div
                    layoutId="guide-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-teal-400 rounded-full"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'tips' ? (
                <motion.div
                  key="tips"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col overflow-hidden"
                >
                  {/* Tips Messages */}
                  <div className="p-3 space-y-2 overflow-y-auto max-h-[40vh]">
                    {visibleMessages.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        <CheckCircle2 className="size-8 mx-auto mb-2 text-teal-400" />
                        <p>You&apos;re all caught up!</p>
                        <p className="text-xs mt-1">Keep going with your career prep.</p>
                      </div>
                    ) : (
                      visibleMessages.map((msg, i) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                          className={`
                            rounded-xl p-3 border
                            ${msg.type === 'next-step' ? 'bg-teal-500/10 border-teal-500/20' : ''}
                            ${msg.type === 'tip' ? 'bg-amber-500/10 border-amber-500/20' : ''}
                            ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : ''}
                            ${msg.type === 'motivation' ? 'bg-purple-500/10 border-purple-500/20' : ''}
                          `}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`
                              mt-0.5 shrink-0
                              ${msg.type === 'next-step' ? 'text-teal-400' : ''}
                              ${msg.type === 'tip' ? 'text-amber-400' : ''}
                              ${msg.type === 'success' ? 'text-emerald-400' : ''}
                              ${msg.type === 'motivation' ? 'text-purple-400' : ''}
                            `}>
                              {msg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{msg.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{msg.description}</p>
                              {msg.action && (
                                <button
                                  onClick={() => handleAction(msg.action!.view)}
                                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                                >
                                  {msg.action.label}
                                  <ChevronRight className="size-3" />
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => handleDismiss(msg.id)}
                              className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                              aria-label="Dismiss"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Progress indicator */}
                  <div className="px-4 pb-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex gap-1">
                        <div className={`size-2 rounded-full ${careerContext.resumeCompleted ? 'bg-teal-400' : 'bg-secondary'}`} />
                        <div className={`size-2 rounded-full ${careerContext.coverLetterCompleted ? 'bg-teal-400' : 'bg-secondary'}`} />
                        <div className={`size-2 rounded-full ${careerContext.interviewCompleted ? 'bg-teal-400' : 'bg-secondary'}`} />
                      </div>
                      <span>
                        {careerContext.interviewCompleted
                          ? 'All steps complete!'
                          : careerContext.coverLetterCompleted
                            ? '2 of 3 done'
                            : careerContext.resumeCompleted
                              ? '1 of 3 done'
                              : 'Get started'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col overflow-hidden flex-1"
                >
                  {/* Chat Messages */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[40vh] min-h-[120px]">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        <Bot className="size-10 mx-auto mb-3 text-teal-400/60" />
                        <p className="font-medium text-foreground/80">Ask me anything about your career</p>
                        <p className="text-xs mt-1.5 leading-relaxed max-w-[240px] mx-auto">
                          Get personalised advice on resumes, interviews, job searching, and more.
                        </p>
                      </div>
                    )}
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                            ${msg.role === 'user'
                              ? 'bg-teal-500 text-white rounded-br-md'
                              : 'bg-secondary/80 text-foreground rounded-bl-md border border-border/30'
                            }
                          `}
                        >
                          {msg.role === 'ai' && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <Bot className="size-3 text-teal-400" />
                              <span className="text-[10px] font-medium text-teal-400">NexTech</span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isChatLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-secondary/80 rounded-2xl rounded-bl-md px-4 py-3 border border-border/30 flex items-center gap-1.5">
                          <Bot className="size-3 text-teal-400 mr-1" />
                          <motion.div
                            className="size-1.5 rounded-full bg-teal-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="size-1.5 rounded-full bg-teal-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="size-1.5 rounded-full bg-teal-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="shrink-0 p-3 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <input
                        ref={chatInputRef}
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleChatKeyDown}
                        placeholder="Ask a career question..."
                        disabled={isChatLoading}
                        className="flex-1 rounded-xl bg-secondary/60 border border-border/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 disabled:opacity-50 transition-colors"
                      />
                      <button
                        onClick={handleSendChat}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="size-9 rounded-xl bg-teal-500 text-white flex items-center justify-center hover:bg-teal-400 transition-colors disabled:opacity-40 disabled:hover:bg-teal-500 shrink-0"
                        aria-label="Send message"
                      >
                        {isChatLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
