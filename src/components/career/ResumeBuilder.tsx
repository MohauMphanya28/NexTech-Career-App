'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText,
  Save,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
}

interface ExperienceEntry {
  id: string
  title: string
  company: string
  periodFrom: string
  periodTo: string
  description: string
}

interface EducationEntry {
  id: string
  degree: string
  institution: string
  year: string
}

interface AIResumeResult {
  personalInfo: PersonalInfo
  summary: string
  experience: Array<{
    title: string
    company: string
    period: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
  skills: string[]
  atsScore: number
  suggestions: string[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6

const STEP_LABELS = [
  'Personal Info',
  'Summary',
  'Experience',
  'Education',
  'Skills',
  'Preview',
]

const TECHNICAL_SKILLS = [
  'Microsoft Word',
  'Microsoft Excel',
  'Microsoft PowerPoint',
  'Google Docs',
  'Google Sheets',
  'Coding/Programming',
  'Data Analysis',
  'Graphic Design',
  'Social Media Management',
  'Digital Marketing',
  'Web Development',
  'Database Management',
  'Project Management Tools',
  'CRM Software',
  'Email Marketing',
  'Video Editing',
  'Photography',
  'Accounting Software',
  'Typing (60+ WPM)',
  'IT Support',
]

const SOFT_SKILLS = [
  'Communication',
  'Leadership',
  'Teamwork',
  'Problem-Solving',
  'Time Management',
  'Adaptability',
  'Critical Thinking',
  'Creativity',
  'Attention to Detail',
  'Customer Service',
  'Negotiation',
  'Conflict Resolution',
  'Public Speaking',
  'Work Ethic',
  'Interpersonal Skills',
  'Decision Making',
  'Stress Management',
  'Active Listening',
]

const INDUSTRY_SKILLS: Record<string, string[]> = {
  'IT & Technology': [
    'JavaScript',
    'Python',
    'Java',
    'SQL',
    'Cloud Computing',
    'Cybersecurity',
    'DevOps',
    'Machine Learning',
    'API Development',
    'Version Control (Git)',
  ],
  'Finance & Accounting': [
    'Financial Analysis',
    'Bookkeeping',
    'Tax Preparation',
    'Budgeting',
    'Risk Management',
    'SAP',
    'Pastel Accounting',
    'Auditing',
    'Financial Reporting',
    'Compliance',
  ],
  Healthcare: [
    'Patient Care',
    'First Aid/CPR',
    'Medical Records',
    'Infection Control',
    'Clinical Research',
    'Health & Safety',
    'Pharmaceutical Knowledge',
    'Laboratory Skills',
    'Vital Signs Monitoring',
    'HIPAA Compliance',
  ],
  Education: [
    'Curriculum Development',
    'Classroom Management',
    'Lesson Planning',
    'Assessment Design',
    'E-Learning',
    'Student Mentoring',
    'Special Needs Education',
    'CAPS Curriculum',
    'Educational Technology',
    'Differentiated Instruction',
  ],
  'Retail & Sales': [
    'Sales Strategy',
    'Inventory Management',
    'POS Systems',
    'Visual Merchandising',
    'Customer Relations',
    'Negotiation',
    'Product Knowledge',
    'Loss Prevention',
    'Cash Handling',
    'Market Research',
  ],
  Engineering: [
    'AutoCAD',
    'MATLAB',
    'Project Management',
    'Quality Assurance',
    'Technical Drawing',
    'Six Sigma',
    'Manufacturing Processes',
    'Health & Safety Standards',
    'PLC Programming',
    'Structural Analysis',
  ],
  'Media & Communications': [
    'Content Writing',
    'Copywriting',
    'SEO/SEM',
    'Adobe Creative Suite',
    'Social Media Strategy',
    'Press Releases',
    'Event Planning',
    'Brand Management',
    'Podcast Production',
    'Journalism',
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).substring(2, 11)
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const {
    currentResume,
    setCurrentResume,
    setCurrentView,
    aiTyping,
    setAiTyping,
    isLoading,
    setIsLoading,
    user,
    setCareerContext,
    setPendingCoverLetterGenerate,
  } = useAppStore()

  // ── Local Form State ────────────────────────────────────────────────────
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<number>(1) // 1 = forward, -1 = back

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedin: '',
  })

  const [summary, setSummary] = useState('')
  const [aiSummarySuggestion, setAiSummarySuggestion] = useState('')

  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    { id: uid(), title: '', company: '', periodFrom: '', periodTo: '', description: '' },
  ])
  const [aiExpSuggestions, setAiExpSuggestions] = useState<Record<string, string>>({})

  const [education, setEducation] = useState<EducationEntry[]>([
    { id: uid(), degree: '', institution: '', year: '' },
  ])

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [aiSkillsSuggestion, setAiSkillsSuggestion] = useState<string[]>([])

  const [generatedResume, setGeneratedResume] = useState<AIResumeResult | null>(null)
  const [atsScore, setAtsScore] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const summaryRef = useRef<HTMLTextAreaElement>(null)

  // ── Step Navigation ─────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  // ── AI: Suggest Summary ─────────────────────────────────────────────────

  const handleAISuggestSummary = useCallback(async () => {
    setAiTyping(true)
    setAiSummarySuggestion('')
    try {
      const contextParts: string[] = []
      if (personalInfo.fullName) contextParts.push(`Name: ${personalInfo.fullName}`)
      if (personalInfo.location) contextParts.push(`Location: ${personalInfo.location}`)
      if (experiences.length > 0) {
        const expStr = experiences
          .filter((e) => e.title || e.company)
          .map((e) => `${e.title} at ${e.company}`)
          .join(', ')
        if (expStr) contextParts.push(`Experience: ${expStr}`)
      }
      if (selectedSkills.length > 0) contextParts.push(`Skills: ${selectedSkills.join(', ')}`)
      if (education.length > 0) {
        const eduStr = education
          .filter((e) => e.degree)
          .map((e) => e.degree)
          .join(', ')
        if (eduStr) contextParts.push(`Education: ${eduStr}`)
      }

      const message = contextParts.length > 0
        ? `Write a professional summary for my resume. Here is my info: ${contextParts.join('. ')}. Keep it to 2-3 concise sentences highlighting key strengths and career goals. South African context.`
        : 'Write a generic professional summary for a young South African job seeker with limited experience. Keep it to 2-3 concise sentences, encouraging and forward-looking.'

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type: 'resume' }),
      })
      const data = await res.json()
      if (data.success && data.response) {
        setAiSummarySuggestion(data.response.trim())
      } else {
        toast.error('Could not generate suggestion. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setAiTyping(false)
    }
  }, [personalInfo, experiences, selectedSkills, education, setAiTyping])

  // ── AI: Improve Experience Description ───────────────────────────────────

  const handleAIImproveExperience = useCallback(
    async (expId: string) => {
      const exp = experiences.find((e) => e.id === expId)
      if (!exp) return
      if (!exp.description.trim()) {
        toast.error('Write a description first, then AI can improve it.')
        return
      }
      setAiTyping(true)
      try {
        const message = `Improve this work experience description for a resume. Make it more professional with action verbs and quantifiable achievements where possible. Keep it concise (2-3 bullet points or a short paragraph). South African professional context.\n\nJob Title: ${exp.title}\nCompany: ${exp.company}\nCurrent Description: ${exp.description}`
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, type: 'resume' }),
        })
        const data = await res.json()
        if (data.success && data.response) {
          setAiExpSuggestions((prev) => ({ ...prev, [expId]: data.response.trim() }))
        } else {
          toast.error('Could not improve description. Please try again.')
        }
      } catch {
        toast.error('Something went wrong. Please try again.')
      } finally {
        setAiTyping(false)
      }
    },
    [experiences, setAiTyping]
  )

  // ── AI: Suggest Skills ──────────────────────────────────────────────────

  const handleAISuggestSkills = useCallback(async () => {
    setAiTyping(true)
    setAiSkillsSuggestion([])
    try {
      const contextParts: string[] = []
      if (personalInfo.fullName) contextParts.push(`Name: ${personalInfo.fullName}`)
      if (experiences.length > 0) {
        const expStr = experiences
          .filter((e) => e.title || e.company)
          .map((e) => `${e.title} at ${e.company}`)
          .join(', ')
        if (expStr) contextParts.push(`Experience: ${expStr}`)
      }
      if (education.length > 0) {
        const eduStr = education
          .filter((e) => e.degree)
          .map((e) => `${e.degree} from ${e.institution}`)
          .join(', ')
        if (eduStr) contextParts.push(`Education: ${eduStr}`)
      }
      if (selectedSkills.length > 0) contextParts.push(`Current skills: ${selectedSkills.join(', ')}`)
      if (selectedIndustry) contextParts.push(`Industry: ${selectedIndustry}`)

      const message = contextParts.length > 0
        ? `Based on my profile, suggest 8-10 relevant skills for my resume. ${contextParts.join('. ')}. Return only a comma-separated list of skill names, no explanation. South African job market context.`
        : 'Suggest 8-10 common resume skills for a young South African job seeker. Return only a comma-separated list of skill names, no explanation.'

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type: 'resume' }),
      })
      const data = await res.json()
      if (data.success && data.response) {
        const skills = data.response
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
        setAiSkillsSuggestion(skills)
      } else {
        toast.error('Could not suggest skills. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setAiTyping(false)
    }
  }, [personalInfo, experiences, education, selectedSkills, selectedIndustry, setAiTyping])

  // ── Generate Full Resume ────────────────────────────────────────────────

  const handleGenerateResume = useCallback(async () => {
    setIsLoading(true)
    try {
      const formattedExperience = experiences
        .filter((e) => e.title || e.company)
        .map((e) => ({
          title: e.title,
          company: e.company,
          period: e.periodTo === 'Present' ? `${e.periodFrom} - Present` : `${e.periodFrom} - ${e.periodTo}`,
          description: e.description,
        }))

      const formattedEducation = education
        .filter((e) => e.degree || e.institution)
        .map((e) => ({
          degree: e.degree,
          institution: e.institution,
          year: e.year,
        }))

      const res = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo,
          summary,
          experience: formattedExperience,
          education: formattedEducation,
          skills: selectedSkills,
          template: 'modern',
        }),
      })

      const data = await res.json()
      if (data.success && data.resume) {
        setGeneratedResume(data.resume)
        setAtsScore(data.resume.atsScore || 0)
        setSuggestions(data.resume.suggestions || [])
      } else {
        toast.error('Could not generate resume. Please try again.')
      }
    } catch {
      toast.error('Something went wrong generating your resume.')
    } finally {
      setIsLoading(false)
    }
  }, [personalInfo, summary, experiences, education, selectedSkills, setIsLoading])

  // ── Save Resume ─────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setIsLoading(true)
    try {
      const resumeData = {
        id: currentResume?.id || uid(),
        title: `${personalInfo.fullName || 'My'} Resume`,
        personalInfo,
        summary: generatedResume?.summary || summary,
        experience:
          generatedResume?.experience ||
          experiences
            .filter((e) => e.title || e.company)
            .map((e) => ({
              title: e.title,
              company: e.company,
              period:
                e.periodTo === 'Present'
                  ? `${e.periodFrom} - Present`
                  : `${e.periodFrom} - ${e.periodTo}`,
              description: e.description,
            })),
        education:
          generatedResume?.education ||
          education
            .filter((e) => e.degree || e.institution)
            .map((e) => ({
              degree: e.degree,
              institution: e.institution,
              year: e.year,
            })),
        skills: generatedResume?.skills || selectedSkills,
        template: 'modern',
        atsScore: atsScore || generatedResume?.atsScore || 0,
      }

      setCurrentResume(resumeData)

      // Save career context for other components to use
      const savedExperience = resumeData.experience || []
      const savedEducation = resumeData.education || []
      setCareerContext({
        resumeJobTitle: savedExperience.length > 0 ? savedExperience[0].title : '',
        resumeCompany: savedExperience.length > 0 ? savedExperience[0].company : '',
        resumeSummary: resumeData.summary || '',
        resumeSkills: resumeData.skills || [],
        resumeExperience: savedExperience,
        resumeEducation: savedEducation,
        resumeCompleted: true,
        currentStep: 'cover-letter',
      })

      // Save to database for document history
      try {
        const storeState = useAppStore.getState()
        // Resolve the real DB user ID — prefer dbUserId, then fetch from API
        let userId = storeState.dbUserId
        if (!userId) {
          try {
            const userRes = await fetch('/api/career-documents')
            const userData = await userRes.json()
            if (userData.userId) {
              userId = userData.userId
              storeState.setDbUserId(userData.userId)
            }
          } catch { /* fall through */ }
        }
        // Determine subType: if currentResume came from analyzer, mark as 'improved'
        const subType = currentResume?.title?.includes('(Improved)') ? 'improved' : 'built'
        // Even without a userId, try to save — the API will auto-create a user
        const saveRes = await fetch('/api/career-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docType: 'resume',
            userId: userId || undefined,
            subType,
            title: resumeData.title,
            personalInfo: resumeData.personalInfo,
            summary: resumeData.summary,
            experience: resumeData.experience,
            education: resumeData.education,
            skills: resumeData.skills,
            template: resumeData.template,
            atsScore: resumeData.atsScore,
            content: resumeData,
            name: resumeData.personalInfo?.fullName || 'User',
          }),
        })
        const saveData = await saveRes.json()
        if (saveData.success) {
          // Capture the resolved userId from the server (in case it was auto-created)
          if (saveData.userId && !storeState.dbUserId) {
            storeState.setDbUserId(saveData.userId)
          }
        } else {
          console.error('Failed to save resume to DB:', saveData.error)
        }
        // Refresh document list in background with correct userId
        const refreshUserId = saveData.userId || userId || storeState.dbUserId
        if (refreshUserId) {
          fetch(`/api/career-documents?userId=${refreshUserId}`).then(r => r.json()).then(d => {
            if (d.success) storeState.setSavedDocuments(d.documents)
          }).catch(() => {})
        }
      } catch (saveErr) {
        console.error('Failed to save resume to DB:', saveErr)
      }

      // Update user data on the backend
      try {
        await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: personalInfo.fullName,
            email: personalInfo.email,
            phone: personalInfo.phone,
            location: personalInfo.location,
            skills: resumeData.skills,
          }),
        })
      } catch {
        // Non-critical, resume is already saved to store
      }

      // Seamless flow: redirect to cover letter generator
      setPendingCoverLetterGenerate(true)
      setCurrentView('cover-letter')
      toast.success('Resume saved! Now let\'s write your cover letter...')
    } catch {
      toast.error('Failed to save resume.')
    } finally {
      setIsLoading(false)
    }
  }, [
    personalInfo,
    summary,
    experiences,
    education,
    selectedSkills,
    generatedResume,
    atsScore,
    currentResume,
    setCurrentResume,
    setCurrentView,
    setIsLoading,
    setCareerContext,
    setPendingCoverLetterGenerate,
  ])

  // ── Skills Toggle ───────────────────────────────────────────────────────

  const toggleSkill = useCallback(
    (skill: string) => {
      setSelectedSkills((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      )
    },
    []
  )

  const addCustomSkill = useCallback(() => {
    const trimmed = customSkill.trim()
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed])
      setCustomSkill('')
    }
  }, [customSkill, selectedSkills])

  // ── Experience Management ───────────────────────────────────────────────

  const addExperience = useCallback(() => {
    setExperiences((prev) => [
      ...prev,
      { id: uid(), title: '', company: '', periodFrom: '', periodTo: '', description: '' },
    ])
  }, [])

  const removeExperience = useCallback((id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id))
    setAiExpSuggestions((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }, [])

  const updateExperience = useCallback(
    (id: string, field: keyof ExperienceEntry, value: string) => {
      setExperiences((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
      )
    },
    []
  )

  // ── Education Management ────────────────────────────────────────────────

  const addEducation = useCallback(() => {
    setEducation((prev) => [
      ...prev,
      { id: uid(), degree: '', institution: '', year: '' },
    ])
  }, [])

  const removeEducation = useCallback((id: string) => {
    setEducation((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const updateEducation = useCallback(
    (id: string, field: keyof EducationEntry, value: string) => {
      setEducation((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
      )
    },
    []
  )

  // ── Reset ───────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setStep(0)
    setDirection(-1)
    setPersonalInfo({ fullName: '', email: '', phone: '', location: '', linkedin: '' })
    setSummary('')
    setAiSummarySuggestion('')
    setExperiences([{ id: uid(), title: '', company: '', periodFrom: '', periodTo: '', description: '' }])
    setAiExpSuggestions({})
    setEducation([{ id: uid(), degree: '', institution: '', year: '' }])
    setSelectedSkills([])
    setCustomSkill('')
    setSelectedIndustry('')
    setAiSkillsSuggestion([])
    setGeneratedResume(null)
    setAtsScore(0)
    setSuggestions([])
  }, [])

  // ── Animation Variants ──────────────────────────────────────────────────

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  }

  // ── Circular Progress for ATS Score ─────────────────────────────────────

  const ATSCircle = ({ score }: { score: number }) => {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color =
      score >= 80
        ? 'oklch(0.72 0.15 180)'
        : score >= 60
          ? 'oklch(0.8 0.15 90)'
          : 'oklch(0.65 0.2 25)'

    return (
      <div className="relative flex items-center justify-center">
        <svg width="128" height="128" className="-rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="oklch(0.25 0.02 260)"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">ATS Score</span>
        </div>
      </div>
    )
  }

  // ── Render Steps ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Let&apos;s start with the basics. This info goes at the top of your resume.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Thabo Mokoena"
            value={personalInfo.fullName}
            onChange={(e) => setPersonalInfo((p) => ({ ...p, fullName: e.target.value }))}
            className="bg-secondary border-border focus:border-primary rounded-lg h-12 text-base"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Email Address <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            placeholder="e.g. thabo@example.co.za"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo((p) => ({ ...p, email: e.target.value }))}
            className="bg-secondary border-border focus:border-primary rounded-lg h-12 text-base"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Phone Number <span className="text-destructive">*</span>
          </label>
          <Input
            type="tel"
            placeholder="e.g. 072 123 4567"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo((p) => ({ ...p, phone: e.target.value }))}
            className="bg-secondary border-border focus:border-primary rounded-lg h-12 text-base"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Location / City <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Johannesburg, Gauteng"
            value={personalInfo.location}
            onChange={(e) => setPersonalInfo((p) => ({ ...p, location: e.target.value }))}
            className="bg-secondary border-border focus:border-primary rounded-lg h-12 text-base"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            LinkedIn <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            placeholder="e.g. linkedin.com/in/thabo-mokoena"
            value={personalInfo.linkedin}
            onChange={(e) => setPersonalInfo((p) => ({ ...p, linkedin: e.target.value }))}
            className="bg-secondary border-border focus:border-primary rounded-lg h-12 text-base"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">Professional Summary</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell employers who you are and what you bring to the table.
        </p>
      </div>

      <div className="glass rounded-xl p-4 mb-2">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            A good summary is 2-3 sentences highlighting your key strengths and career goals.
            Think of it as your elevator pitch on paper.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-foreground">Your Summary</label>
          <span className="text-xs text-muted-foreground">
            {summary.length}/500
          </span>
        </div>
        <Textarea
          ref={summaryRef}
          placeholder="e.g. Motivated and detail-oriented recent graduate with a National Diploma in Information Technology. Skilled in problem-solving, teamwork, and eager to apply technical knowledge in a professional environment."
          value={summary}
          onChange={(e) => {
            if (e.target.value.length <= 500) setSummary(e.target.value)
          }}
          className="bg-secondary border-border focus:border-primary rounded-lg min-h-[140px] text-base leading-relaxed"
          maxLength={500}
        />
      </div>

      <Button
        variant="outline"
        onClick={handleAISuggestSummary}
        disabled={aiTyping}
        className="w-full border-primary/30 text-primary hover:bg-primary/10 rounded-lg h-11"
      >
        {aiTyping ? (
          <>
            <div className="flex gap-1 mr-2">
              <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
              <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
              <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
            </div>
            AI is thinking...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Suggest Summary
          </>
        )}
      </Button>

      <AnimatePresence>
        {aiSummarySuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Suggestion</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              {aiSummarySuggestion}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setSummary(aiSummarySuggestion)
                  setAiSummarySuggestion('')
                  toast.success('Summary applied!')
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAiSummarySuggestion('')}
                className="text-muted-foreground hover:text-foreground rounded-lg"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">Work Experience</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add your relevant work history. Start with the most recent.
        </p>
      </div>

      {experiences.map((exp, idx) => (
        <Card key={exp.id} className="glass border-border/50 rounded-xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-md">
                Experience {idx + 1}
              </Badge>
              {experiences.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExperience(exp.id)}
                  className="text-destructive hover:bg-destructive/20 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Input
              placeholder="Job Title"
              value={exp.title}
              onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
              className="bg-secondary border-border focus:border-primary rounded-lg h-11"
            />
            <Input
              placeholder="Company Name"
              value={exp.company}
              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
              className="bg-secondary border-border focus:border-primary rounded-lg h-11"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="From (e.g. Jan 2023)"
                value={exp.periodFrom}
                onChange={(e) => updateExperience(exp.id, 'periodFrom', e.target.value)}
                className="bg-secondary border-border focus:border-primary rounded-lg h-11"
              />
              <Input
                placeholder="To (e.g. Present)"
                value={exp.periodTo}
                onChange={(e) => updateExperience(exp.id, 'periodTo', e.target.value)}
                className="bg-secondary border-border focus:border-primary rounded-lg h-11"
              />
            </div>
            <div>
              <Textarea
                placeholder="Describe your key responsibilities and achievements..."
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                className="bg-secondary border-border focus:border-primary rounded-lg min-h-[80px] text-sm leading-relaxed"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIImproveExperience(exp.id)}
                disabled={aiTyping || !exp.description.trim()}
                className="mt-2 text-primary hover:bg-primary/10 rounded-lg text-xs h-8"
              >
                {aiTyping ? (
                  <>
                    <div className="flex gap-1 mr-1.5">
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                    </div>
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    AI Improve
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {aiExpSuggestions[exp.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass rounded-lg p-3"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Improvement</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed mb-2 whitespace-pre-line">
                    {aiExpSuggestions[exp.id]}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3"
                      onClick={() => {
                        updateExperience(exp.id, 'description', aiExpSuggestions[exp.id])
                        setAiExpSuggestions((prev) => {
                          const copy = { ...prev }
                          delete copy[exp.id]
                          return copy
                        })
                        toast.success('Description improved!')
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground rounded-md px-3"
                      onClick={() =>
                        setAiExpSuggestions((prev) => {
                          const copy = { ...prev }
                          delete copy[exp.id]
                          return copy
                        })
                      }
                    >
                      Dismiss
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ))}

      <button
        onClick={addExperience}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-xl text-primary hover:bg-primary/5 transition-colors text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Add Another Experience
      </button>

      <button
        onClick={() => {
          setExperiences([])
          toast('No worries! We\'ll focus on your education and skills instead.')
        }}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        No work experience yet? That&apos;s okay! <span className="underline">Skip this section</span>
      </button>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">Education</h2>
        <p className="text-sm text-muted-foreground mt-1">
          List your qualifications, degrees, and certifications.
        </p>
      </div>

      {education.map((edu, idx) => (
        <Card key={edu.id} className="glass border-border/50 rounded-xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-md">
                Education {idx + 1}
              </Badge>
              {education.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducation(edu.id)}
                  className="text-destructive hover:bg-destructive/20 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Input
              placeholder="Degree / Certificate (e.g. National Diploma in IT)"
              value={edu.degree}
              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
              className="bg-secondary border-border focus:border-primary rounded-lg h-11"
            />
            <Input
              placeholder="Institution (e.g. Tshwane University of Technology)"
              value={edu.institution}
              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
              className="bg-secondary border-border focus:border-primary rounded-lg h-11"
            />
            <Input
              placeholder="Year (e.g. 2023)"
              value={edu.year}
              onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
              className="bg-secondary border-border focus:border-primary rounded-lg h-11"
            />
          </CardContent>
        </Card>
      ))}

      <button
        onClick={addEducation}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-xl text-primary hover:bg-primary/5 transition-colors text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Add Another Qualification
      </button>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">Skills</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select skills that match your abilities. You can always add custom ones too.
        </p>
      </div>

      <Button
        variant="outline"
        onClick={handleAISuggestSkills}
        disabled={aiTyping}
        className="w-full border-primary/30 text-primary hover:bg-primary/10 rounded-lg h-11"
      >
        {aiTyping ? (
          <>
            <div className="flex gap-1 mr-2">
              <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
              <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
              <span className="typing-dot h-2 w-2 rounded-full bg-primary inline-block" />
            </div>
            AI is thinking...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Suggest Skills
          </>
        )}
      </Button>

      <AnimatePresence>
        {aiSkillsSuggestion.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Suggested Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSkillsSuggestion.map((skill) => (
                <Button
                  key={skill}
                  size="sm"
                  variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                  className={`rounded-lg text-xs h-8 ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:bg-primary/10'
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {selectedSkills.includes(skill) ? '✓ ' : '+ '}
                  {skill}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Technical Skills */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Technical Skills</h3>
        <div className="flex flex-wrap gap-2">
          {TECHNICAL_SKILLS.map((skill) => (
            <Button
              key={skill}
              size="sm"
              variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
              className={`rounded-lg text-xs h-8 ${
                selectedSkills.includes(skill)
                  ? 'bg-primary text-primary-foreground'
                  : 'border-border text-foreground hover:bg-primary/10'
              }`}
              onClick={() => toggleSkill(skill)}
            >
              {selectedSkills.includes(skill) ? '✓ ' : ''}
              {skill}
            </Button>
          ))}
        </div>
      </div>

      {/* Soft Skills */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Soft Skills</h3>
        <div className="flex flex-wrap gap-2">
          {SOFT_SKILLS.map((skill) => (
            <Button
              key={skill}
              size="sm"
              variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
              className={`rounded-lg text-xs h-8 ${
                selectedSkills.includes(skill)
                  ? 'bg-primary text-primary-foreground'
                  : 'border-border text-foreground hover:bg-primary/10'
              }`}
              onClick={() => toggleSkill(skill)}
            >
              {selectedSkills.includes(skill) ? '✓ ' : ''}
              {skill}
            </Button>
          ))}
        </div>
      </div>

      {/* Industry-specific Skills */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Industry-Specific Skills</h3>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="w-full bg-secondary border border-border rounded-lg h-11 px-3 text-sm text-foreground mb-3 focus:border-primary focus:outline-none"
        >
          <option value="">Select an industry...</option>
          {Object.keys(INDUSTRY_SKILLS).map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        {selectedIndustry && INDUSTRY_SKILLS[selectedIndustry] && (
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_SKILLS[selectedIndustry].map((skill) => (
              <Button
                key={skill}
                size="sm"
                variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                className={`rounded-lg text-xs h-8 ${
                  selectedSkills.includes(skill)
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:bg-primary/10'
                }`}
                onClick={() => toggleSkill(skill)}
              >
                {selectedSkills.includes(skill) ? '✓ ' : ''}
                {skill}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Skill Input */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Add Custom Skill</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Type a skill..."
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomSkill()
              }
            }}
            className="bg-secondary border-border focus:border-primary rounded-lg h-11 flex-1"
          />
          <Button
            onClick={addCustomSkill}
            disabled={!customSkill.trim()}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 rounded-lg h-11 px-4"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Skills Summary */}
      {selectedSkills.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Selected Skills ({selectedSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="rounded-lg bg-primary/20 text-primary border-primary/30 px-2.5 py-1 gap-1 cursor-pointer hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 transition-colors"
                onClick={() => toggleSkill(skill)}
              >
                {skill}
                <span className="ml-0.5 text-[10px]">✕</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">Preview & Generate</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your resume, then let AI polish it for the best results.
        </p>
      </div>

      {/* Resume Preview */}
      <Card className="glass border-border/50 rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg gradient-text">Resume Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="bg-background/50 rounded-lg p-4 space-y-4 text-sm max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="text-center border-b border-border pb-3">
              <h3 className="text-xl font-bold text-foreground">
                {generatedResume?.personalInfo?.fullName || personalInfo.fullName || 'Your Name'}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-muted-foreground text-xs">
                {((generatedResume?.personalInfo?.email || personalInfo.email)) && (
                  <span>{generatedResume?.personalInfo?.email || personalInfo.email}</span>
                )}
                {((generatedResume?.personalInfo?.phone || personalInfo.phone)) && (
                  <span>{generatedResume?.personalInfo?.phone || personalInfo.phone}</span>
                )}
                {((generatedResume?.personalInfo?.location || personalInfo.location)) && (
                  <span>{generatedResume?.personalInfo?.location || personalInfo.location}</span>
                )}
                {((generatedResume?.personalInfo?.linkedin || personalInfo.linkedin)) && (
                  <span>{generatedResume?.personalInfo?.linkedin || personalInfo.linkedin}</span>
                )}
              </div>
            </div>

            {/* Summary */}
            {(generatedResume?.summary || summary) && (
              <div>
                <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-1">
                  Professional Summary
                </h4>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {generatedResume?.summary || summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {((generatedResume?.experience?.length || 0) > 0 ||
              experiences.some((e) => e.title || e.company)) && (
              <div>
                <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-1">
                  Experience
                </h4>
                {(generatedResume?.experience ||
                  experiences
                    .filter((e) => e.title || e.company)
                    .map((e) => ({
                      title: e.title,
                      company: e.company,
                      period:
                        e.periodTo === 'Present'
                          ? `${e.periodFrom} - Present`
                          : `${e.periodFrom} - ${e.periodTo}`,
                      description: e.description,
                    }))).map((exp, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-foreground text-xs">{exp.title}</span>
                      <span className="text-muted-foreground text-[10px]">{exp.period}</span>
                    </div>
                    <span className="text-muted-foreground text-[10px]">{exp.company}</span>
                    {exp.description && (
                      <p className="text-muted-foreground text-[10px] mt-0.5 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {((generatedResume?.education?.length || 0) > 0 ||
              education.some((e) => e.degree || e.institution)) && (
              <div>
                <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-1">
                  Education
                </h4>
                {(generatedResume?.education ||
                  education
                    .filter((e) => e.degree || e.institution)
                    .map((e) => ({
                      degree: e.degree,
                      institution: e.institution,
                      year: e.year,
                    }))).map((edu, i) => (
                  <div key={i} className="mb-1.5 last:mb-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-foreground text-xs">{edu.degree}</span>
                      <span className="text-muted-foreground text-[10px]">{edu.year}</span>
                    </div>
                    <span className="text-muted-foreground text-[10px]">{edu.institution}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {((generatedResume?.skills?.length || selectedSkills.length) > 0) && (
              <div>
                <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-1">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(generatedResume?.skills || selectedSkills).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ATS Score */}
      {(atsScore > 0 || generatedResume) && (
        <div className="glass rounded-xl p-4 flex flex-col items-center gap-3">
          <ATSCircle score={atsScore || generatedResume?.atsScore || 0} />
          <p className="text-sm text-muted-foreground text-center">
            {atsScore >= 80
              ? 'Great! Your resume is well-optimized for ATS scanning.'
              : atsScore >= 60
                ? 'Good start! A few improvements could boost your ATS score.'
                : 'Consider adding more details to improve your ATS compatibility.'}
          </p>
        </div>
      )}

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && (
        <Card className="glass border-border/50 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerateResume}
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 text-base font-semibold glow-teal-sm"
      >
        {isLoading ? (
          <>
            <div className="flex gap-1 mr-2">
              <span className="typing-dot h-2 w-2 rounded-full bg-primary-foreground inline-block" />
              <span className="typing-dot h-2 w-2 rounded-full bg-primary-foreground inline-block" />
              <span className="typing-dot h-2 w-2 rounded-full bg-primary-foreground inline-block" />
            </div>
            Generating your polished resume...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Generate with AI
          </>
        )}
      </Button>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        variant="outline"
        className="w-full border-primary/30 text-primary hover:bg-primary/10 rounded-xl h-12 text-base font-semibold"
      >
        <Save className="h-5 w-5 mr-2" />
        Save Resume
      </Button>
    </div>
  )

  const stepRenderers = [
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
  ]

  // ── Main Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header / Progress ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 glass-strong">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground text-sm">Resume Builder</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {step + 1}/{TOTAL_STEPS}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Start over"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            value={((step + 1) / TOTAL_STEPS) * 100}
            className="h-2 rounded-full"
          />

          {/* Step Labels */}
          <div className="flex justify-between mt-2">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`text-[10px] transition-colors ${
                  i === step
                    ? 'text-primary font-semibold'
                    : i < step
                      ? 'text-primary/60'
                      : 'text-muted-foreground/50'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step Content ──────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {stepRenderers[step]()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation Footer ─────────────────────────────────────────── */}
      <div className="sticky bottom-0 glass-strong px-4 py-3 flex items-center gap-3">
        {step > 0 ? (
          <Button
            variant="outline"
            onClick={goBack}
            className="flex-1 border-border text-foreground hover:bg-secondary rounded-xl h-12"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
        ) : (
          <div className="flex-1" />
        )}

        {step < TOTAL_STEPS - 1 && (
          <Button
            onClick={goNext}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-semibold"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        )}

        {step === TOTAL_STEPS - 1 && <div className="flex-1" />}
      </div>
    </div>
  )
}
