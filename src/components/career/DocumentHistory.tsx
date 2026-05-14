'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Mail,
  Mic,
  Trash2,
  Sparkles,
  Search as SearchIcon,
  ChevronRight,
  Shield,
  TrendingUp,
  Award,
  Clock,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RotateCcw,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocumentItem {
  id: string
  type: 'resume' | 'cover-letter' | 'interview'
  subType: string
  title: string
  createdAt: string
  atsScore?: number
  overallScore?: number
  confidence?: number
  clarity?: number
  relevance?: number
  completed?: boolean
  jobTitle?: string
  company?: string
  tone?: string
  wordCount?: number
  originalFileName?: string
  hasAnalysis?: boolean
  summary?: string
  skills?: string[]
  personalInfo?: Record<string, string>
  industry?: string
}

type DetailView = null | { type: string; id: string }

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDocIcon(type: string, subType: string) {
  if (type === 'resume') {
    if (subType === 'analyzed') return <SearchIcon className="size-4 text-rose-400" />
    if (subType === 'improved') return <Sparkles className="size-4 text-teal-400" />
    return <FileText className="size-4 text-teal-400" />
  }
  if (type === 'cover-letter') return <Mail className="size-4 text-cyan-400" />
  if (type === 'interview') return <Mic className="size-4 text-purple-400" />
  return <FileText className="size-4 text-muted-foreground" />
}

function getDocAccent(type: string) {
  if (type === 'resume') return 'border-teal-500/20 bg-teal-500/5'
  if (type === 'cover-letter') return 'border-cyan-500/20 bg-cyan-500/5'
  if (type === 'interview') return 'border-purple-500/20 bg-purple-500/5'
  return 'border-border bg-secondary'
}

function getDocIconBg(type: string, subType: string) {
  if (type === 'resume') {
    if (subType === 'analyzed') return 'bg-rose-400/15'
    if (subType === 'improved') return 'bg-teal-400/15'
    return 'bg-teal-400/15'
  }
  if (type === 'cover-letter') return 'bg-cyan-400/15'
  if (type === 'interview') return 'bg-purple-400/15'
  return 'bg-secondary'
}

function getSubTypeLabel(subType: string) {
  const labels: Record<string, string> = {
    built: 'Built',
    analyzed: 'Analyzed',
    improved: 'AI-Improved',
    generated: 'Generated',
    practice: 'Practice',
  }
  return labels[subType] || subType
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DocumentHistory() {
  const { setCurrentView, savedDocuments, setSavedDocuments, dbUserId, setDbUserId, user, setCareerContext, setCurrentResume, setCoverLetterContent, setCoverLetterJobTitle, setCoverLetterCompany, setCoverLetterJobDesc, setCoverLetterTone } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'resume' | 'cover-letter' | 'interview'>('all')
  const [loading, setLoading] = useState(true)
  const [detailView, setDetailView] = useState<DetailView>(null)
  const [detailData, setDetailData] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // ── Fetch Documents ───────────────────────────────────────────────────

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const url = dbUserId
        ? `/api/career-documents?userId=${dbUserId}`
        : '/api/career-documents'
      const res = await fetch(url)
      if (!res.ok) {
        try { await res.json() } catch {}
        setSavedDocuments([])
        return
      }
      const data = await res.json()
      if (data.success) {
        setSavedDocuments(data.documents)
        if (data.userId && !dbUserId) {
          setDbUserId(data.userId)
        }
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }, [dbUserId, setSavedDocuments, setDbUserId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // ── Fetch Single Document ─────────────────────────────────────────────

  const fetchDocumentDetail = useCallback(async (type: string, id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/career-documents/${id}?type=${type}`)
      const data = await res.json()
      if (data.success) {
        setDetailData(data.document)
        setDetailView({ type, id })
      } else {
        toast.error('Could not load document details.')
      }
    } catch {
      toast.error('Failed to load document.')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // ── Delete Document ───────────────────────────────────────────────────

  const handleDelete = useCallback(async (type: string, id: string) => {
    try {
      const res = await fetch(`/api/career-documents?id=${id}&type=${type}`, { method: 'DELETE' })
      if (res.ok) {
        setSavedDocuments(savedDocuments.filter((d: DocumentItem) => !(d.id === id && d.type === type)))
        toast.success('Document deleted')
        if (detailView?.id === id) {
          setDetailView(null)
          setDetailData(null)
        }
      } else {
        toast.error('Could not delete document')
      }
    } catch {
      toast.error('Failed to delete document')
    }
  }, [savedDocuments, setSavedDocuments, detailView])

  // ── Load Document for Re-use ──────────────────────────────────────────

  const handleReuse = useCallback((doc: DocumentItem) => {
    if (doc.type === 'resume') {
      fetchDocumentDetail('resume', doc.id).then(() => {
        // Will be handled after detail loads
      })
    } else if (doc.type === 'cover-letter') {
      fetchDocumentDetail('cover-letter', doc.id).then(() => {
        // Will be handled after detail loads
      })
    }
  }, [fetchDocumentDetail])

  // When detailData loads for reuse, load it into the appropriate component
  useEffect(() => {
    if (!detailData || !detailView) return

    // Only auto-navigate if user explicitly clicked reuse (we track this with a flag)
  }, [detailData, detailView])

  // ── Filter Documents ──────────────────────────────────────────────────

  const filteredDocs = (savedDocuments as DocumentItem[]).filter((doc) => {
    if (filterType !== 'all' && doc.type !== filterType) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.subType.toLowerCase().includes(q) ||
        (doc.jobTitle && doc.jobTitle.toLowerCase().includes(q)) ||
        (doc.company && doc.company.toLowerCase().includes(q)) ||
        (doc.industry && doc.industry.toLowerCase().includes(q))
      )
    }
    return true
  })

  // ── Group by date ─────────────────────────────────────────────────────

  const groupedDocs = filteredDocs.reduce<Record<string, DocumentItem[]>>((acc, doc) => {
    const date = new Date(doc.createdAt)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

    let group: string
    if (diffDays === 0) group = 'Today'
    else if (diffDays === 1) group = 'Yesterday'
    else if (diffDays < 7) group = 'This Week'
    else if (diffDays < 30) group = 'This Month'
    else group = 'Older'

    if (!acc[group]) acc[group] = []
    acc[group].push(doc)
    return acc
  }, {})

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']

  // ── Stats ─────────────────────────────────────────────────────────────

  const allDocs = savedDocuments as DocumentItem[]
  const resumeCount = allDocs.filter((d) => d.type === 'resume').length
  const letterCount = allDocs.filter((d) => d.type === 'cover-letter').length
  const interviewCount = allDocs.filter((d) => d.type === 'interview').length

  // ── Render: Detail View ───────────────────────────────────────────────

  const renderDetail = () => {
    if (!detailData) return null

    if (detailView?.type === 'resume') {
      const doc = detailData
      const analysisData = doc.analysisData && typeof doc.analysisData === 'object' && Object.keys(doc.analysisData).length > 0
        ? doc.analysisData as {
            overallScore?: number
            atsCompatibility?: { score: number; issues: string[]; tips: string[] }
            contentAnalysis?: {
              summary?: { score: number; feedback: string }
              experience?: { score: number; feedback: string }
              education?: { score: number; feedback: string }
              skills?: { score: number; feedback: string }
            }
            strengths?: string[]
            weaknesses?: string[]
            keyInsight?: string
            improvedResume?: any
          }
        : null

      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col gap-5"
        >
          {/* Back button */}
          <button
            onClick={() => { setDetailView(null); setDetailData(null) }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Documents
          </button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${getDocIconBg('resume', doc.type)}`}>
              {doc.type === 'analyzed' ? <SearchIcon className="size-5 text-rose-400" /> : doc.type === 'improved' ? <Sparkles className="size-5 text-teal-400" /> : <FileText className="size-5 text-teal-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{doc.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="rounded-md text-[10px]">{getSubTypeLabel(doc.type)}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Analysis Overview (for analyzed resumes with analysis data) */}
          {analysisData && (
            <>
              {/* Key Insight */}
              {analysisData.keyInsight && (
                <div className="glass-strong rounded-2xl p-4 flex items-start gap-3 border border-teal-400/20">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-400/15">
                    <Lightbulb className="size-4 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">Key Insight</p>
                    <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed">{analysisData.keyInsight}</p>
                  </div>
                </div>
              )}

              {/* Score Overview */}
              <Card className="glass rounded-2xl p-4">
                <div className="flex items-center justify-around">
                  {analysisData.overallScore !== undefined && (
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full border-4 border-teal-400/30 flex items-center justify-center">
                        <span className="text-xl font-bold text-teal-400">{analysisData.overallScore}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">Overall</span>
                    </div>
                  )}
                  {analysisData.atsCompatibility && (
                    <div className="flex flex-col items-center">
                      <div className="size-14 rounded-full border-4 border-cyan-400/30 flex items-center justify-center">
                        <span className="text-lg font-bold text-cyan-400">{analysisData.atsCompatibility.score}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">ATS</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Section Scores */}
              {analysisData.contentAnalysis && (
                <Card className="glass rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Breakdown</h3>
                  {[
                    { label: 'Summary', score: analysisData.contentAnalysis.summary?.score },
                    { label: 'Experience', score: analysisData.contentAnalysis.experience?.score },
                    { label: 'Education', score: analysisData.contentAnalysis.education?.score },
                    { label: 'Skills', score: analysisData.contentAnalysis.skills?.score },
                  ].filter(s => s.score !== undefined).map(s => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{s.label}</span>
                        <span className="font-medium text-foreground">{s.score}/100</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div
                          className={`h-1.5 rounded-full ${s.score! >= 80 ? 'bg-teal-400' : s.score! >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </Card>
              )}

              {/* Strengths & Weaknesses */}
              {(analysisData.strengths?.length > 0 || analysisData.weaknesses?.length > 0) && (
                <div className="grid gap-3">
                  {analysisData.strengths?.length > 0 && (
                    <Card className="glass rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="size-4 text-teal-400" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-400">Strengths</h3>
                      </div>
                      <ul className="space-y-1">
                        {analysisData.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-foreground/85 flex items-start gap-1.5">
                            <span className="text-teal-400 mt-1 shrink-0">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {analysisData.weaknesses?.length > 0 && (
                    <Card className="glass rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="size-4 text-amber-400" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Areas for Improvement</h3>
                      </div>
                      <ul className="space-y-1">
                        {analysisData.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm text-foreground/85 flex items-start gap-1.5">
                            <span className="text-amber-400 mt-1 shrink-0">•</span>{w}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

              {/* Divider between analysis and resume content */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resume Content</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {/* ATS Score */}
          {doc.atsScore > 0 && !analysisData && (
            <Card className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className="size-14 rounded-full border-4 border-teal-400/30 flex items-center justify-center">
                <span className="text-lg font-bold text-teal-400">{doc.atsScore}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">ATS Compatibility Score</p>
                <p className="text-xs text-muted-foreground mt-0.5">{doc.atsScore >= 80 ? 'Excellent' : doc.atsScore >= 60 ? 'Good' : 'Needs improvement'}</p>
              </div>
            </Card>
          )}

          {/* Personal Info */}
          {doc.personalInfo && (
            <Card className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Personal Info</h3>
              <div className="space-y-1.5 text-sm">
                {doc.personalInfo.fullName && <p className="text-foreground font-medium">{doc.personalInfo.fullName}</p>}
                {doc.personalInfo.email && <p className="text-muted-foreground">{doc.personalInfo.email}</p>}
                {doc.personalInfo.phone && <p className="text-muted-foreground">{doc.personalInfo.phone}</p>}
                {doc.personalInfo.location && <p className="text-muted-foreground">{doc.personalInfo.location}</p>}
              </div>
            </Card>
          )}

          {/* Summary */}
          {doc.summary && (
            <Card className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Professional Summary</h3>
              <p className="text-sm text-foreground/85 leading-relaxed">{doc.summary}</p>
            </Card>
          )}

          {/* Experience */}
          {doc.experience && Array.isArray(doc.experience) && doc.experience.length > 0 && (
            <Card className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Experience</h3>
              <div className="space-y-3">
                {doc.experience.map((exp: any, i: number) => (
                  <div key={i} className="border-l-2 border-teal-400/30 pl-3">
                    <p className="text-sm font-medium text-foreground">{exp.title}{exp.company ? ` at ${exp.company}` : ''}</p>
                    {exp.period && <p className="text-xs text-muted-foreground">{exp.period}</p>}
                    {exp.description && <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education */}
          {doc.education && Array.isArray(doc.education) && doc.education.length > 0 && (
            <Card className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Education</h3>
              <div className="space-y-2">
                {doc.education.map((edu: any, i: number) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-foreground">{edu.degree}</p>
                    {edu.institution && <p className="text-xs text-muted-foreground">{edu.institution} {edu.year ? `• ${edu.year}` : ''}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Skills */}
          {doc.skills && Array.isArray(doc.skills) && doc.skills.length > 0 && (
            <Card className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {doc.skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary" className="rounded-md text-xs">{skill}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                // Load into resume builder
                const resumeData = {
                  id: doc.id,
                  title: doc.title,
                  personalInfo: doc.personalInfo || {},
                  summary: doc.summary || '',
                  experience: doc.experience || [],
                  education: doc.education || [],
                  skills: doc.skills || [],
                  template: doc.template || 'modern',
                  atsScore: doc.atsScore || 0,
                }
                setCurrentResume(resumeData)
                setCareerContext({
                  resumeJobTitle: doc.experience?.[0]?.title || '',
                  resumeCompany: doc.experience?.[0]?.company || '',
                  resumeSummary: doc.summary || '',
                  resumeSkills: doc.skills || [],
                  resumeExperience: doc.experience || [],
                  resumeEducation: doc.education || [],
                  resumeCompleted: true,
                  currentStep: 'cover-letter',
                })
                setCurrentView('resume')
                toast.success('Resume loaded into builder!')
              }}
              className="flex-1 bg-teal-500 text-white hover:bg-teal-400 rounded-xl gap-2"
            >
              <RotateCcw className="size-4" />
              Load into Builder
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDelete('resume', doc.id)}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl gap-2"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </motion.div>
      )
    }

    if (detailView?.type === 'cover-letter') {
      const doc = detailData
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col gap-5"
        >
          <button
            onClick={() => { setDetailView(null); setDetailData(null) }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Documents
          </button>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-cyan-400/15 flex items-center justify-center">
              <Mail className="size-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{doc.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="rounded-md text-[10px]">{doc.tone} tone</Badge>
                <span className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <Card className="glass-strong rounded-2xl p-5">
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{doc.content}</div>
          </Card>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{doc.content ? doc.content.trim().split(/\s+/).filter(Boolean).length : 0} words</span>
            <span>{doc.jobTitle} at {doc.company}</span>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={async () => {
                setCoverLetterContent(doc.content || '')
                setCoverLetterJobTitle(doc.jobTitle || '')
                setCoverLetterCompany(doc.company || '')
                setCoverLetterJobDesc(doc.jobDesc || '')
                setCoverLetterTone(doc.tone || 'formal')
                setCareerContext({
                  coverLetterJobTitle: doc.jobTitle || '',
                  coverLetterCompany: doc.company || '',
                  coverLetterTone: doc.tone || 'formal',
                  coverLetterCompleted: true,
                  currentStep: 'interview',
                })
                setCurrentView('cover-letter')
                toast.success('Cover letter loaded!')
              }}
              className="flex-1 bg-cyan-500 text-white hover:bg-cyan-400 rounded-xl gap-2"
            >
              <RotateCcw className="size-4" />
              Load into Editor
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDelete('cover-letter', doc.id)}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl gap-2"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </motion.div>
      )
    }

    if (detailView?.type === 'interview') {
      const doc = detailData
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col gap-5"
        >
          <button
            onClick={() => { setDetailView(null); setDetailData(null) }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Documents
          </button>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-400/15 flex items-center justify-center">
              <Mic className="size-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{doc.industry} Interview</h2>
              <span className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Scores */}
          <Card className="glass rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="size-14 rounded-full border-4 border-purple-400/30 flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-purple-400">{Math.round(doc.overallScore * 10) / 10}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Overall</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Confidence', value: doc.confidence, color: 'bg-teal-400' },
                  { label: 'Clarity', value: doc.clarity, color: 'bg-cyan-400' },
                  { label: 'Relevance', value: doc.relevance, color: 'bg-amber-400' },
                ].map((s) => (
                  <div key={s.label} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium text-foreground">{Math.round(s.value * 10) / 10}/10</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary">
                      <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${(s.value / 10) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Q&A Pairs */}
          {doc.questions && Array.isArray(doc.questions) && doc.questions.length > 0 && (
            <Card className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Questions & Answers</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {doc.questions.map((q: string, i: number) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="rounded-md text-[9px] shrink-0 mt-0.5">Q{i + 1}</Badge>
                      <p className="text-sm text-foreground/90">{q}</p>
                    </div>
                    {doc.answers?.[i] && (
                      <div className="flex items-start gap-2 ml-6">
                        <span className="text-teal-400 text-xs shrink-0 mt-0.5">A:</span>
                        <p className="text-xs text-foreground/70 leading-relaxed">{doc.answers[i]}</p>
                      </div>
                    )}
                    {doc.feedback?.[i] && (
                      <div className="flex items-start gap-2 ml-6">
                        <span className="text-amber-400 text-xs shrink-0 mt-0.5">💡</span>
                        <p className="text-xs text-amber-400/70 leading-relaxed">{doc.feedback[i]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button
            variant="outline"
            onClick={() => handleDelete('interview', doc.id)}
            className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl gap-2"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </motion.div>
      )
    }

    return null
  }

  // ── Render: Document List ─────────────────────────────────────────────

  const renderList = () => (
    <motion.div
      className="flex min-h-screen flex-col gap-5 px-4 pb-28 pt-6"
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
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">My Documents</h1>
          <p className="text-xs text-muted-foreground">Your saved resumes, letters & interviews</p>
        </div>
      </motion.header>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="flex gap-2">
        {[
          { icon: <FileText className="size-3.5 text-teal-400" />, label: 'Resumes', count: resumeCount },
          { icon: <Mail className="size-3.5 text-cyan-400" />, label: 'Letters', count: letterCount },
          { icon: <Mic className="size-3.5 text-purple-400" />, label: 'Interviews', count: interviewCount },
        ].map((stat) => (
          <div key={stat.label} className="glass flex items-center gap-2 rounded-xl px-3 py-2">
            {stat.icon}
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-bold text-foreground">{stat.count}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary border-border pl-9 rounded-xl h-11"
          />
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2">
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'resume' as const, label: 'Resumes' },
          { key: 'cover-letter' as const, label: 'Letters' },
          { key: 'interview' as const, label: 'Interviews' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`
              rounded-lg px-3 py-1.5 text-xs font-medium transition-all
              ${filterType === tab.key
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                : 'bg-secondary text-muted-foreground border border-border hover:border-primary/30'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Document List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="size-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <FolderOpen className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No documents yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Start by building a resume, writing a cover letter, or practicing an interview. Your work will be saved here automatically.
            </p>
            <Button
              onClick={() => setCurrentView('resume')}
              className="mt-4 bg-teal-500 text-white hover:bg-teal-400 rounded-xl gap-2"
            >
              <Sparkles className="size-4" />
              Build Your First Resume
            </Button>
          </div>
        ) : (
          // Grouped document list
          groupOrder.map((group) => {
            const docs = groupedDocs[group]
            if (!docs || docs.length === 0) return null

            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <motion.button
                      key={`${doc.type}-${doc.id}`}
                      onClick={() => fetchDocumentDetail(doc.type, doc.id)}
                      className={`
                        w-full rounded-2xl p-3.5 border text-left
                        transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]
                        ${getDocAccent(doc.type)}
                      `}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${getDocIconBg(doc.type, doc.subType)}`}>
                          {getDocIcon(doc.type, doc.subType)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="secondary" className="rounded-md text-[9px] px-1.5 py-0 h-4">
                              {getSubTypeLabel(doc.subType)}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">{getRelativeTime(doc.createdAt)}</span>
                          </div>

                          {/* Preview details */}
                          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                            {doc.type === 'resume' && doc.atsScore > 0 && (
                              <span className="flex items-center gap-1">
                                <Shield className="size-3 text-teal-400" />
                                ATS: {doc.atsScore}
                              </span>
                            )}
                            {doc.type === 'resume' && doc.hasAnalysis && (
                              <span className="flex items-center gap-1 text-teal-400">
                                <Eye className="size-3" />
                                Analysis
                              </span>
                            )}
                            {doc.type === 'resume' && doc.originalFileName && (
                              <span className="truncate max-w-[120px]">{doc.originalFileName}</span>
                            )}
                            {doc.type === 'cover-letter' && doc.jobTitle && (
                              <span>{doc.jobTitle} at {doc.company}</span>
                            )}
                            {doc.type === 'cover-letter' && doc.wordCount !== undefined && (
                              <span>{doc.wordCount} words</span>
                            )}
                            {doc.type === 'interview' && (
                              <span className="flex items-center gap-1">
                                <Award className="size-3 text-purple-400" />
                                Score: {Math.round((doc.overallScore || 0) * 10) / 10}/10
                              </span>
                            )}
                            {doc.type === 'interview' && doc.completed && (
                              <span className="flex items-center gap-0.5 text-emerald-400">
                                <CheckCircle2 className="size-3" />
                                Completed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 mt-2" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </motion.div>
    </motion.div>
  )

  // ── Main Render ───────────────────────────────────────────────────────

  return (
    <AnimatePresence mode="wait">
      {detailView ? (
        <div key="detail" className="flex min-h-screen flex-col px-4 pb-28 pt-6">
          {detailLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="size-10 rounded-xl bg-teal-400/15 flex items-center justify-center animate-pulse">
                  <Eye className="size-5 text-teal-400" />
                </div>
                <p className="text-sm text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : (
            renderDetail()
          )}
        </div>
      ) : (
        <div key="list">
          {renderList()}
        </div>
      )}
    </AnimatePresence>
  )
}
