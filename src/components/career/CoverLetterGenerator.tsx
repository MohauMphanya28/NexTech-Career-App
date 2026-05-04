'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Copy,
  Save,
  ChevronLeft,
  RotateCcw,
  FileText,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'input' | 'generating' | 'preview'

interface ToneOption {
  value: string
  label: string
  description: string
  emoji: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TONE_OPTIONS: ToneOption[] = [
  {
    value: 'formal',
    label: 'Formal',
    description: 'Business professional',
    emoji: '💼',
  },
  {
    value: 'confident',
    label: 'Confident',
    description: 'Assertive and strong',
    emoji: '💪',
  },
  {
    value: 'entry-level',
    label: 'Entry-level',
    description: 'Enthusiastic and eager',
    emoji: '🌟',
  },
  {
    value: 'warm',
    label: 'Warm',
    description: 'Personable and friendly',
    emoji: '🤝',
  },
  {
    value: 'concise',
    label: 'Concise',
    description: 'Brief and impactful',
    emoji: '⚡',
  },
]

// ─── Animation Variants ─────────────────────────────────────────────────────

const phaseVariants = {
  enter: { opacity: 0, x: 40, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -40, scale: 0.98 },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CoverLetterGenerator() {
  const {
    coverLetterContent,
    setCoverLetterContent,
    coverLetterTone,
    setCoverLetterTone,
    coverLetterJobTitle,
    setCoverLetterJobTitle,
    coverLetterCompany,
    setCoverLetterCompany,
    coverLetterJobDesc,
    setCoverLetterJobDesc,
    user,
    currentResume,
    setCurrentView,
    isLoading,
    setIsLoading,
    careerContext,
    setCareerContext,
  } = useAppStore()

  // ── Local State ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>(
    coverLetterContent ? 'preview' : 'input'
  )
  const [localJobTitle, setLocalJobTitle] = useState(
    coverLetterJobTitle || careerContext.resumeJobTitle || ''
  )
  const [localCompany, setLocalCompany] = useState(
    coverLetterCompany || careerContext.resumeCompany || ''
  )
  const [localJobDesc, setLocalJobDesc] = useState(coverLetterJobDesc)
  const [localTone, setLocalTone] = useState(coverLetterTone)
  const [editableContent, setEditableContent] = useState(coverLetterContent)
  const [copied, setCopied] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  // ── Derived ──────────────────────────────────────────────────────────────
  const wordCount = useMemo(() => {
    if (!editableContent) return 0
    return editableContent.trim().split(/\s+/).filter(Boolean).length
  }, [editableContent])

  const isFormValid = localJobTitle.trim() && localCompany.trim()

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!isFormValid) {
      toast.error('Please fill in the job title and company name.')
      return
    }

    // Save form data to store
    setCoverLetterJobTitle(localJobTitle.trim())
    setCoverLetterCompany(localCompany.trim())
    setCoverLetterJobDesc(localJobDesc.trim())
    setCoverLetterTone(localTone)

    // Switch to generating phase
    setPhase('generating')
    setGenerationProgress(0)

    // Simulate progress during generation
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 400)

    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: localJobTitle.trim(),
          company: localCompany.trim(),
          jobDescription: localJobDesc.trim(),
          userProfile: user
            ? {
                name: user.name,
                email: user.email,
                location: user.location,
                education: user.education,
                field: user.field,
                experience: user.experience,
                skills: user.skills,
                careerGoal: user.careerGoal,
              }
            : null,
          tone: localTone,
          resumeData: currentResume
            ? {
                summary: currentResume.summary,
                skills: currentResume.skills,
                experience: currentResume.experience,
              }
            : null,
        }),
      })

      const data = await res.json()

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (data.success && data.coverLetter) {
        // Small delay for the progress to reach 100%
        await new Promise((r) => setTimeout(r, 300))
        setEditableContent(data.coverLetter)
        setCoverLetterContent(data.coverLetter)
        setPhase('preview')
      } else {
        setPhase('input')
        toast.error('Could not generate your cover letter. Please try again.')
      }
    } catch {
      clearInterval(progressInterval)
      setPhase('input')
      toast.error('Something went wrong. Please try again.')
    }
  }, [
    isFormValid,
    localJobTitle,
    localCompany,
    localJobDesc,
    localTone,
    user,
    currentResume,
    setCoverLetterJobTitle,
    setCoverLetterCompany,
    setCoverLetterJobDesc,
    setCoverLetterTone,
    setCoverLetterContent,
  ])

  const handleRegenerate = useCallback(() => {
    setPhase('input')
    setEditableContent('')
    setCoverLetterContent('')
  }, [setCoverLetterContent])

  const handleBackToInput = useCallback(() => {
    setPhase('input')
  }, [])

  const handleSave = useCallback(() => {
    setCoverLetterContent(editableContent)
    setCoverLetterJobTitle(localJobTitle)
    setCoverLetterCompany(localCompany)
    setCoverLetterJobDesc(localJobDesc)
    setCoverLetterTone(localTone)

    // Save career context for other components
    setCareerContext({
      coverLetterJobTitle: localJobTitle,
      coverLetterCompany: localCompany,
      coverLetterTone: localTone,
      coverLetterCompleted: true,
      currentStep: 'interview',
    })

    toast.success('Cover letter saved!')
  }, [
    editableContent,
    localJobTitle,
    localCompany,
    localJobDesc,
    localTone,
    setCoverLetterContent,
    setCoverLetterJobTitle,
    setCoverLetterCompany,
    setCoverLetterJobDesc,
    setCoverLetterTone,
    setCareerContext,
  ])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editableContent)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }, [editableContent])

  const handleGoBack = useCallback(() => {
    setCurrentView('dashboard')
  }, [setCurrentView])

  // ── Phase: Input ─────────────────────────────────────────────────────────

  const renderInputPhase = () => (
    <motion.div
      key="input"
      variants={phaseVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-teal-400/15">
            <FileText className="size-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cover Letter</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered, tailored to your dream job
            </p>
          </div>
        </div>
      </motion.div>

      {/* Encouraging tip */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="glass rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              A great cover letter tells your story and shows why you&apos;re the
              perfect fit. Fill in the details below and I&apos;ll craft one
              that&apos;s uniquely yours.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Job Title */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Job Title <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Junior Software Developer"
            value={localJobTitle}
            onChange={(e) => setLocalJobTitle(e.target.value)}
            className="bg-secondary border-border focus:border-primary rounded-lg h-12 text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            What position are you applying for?
          </p>
        </div>

        {/* Company Name */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Company Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Discovery Limited"
            value={localCompany}
            onChange={(e) => setLocalCompany(e.target.value)}
            className="bg-secondary border-border focus:border-primary rounded-lg h-12 text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Which company?
          </p>
        </div>

        {/* Job Description */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Job Description{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Paste the job description here (helps me tailor your letter)..."
            value={localJobDesc}
            onChange={(e) => setLocalJobDesc(e.target.value)}
            className="bg-secondary border-border focus:border-primary rounded-lg min-h-[140px] text-base leading-relaxed"
          />
        </div>
      </motion.div>

      {/* Tone Selector */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <label className="text-sm font-medium text-foreground mb-3 block">
          Choose your tone
        </label>
        <RadioGroup
          value={localTone}
          onValueChange={setLocalTone}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
        >
          {TONE_OPTIONS.map((tone) => (
            <label
              key={tone.value}
              className={`
                relative flex items-center gap-3 rounded-xl p-3.5 cursor-pointer
                transition-all duration-200 active:scale-[0.98]
                ${
                  localTone === tone.value
                    ? 'glass border-primary/60 bg-primary/10 glow-teal-sm'
                    : 'glass border-border/50 hover:border-primary/30 hover:bg-primary/5'
                }
              `}
            >
              <RadioGroupItem
                value={tone.value}
                className="sr-only"
              />
              <span className="text-xl shrink-0" role="img" aria-label={tone.label}>
                {tone.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    localTone === tone.value
                      ? 'text-primary'
                      : 'text-foreground'
                  }`}
                >
                  {tone.label}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">
                  {tone.description}
                </p>
              </div>
              {localTone === tone.value && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </label>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Generate Button */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Button
          onClick={handleGenerate}
          disabled={!isFormValid || isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-13 text-base font-semibold glow-teal-sm gap-2"
          size="lg"
        >
          <Sparkles className="h-5 w-5" />
          Generate Cover Letter
        </Button>
        {!isFormValid && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Fill in the job title and company to get started
          </p>
        )}
      </motion.div>
    </motion.div>
  )

  // ── Phase: Generating ────────────────────────────────────────────────────

  const renderGeneratingPhase = () => (
    <motion.div
      key="generating"
      variants={phaseVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center gap-8 py-20"
    >
      {/* Animated icon */}
      <div className="relative">
        <motion.div
          className="flex size-20 items-center justify-center rounded-2xl bg-primary/15"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="size-9 text-primary" />
        </motion.div>
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary/30"
          animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary/20"
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.3,
          }}
        />
      </div>

      {/* Text */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          NexTech is crafting your personalized cover letter...
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          I&apos;m tailoring every word to match the{' '}
          <span className="text-primary font-medium">{localJobTitle}</span>{' '}
          role at{' '}
          <span className="text-primary font-medium">{localCompany}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs space-y-2">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(generationProgress, 100)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <div className="flex gap-1">
            <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
            <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
            <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
          </div>
          <span className="text-xs text-muted-foreground">Writing...</span>
        </div>
      </div>

      {/* Fun facts while waiting */}
      <motion.div
        className="glass rounded-xl p-4 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          💡 <span className="text-foreground font-medium">Did you know?</span>{' '}
          A tailored cover letter can increase your chances of getting an
          interview by up to 50%.
        </p>
      </motion.div>
    </motion.div>
  )

  // ── Phase: Preview ───────────────────────────────────────────────────────

  const renderPreviewPhase = () => (
    <motion.div
      key="preview"
      variants={phaseVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <button
          onClick={handleBackToInput}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Edit Details
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Your Cover Letter
            </h1>
            <p className="text-sm text-muted-foreground">
              {localJobTitle} at {localCompany}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary/15 text-primary border-primary/30 rounded-lg px-3 py-1"
          >
            {TONE_OPTIONS.find((t) => t.value === localTone)?.label} Tone
          </Badge>
        </div>
      </motion.div>

      {/* Cover Letter Preview */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="glass-strong border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Preview & Edit
              </span>
            </div>
            <Textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="bg-transparent border-0 focus-visible:ring-0 focus-visible:border-0 resize-none min-h-[400px] text-base leading-relaxed text-foreground/90 placeholder:text-muted-foreground/50 p-0"
              placeholder="Your cover letter will appear here..."
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Word count */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between text-xs text-muted-foreground"
      >
        <span>{wordCount} words</span>
        <span>
          {wordCount < 200
            ? 'Consider adding more detail'
            : wordCount > 500
              ? 'Consider being more concise'
              : 'Great length!'}
        </span>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 gap-2 font-semibold glow-teal-sm"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl h-12 gap-2 font-semibold"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleRegenerate}
            variant="outline"
            className="border-border hover:bg-secondary rounded-xl h-11 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button
            onClick={handleBackToInput}
            variant="outline"
            className="border-border hover:bg-secondary rounded-xl h-11 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Edit Details
          </Button>
        </div>
      </motion.div>

      {/* Helpful tip */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="glass rounded-xl p-4"
      >
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Feel free to edit the text above — this is <span className="text-foreground font-medium">your</span> letter.
            Make it personal, add specific examples, and ensure it sounds like you.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col px-4 pb-28 pt-6">
      <AnimatePresence mode="wait">
        {phase === 'input' && renderInputPhase()}
        {phase === 'generating' && renderGeneratingPhase()}
        {phase === 'preview' && renderPreviewPhase()}
      </AnimatePresence>
    </div>
  )
}
