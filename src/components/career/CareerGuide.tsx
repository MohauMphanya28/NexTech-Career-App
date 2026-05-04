'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ChevronRight, Sparkles, CheckCircle2, ArrowRight, FolderOpen, FileText, Mail, Mic } from 'lucide-react'
import { useAppStore, type AppView } from '@/lib/store'

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

export default function CareerGuide() {
  const { careerContext, currentView, setCurrentView, savedDocuments } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set())

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

  const visibleMessages = messages.filter(m => !dismissedMessages.has(m.id))

  // Don't show the guide during onboarding or when there are no messages
  if (currentView === 'onboarding' || messages.length === 0) return null

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
            className="fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] sm:w-80 max-h-[60vh] overflow-y-auto rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 p-4 border-b border-border/40">
              <div className="size-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Sparkles className="size-4 text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">NexTech Guide</h3>
                <p className="text-xs text-muted-foreground">Your career coach</p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-3 space-y-2">
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
            <div className="px-4 pb-3">
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
        )}
      </AnimatePresence>
    </>
  )
}
