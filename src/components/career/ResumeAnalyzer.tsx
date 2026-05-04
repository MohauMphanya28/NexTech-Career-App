'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RotateCcw,
  Target,
  Zap,
  Shield,
  Lightbulb,
  TrendingUp,
  FileUp,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

type AnalyzerPhase = 'upload' | 'analyzing' | 'results'

interface ResumeAnalysis {
  overallScore: number
  atsCompatibility: {
    score: number
    issues: string[]
    tips: string[]
  }
  contentAnalysis: {
    summary: { score: number; feedback: string; hasSummary: boolean }
    experience: { score: number; feedback: string; issues: string[]; strengths: string[] }
    education: { score: number; feedback: string; issues: string[]; strengths: string[] }
    skills: { score: number; feedback: string; missing: string[]; irrelevant: string[] }
  }
  strengths: string[]
  weaknesses: string[]
  improvementPlan: Array<{
    priority: 'high' | 'medium' | 'low'
    section: string
    issue: string
    suggestion: string
    example: string
  }>
  improvedResume: {
    personalInfo: { fullName: string; email: string; phone: string; location: string; linkedin: string }
    summary: string
    experience: Array<{ title: string; company: string; period: string; description: string }>
    education: Array<{ degree: string; institution: string; year: string }>
    skills: string[]
    atsScore: number
  } | null
  keyInsight: string
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── Circular Score Component ────────────────────────────────────────────────

function ScoreCircle({
  score,
  size = 120,
  label = 'Score',
  strokeWidth = 8,
}: {
  score: number
  size?: number
  label?: string
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 80
      ? 'oklch(0.72 0.15 180)'
      : score >= 60
        ? 'oklch(0.8 0.15 90)'
        : score >= 40
          ? 'oklch(0.75 0.15 60)'
          : 'oklch(0.65 0.2 25)'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.25 0.02 260)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-bold" style={{ color, fontSize: size * 0.22 }}>
          {score}
        </span>
        <span className="text-muted-foreground" style={{ fontSize: size * 0.09 }}>
          {label}
        </span>
      </div>
    </div>
  )
}

// ─── Section Score Bar ───────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80
      ? 'bg-teal-400'
      : score >= 60
        ? 'bg-amber-400'
        : score >= 40
          ? 'bg-orange-400'
          : 'bg-red-400'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">{score}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}

// ─── Priority Badge ──────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'High', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
    medium: { label: 'Medium', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    low: { label: 'Low', className: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
  }
  const { label, className } = config[priority]
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 rounded-md border ${className}`}>
      {label}
    </Badge>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ResumeAnalyzer() {
  const { setCurrentView, setIsLoading, setResumeAnalysis, setResumeFileName, resumeAnalysis, resumeFileName } = useAppStore()

  const [phase, setPhase] = useState<AnalyzerPhase>(resumeAnalysis ? 'results' : 'upload')
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jobTarget, setJobTarget] = useState('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [showImproved, setShowImproved] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const analysis = resumeAnalysis as ResumeAnalysis | null

  // ── File Handling ─────────────────────────────────────────────────────

  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ]
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      toast.error('Please upload a PDF, DOCX, DOC, or TXT file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB')
      return
    }

    setSelectedFile(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  // ── Analysis ──────────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return

    setPhase('analyzing')
    setAnalysisProgress(0)
    setIsLoading(true)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      // Convert file to base64
      const arrayBuffer = await selectedFile.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      // Determine mime type
      let mimeType = selectedFile.type
      if (!mimeType) {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase()
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          doc: 'application/msword',
          txt: 'text/plain',
        }
        mimeType = mimeMap[ext || ''] || 'application/pdf'
      }

      setAnalysisProgress(30)

      const res = await fetch('/api/ai/resume-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          mimeType,
          fileName: selectedFile.name,
          jobTarget: jobTarget.trim() || undefined,
        }),
      })

      setAnalysisProgress(85)

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysisProgress(100)
      setResumeAnalysis(data.analysis)
      setResumeFileName(selectedFile.name)

      // Small delay for the progress bar to reach 100%
      await new Promise((r) => setTimeout(r, 500))

      setPhase('results')
      toast.success('Resume analysis complete!')
    } catch (error) {
      console.error('Resume analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.')
      setPhase('upload')
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
    }
  }, [selectedFile, jobTarget, setIsLoading, setResumeAnalysis, setResumeFileName])

  // ── Toggle Section ────────────────────────────────────────────────────

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // ── Use Improved Resume ───────────────────────────────────────────────

  const handleUseImprovedResume = useCallback(() => {
    if (!analysis?.improvedResume) return

    const improved = analysis.improvedResume
    const resumeData = {
      id: Math.random().toString(36).substring(2, 11),
      title: `${improved.personalInfo.fullName || 'My'} Resume (Improved)`,
      personalInfo: improved.personalInfo,
      summary: improved.summary,
      experience: improved.experience,
      education: improved.education,
      skills: improved.skills,
      template: 'modern',
      atsScore: improved.atsScore,
    }

    useAppStore.getState().setCurrentResume(resumeData)
    useAppStore.getState().setResumeStep(5) // Jump to preview
    setCurrentView('resume')
    toast.success('Improved resume loaded! Review it in the Resume Builder.')
  }, [analysis, setCurrentView])

  // ── Reset ─────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setSelectedFile(null)
    setJobTarget('')
    setPhase('upload')
    setAnalysisProgress(0)
    setExpandedSections({})
    setShowImproved(false)
    setResumeAnalysis(null)
    setResumeFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [setResumeAnalysis, setResumeFileName])

  // ── Render: Upload Phase ──────────────────────────────────────────────

  const renderUpload = () => (
    <motion.div
      className="flex min-h-screen flex-col gap-6 px-4 pb-28 pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex size-10 items-center justify-center rounded-xl glass hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Resume Analyzer</h1>
          <p className="text-xs text-muted-foreground">Upload your resume for AI-powered analysis</p>
        </div>
      </motion.header>

      {/* Upload Area */}
      <motion.section variants={itemVariants}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed
            p-8 text-center cursor-pointer transition-all duration-200
            ${
              dragOver
                ? 'border-teal-400 bg-teal-400/10 scale-[1.01]'
                : selectedFile
                  ? 'border-teal-400/50 bg-teal-400/5'
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }
          `}
          role="button"
          aria-label="Upload resume file"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleInputChange}
            className="hidden"
            aria-hidden="true"
          />

          <div className={`flex size-16 items-center justify-center rounded-2xl ${
            selectedFile ? 'bg-teal-400/15' : 'bg-primary/10'
          }`}>
            {selectedFile ? (
              <FileText className="size-8 text-teal-400" />
            ) : (
              <FileUp className="size-8 text-primary" />
            )}
          </div>

          {selectedFile ? (
            <div>
              <p className="text-sm font-semibold text-teal-400">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-foreground">
                Drop your resume here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or <span className="text-primary underline">browse files</span>
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Supports PDF, DOCX, DOC, TXT — Max 10MB
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Job Target (Optional) */}
      <motion.section variants={itemVariants} className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Target className="size-4 text-primary" />
          Target Job Role <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          placeholder="e.g. Junior Software Developer, Marketing Intern"
          value={jobTarget}
          onChange={(e) => setJobTarget(e.target.value)}
          className="bg-secondary border-border focus:border-primary rounded-xl h-12 text-base"
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll tailor the analysis to this specific role
        </p>
      </motion.section>

      {/* Analyze Button */}
      <motion.section variants={itemVariants}>
        <Button
          onClick={handleAnalyze}
          disabled={!selectedFile}
          className="w-full h-13 rounded-xl text-base font-semibold bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          size="lg"
        >
          <Sparkles className="size-5" />
          Analyse My Resume
          <ArrowRight className="size-4" />
        </Button>
      </motion.section>

      {/* Feature Highlights */}
      <motion.section variants={itemVariants} className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          What You&apos;ll Get
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              icon: <Shield className="size-4 text-teal-400" />,
              title: 'ATS Compatibility Score',
              desc: 'See how your resume performs with Applicant Tracking Systems',
            },
            {
              icon: <TrendingUp className="size-4 text-cyan-400" />,
              title: 'Section-by-Section Analysis',
              desc: 'Detailed feedback on summary, experience, education & skills',
            },
            {
              icon: <Lightbulb className="size-4 text-amber-400" />,
              title: 'Actionable Improvement Plan',
              desc: 'Prioritised suggestions with before/after examples',
            },
            {
              icon: <Zap className="size-4 text-purple-400" />,
              title: 'AI-Improved Resume',
              desc: 'Get a polished version you can use immediately',
            },
          ].map((feature) => (
            <div key={feature.title} className="glass rounded-xl p-3.5 flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                {feature.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  )

  // ── Render: Analyzing Phase ───────────────────────────────────────────

  const renderAnalyzing = () => (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-28">
      <motion.div
        className="flex flex-col items-center gap-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated icon */}
        <div className="relative">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-teal-400/15">
            <Sparkles className="size-12 text-teal-400 animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-teal-400/20 animate-ping" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Analysing Your Resume</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Our AI is reviewing every section of your resume...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(analysisProgress, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {analysisProgress < 30
              ? 'Reading your resume...'
              : analysisProgress < 60
                ? 'Extracting content & structure...'
                : analysisProgress < 85
                  ? 'Analysing quality & ATS compatibility...'
                  : 'Finalising your report...'}
          </p>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-2 w-full max-w-xs">
          {[
            { label: 'Document extraction', done: analysisProgress >= 30 },
            { label: 'Content analysis', done: analysisProgress >= 60 },
            { label: 'ATS scoring', done: analysisProgress >= 85 },
            { label: 'Generating improvements', done: analysisProgress >= 95 },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-2 text-sm">
              {step.done ? (
                <CheckCircle2 className="size-4 text-teal-400 shrink-0" />
              ) : (
                <div className="size-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
              )}
              <span className={step.done ? 'text-foreground' : 'text-muted-foreground'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  // ── Render: Results Phase ─────────────────────────────────────────────

  const renderResults = () => {
    if (!analysis) return null

    const highPriority = analysis.improvementPlan?.filter((p) => p.priority === 'high') || []
    const medPriority = analysis.improvementPlan?.filter((p) => p.priority === 'medium') || []
    const lowPriority = analysis.improvementPlan?.filter((p) => p.priority === 'low') || []

    return (
      <motion.div
        className="flex min-h-screen flex-col gap-5 px-4 pb-28 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex size-10 items-center justify-center rounded-xl glass hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="size-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Analysis Results</h1>
              <p className="text-xs text-muted-foreground">{resumeFileName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            New
          </Button>
        </motion.header>

        {/* Key Insight */}
        <motion.section variants={itemVariants}>
          <div className="glass-strong glow-teal-sm rounded-2xl p-4 flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-400/15">
              <Lightbulb className="size-4 text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">Key Insight</p>
              <p className="text-sm text-foreground/90 mt-1 leading-relaxed">{analysis.keyInsight}</p>
            </div>
          </div>
        </motion.section>

        {/* Score Overview */}
        <motion.section variants={itemVariants}>
          <Card className="glass rounded-2xl p-5">
            <div className="flex items-center justify-around">
              <ScoreCircle score={analysis.overallScore} size={110} label="Overall" />
              <ScoreCircle score={analysis.atsCompatibility.score} size={90} label="ATS" strokeWidth={6} />
            </div>
          </Card>
        </motion.section>

        {/* Section Scores */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Section Breakdown
          </h3>
          <Card className="glass rounded-2xl p-4 space-y-4">
            <ScoreBar label="Professional Summary" score={analysis.contentAnalysis.summary.score} />
            <ScoreBar label="Work Experience" score={analysis.contentAnalysis.experience.score} />
            <ScoreBar label="Education" score={analysis.contentAnalysis.education.score} />
            <ScoreBar label="Skills" score={analysis.contentAnalysis.skills.score} />
          </Card>
        </motion.section>

        {/* Strengths */}
        <motion.section variants={itemVariants}>
          <button
            onClick={() => toggleSection('strengths')}
            className="w-full glass rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-teal-400" />
                <span className="text-sm font-semibold text-foreground">Strengths</span>
                <Badge variant="secondary" className="rounded-md text-[10px]">{analysis.strengths.length}</Badge>
              </div>
              {expandedSections.strengths ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </div>
            <AnimatePresence>
              {expandedSections.strengths && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-3 space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                        <span className="text-teal-400 mt-1 shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.section>

        {/* Weaknesses */}
        <motion.section variants={itemVariants}>
          <button
            onClick={() => toggleSection('weaknesses')}
            className="w-full glass rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-400" />
                <span className="text-sm font-semibold text-foreground">Areas for Improvement</span>
                <Badge variant="secondary" className="rounded-md text-[10px]">{analysis.weaknesses.length}</Badge>
              </div>
              {expandedSections.weaknesses ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </div>
            <AnimatePresence>
              {expandedSections.weaknesses && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-3 space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                        <span className="text-amber-400 mt-1 shrink-0">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.section>

        {/* ATS Issues & Tips */}
        <motion.section variants={itemVariants}>
          <button
            onClick={() => toggleSection('ats')}
            className="w-full glass rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-cyan-400" />
                <span className="text-sm font-semibold text-foreground">ATS Compatibility Details</span>
              </div>
              {expandedSections.ats ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </div>
            <AnimatePresence>
              {expandedSections.ats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {analysis.atsCompatibility.issues.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Issues Found</p>
                      {analysis.atsCompatibility.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                          <XCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}
                  {analysis.atsCompatibility.tips.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Optimisation Tips</p>
                      {analysis.atsCompatibility.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                          <CheckCircle2 className="size-4 text-cyan-400 mt-0.5 shrink-0" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.section>

        {/* Detailed Section Feedback */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Detailed Feedback
          </h3>

          {/* Summary */}
          <Card className="glass rounded-2xl p-4">
            <button
              onClick={() => toggleSection('feedback-summary')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Summary</span>
                <Badge variant="secondary" className="rounded-md text-[10px]">{analysis.contentAnalysis.summary.score}/100</Badge>
              </div>
              {expandedSections['feedback-summary'] ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <AnimatePresence>
              {expandedSections['feedback-summary'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{analysis.contentAnalysis.summary.feedback}</p>
                  {!analysis.contentAnalysis.summary.hasSummary && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                      <AlertCircle className="size-3.5" />
                      No professional summary found — this is a critical section!
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Experience */}
          <Card className="glass rounded-2xl p-4">
            <button
              onClick={() => toggleSection('feedback-experience')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Experience</span>
                <Badge variant="secondary" className="rounded-md text-[10px]">{analysis.contentAnalysis.experience.score}/100</Badge>
              </div>
              {expandedSections['feedback-experience'] ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <AnimatePresence>
              {expandedSections['feedback-experience'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{analysis.contentAnalysis.experience.feedback}</p>
                  {analysis.contentAnalysis.experience.strengths.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {analysis.contentAnalysis.experience.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-teal-400">
                          <CheckCircle2 className="size-3 mt-0.5 shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                  {analysis.contentAnalysis.experience.issues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {analysis.contentAnalysis.experience.issues.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-amber-400">
                          <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Education */}
          <Card className="glass rounded-2xl p-4">
            <button
              onClick={() => toggleSection('feedback-education')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Education</span>
                <Badge variant="secondary" className="rounded-md text-[10px]">{analysis.contentAnalysis.education.score}/100</Badge>
              </div>
              {expandedSections['feedback-education'] ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <AnimatePresence>
              {expandedSections['feedback-education'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{analysis.contentAnalysis.education.feedback}</p>
                  {analysis.contentAnalysis.education.strengths.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {analysis.contentAnalysis.education.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-teal-400">
                          <CheckCircle2 className="size-3 mt-0.5 shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                  {analysis.contentAnalysis.education.issues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {analysis.contentAnalysis.education.issues.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-amber-400">
                          <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Skills */}
          <Card className="glass rounded-2xl p-4">
            <button
              onClick={() => toggleSection('feedback-skills')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Skills</span>
                <Badge variant="secondary" className="rounded-md text-[10px]">{analysis.contentAnalysis.skills.score}/100</Badge>
              </div>
              {expandedSections['feedback-skills'] ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <AnimatePresence>
              {expandedSections['feedback-skills'] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{analysis.contentAnalysis.skills.feedback}</p>
                  {analysis.contentAnalysis.skills.missing.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-amber-400 mb-1">Missing Skills to Add:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.contentAnalysis.skills.missing.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-amber-400/30 text-amber-400 rounded-md">
                            + {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.contentAnalysis.skills.irrelevant.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-red-400 mb-1">Consider Removing:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.contentAnalysis.skills.irrelevant.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-red-400/30 text-red-400 rounded-md">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.section>

        {/* Improvement Plan */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Improvement Plan
          </h3>

          {highPriority.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-400 flex items-center gap-1">
                <AlertTriangle className="size-3" /> High Priority
              </p>
              {highPriority.map((item, i) => (
                <Card key={i} className="glass rounded-xl p-3.5 border-l-2 border-red-400">
                  <div className="flex items-start gap-2">
                    <PriorityBadge priority="high" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{item.section}: {item.issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.suggestion}</p>
                      {item.example && (
                        <div className="mt-2 rounded-lg bg-secondary/50 p-2.5">
                          <p className="text-[10px] font-semibold uppercase text-teal-400 mb-1">Example</p>
                          <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">{item.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {medPriority.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <AlertCircle className="size-3" /> Medium Priority
              </p>
              {medPriority.map((item, i) => (
                <Card key={i} className="glass rounded-xl p-3.5 border-l-2 border-amber-400">
                  <div className="flex items-start gap-2">
                    <PriorityBadge priority="medium" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{item.section}: {item.issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.suggestion}</p>
                      {item.example && (
                        <div className="mt-2 rounded-lg bg-secondary/50 p-2.5">
                          <p className="text-[10px] font-semibold uppercase text-teal-400 mb-1">Example</p>
                          <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">{item.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {lowPriority.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-teal-400 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Nice to Have
              </p>
              {lowPriority.map((item, i) => (
                <Card key={i} className="glass rounded-xl p-3.5 border-l-2 border-teal-400">
                  <div className="flex items-start gap-2">
                    <PriorityBadge priority="low" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{item.section}: {item.issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.suggestion}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.section>

        {/* AI-Improved Resume */}
        {analysis.improvedResume && (
          <motion.section variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                AI-Improved Resume
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImproved(!showImproved)}
                className="text-primary gap-1.5 text-xs"
              >
                {showImproved ? 'Hide' : 'Preview'}
                {showImproved ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </Button>
            </div>

            <AnimatePresence>
              {showImproved && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <Card className="glass rounded-2xl p-4 space-y-4 max-h-[500px] overflow-y-auto">
                    {/* Personal Info */}
                    <div>
                      <h4 className="text-base font-bold text-foreground">{analysis.improvedResume.personalInfo.fullName}</h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        {analysis.improvedResume.personalInfo.email && <span>{analysis.improvedResume.personalInfo.email}</span>}
                        {analysis.improvedResume.personalInfo.phone && <span>{analysis.improvedResume.personalInfo.phone}</span>}
                        {analysis.improvedResume.personalInfo.location && <span>{analysis.improvedResume.personalInfo.location}</span>}
                      </div>
                    </div>

                    {/* Summary */}
                    {analysis.improvedResume.summary && (
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">Professional Summary</h5>
                        <p className="text-sm text-foreground/85 leading-relaxed">{analysis.improvedResume.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {analysis.improvedResume.experience.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">Experience</h5>
                        <div className="space-y-3">
                          {analysis.improvedResume.experience.map((exp, i) => (
                            <div key={i} className="border-l-2 border-teal-400/30 pl-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-foreground">{exp.title}</p>
                                <span className="text-[10px] text-muted-foreground">{exp.period}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{exp.company}</p>
                              <p className="text-xs text-foreground/80 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {analysis.improvedResume.education.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">Education</h5>
                        <div className="space-y-2">
                          {analysis.improvedResume.education.map((edu, i) => (
                            <div key={i}>
                              <p className="text-sm font-medium text-foreground">{edu.degree}</p>
                              <p className="text-xs text-muted-foreground">{edu.institution} — {edu.year}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {analysis.improvedResume.skills.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">Skills</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.improvedResume.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-[11px] rounded-md">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projected ATS Score */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs text-muted-foreground">Projected ATS Score</span>
                      <span className="text-sm font-bold text-teal-400">{analysis.improvedResume.atsScore}/100</span>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleUseImprovedResume}
              className="w-full h-12 rounded-xl text-sm font-semibold bg-teal-500 text-white hover:bg-teal-400 gap-2"
            >
              <Sparkles className="size-4" />
              Use Improved Resume in Builder
              <ArrowRight className="size-4" />
            </Button>
          </motion.section>
        )}

        {/* Analyze Another */}
        <motion.section variants={itemVariants}>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full rounded-xl h-11 border-primary/30 text-primary hover:bg-primary/10 gap-2"
          >
            <Upload className="size-4" />
            Analyse Another Resume
          </Button>
        </motion.section>
      </motion.div>
    )
  }

  // ── Phase Router ──────────────────────────────────────────────────────

  return (
    <AnimatePresence mode="wait">
      {phase === 'upload' && <div key="upload">{renderUpload()}</div>}
      {phase === 'analyzing' && <div key="analyzing">{renderAnalyzing()}</div>}
      {phase === 'results' && <div key="results">{renderResults()}</div>}
    </AnimatePresence>
  )
}
