import { create } from 'zustand'

export type AppView = 'dashboard' | 'onboarding' | 'resume' | 'resume-analyzer' | 'cover-letter' | 'interview' | 'progress' | 'profile'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  age: number | null
  location: string
  education: string
  field: string
  experience: string
  skills: string[]
  careerGoal: string
  onboardingDone: boolean
  onboardingStep: number
}

interface ResumeData {
  id: string
  title: string
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin: string
  }
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
  template: string
  atsScore: number
}

interface InterviewSession {
  id: string
  type: string
  industry: string
  messages: Array<{
    role: 'ai' | 'user'
    content: string
    timestamp: number
  }>
  score: number
  confidence: number
  clarity: number
  relevance: number
  completed: boolean
  currentQuestion: number
  totalQuestions: number
}

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

export interface CareerContext {
  // From resume
  resumeJobTitle: string
  resumeCompany: string
  resumeSummary: string
  resumeSkills: string[]
  resumeExperience: Array<{
    title: string
    company: string
    period: string
    description: string
  }>
  resumeEducation: Array<{
    degree: string
    institution: string
    year: string
  }>
  resumeCompleted: boolean

  // From cover letter
  coverLetterJobTitle: string
  coverLetterCompany: string
  coverLetterTone: string
  coverLetterCompleted: boolean

  // From interview
  lastInterviewScore: number
  interviewCompleted: boolean

  // Progress tracking
  currentStep: 'resume' | 'cover-letter' | 'interview' | 'complete'
}

interface AppState {
  // Navigation
  currentView: AppView
  setCurrentView: (view: AppView) => void

  // User
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void

  // Onboarding
  onboardingStep: number
  setOnboardingStep: (step: number) => void
  onboardingData: Record<string, string>
  setOnboardingData: (data: Record<string, string>) => void

  // Resume
  resumes: ResumeData[]
  setResumes: (resumes: ResumeData[]) => void
  currentResume: ResumeData | null
  setCurrentResume: (resume: ResumeData | null) => void
  resumeStep: number
  setResumeStep: (step: number) => void

  // Resume Analysis
  resumeAnalysis: ResumeAnalysis | null
  setResumeAnalysis: (analysis: ResumeAnalysis | null) => void
  resumeFileName: string
  setResumeFileName: (name: string) => void

  // Cover Letter
  coverLetterContent: string
  setCoverLetterContent: (content: string) => void
  coverLetterTone: string
  setCoverLetterTone: (tone: string) => void
  coverLetterJobTitle: string
  setCoverLetterJobTitle: (title: string) => void
  coverLetterCompany: string
  setCoverLetterCompany: (company: string) => void
  coverLetterJobDesc: string
  setCoverLetterJobDesc: (desc: string) => void

  // Interview
  interviewSession: InterviewSession | null
  setInterviewSession: (session: InterviewSession | null) => void
  interviewHistory: InterviewSession[]
  setInterviewHistory: (history: InterviewSession[]) => void

  // Career Context (linked data flow)
  careerContext: CareerContext
  setCareerContext: (ctx: Partial<CareerContext>) => void
  resetCareerContext: () => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  aiTyping: boolean
  setAiTyping: (typing: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),

  // User
  user: null,
  setUser: (user) => set({ user }),

  // Onboarding
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  onboardingData: {},
  setOnboardingData: (data) => set({ onboardingData: data }),

  // Resume
  resumes: [],
  setResumes: (resumes) => set({ resumes: resumes }),
  currentResume: null,
  setCurrentResume: (resume) => set({ currentResume: resume }),
  resumeStep: 0,
  setResumeStep: (step) => set({ resumeStep: step }),

  // Resume Analysis
  resumeAnalysis: null,
  setResumeAnalysis: (analysis) => set({ resumeAnalysis: analysis }),
  resumeFileName: '',
  setResumeFileName: (name) => set({ resumeFileName: name }),

  // Cover Letter
  coverLetterContent: '',
  setCoverLetterContent: (content) => set({ coverLetterContent: content }),
  coverLetterTone: 'formal',
  setCoverLetterTone: (tone) => set({ coverLetterTone: tone }),
  coverLetterJobTitle: '',
  setCoverLetterJobTitle: (title) => set({ coverLetterJobTitle: title }),
  coverLetterCompany: '',
  setCoverLetterCompany: (company) => set({ coverLetterCompany: company }),
  coverLetterJobDesc: '',
  setCoverLetterJobDesc: (desc) => set({ coverLetterJobDesc: desc }),

  // Interview
  interviewSession: null,
  setInterviewSession: (session) => set({ interviewSession: session }),
  interviewHistory: [],
  setInterviewHistory: (history) => set({ interviewHistory: history }),

  // Career Context
  careerContext: {
    resumeJobTitle: '',
    resumeCompany: '',
    resumeSummary: '',
    resumeSkills: [],
    resumeExperience: [],
    resumeEducation: [],
    resumeCompleted: false,
    coverLetterJobTitle: '',
    coverLetterCompany: '',
    coverLetterTone: 'formal',
    coverLetterCompleted: false,
    lastInterviewScore: 0,
    interviewCompleted: false,
    currentStep: 'resume',
  },
  setCareerContext: (ctx) => set((state) => ({
    careerContext: { ...state.careerContext, ...ctx }
  })),
  resetCareerContext: () => set(() => ({
    careerContext: {
      resumeJobTitle: '',
      resumeCompany: '',
      resumeSummary: '',
      resumeSkills: [],
      resumeExperience: [],
      resumeEducation: [],
      resumeCompleted: false,
      coverLetterJobTitle: '',
      coverLetterCompany: '',
      coverLetterTone: 'formal',
      coverLetterCompleted: false,
      lastInterviewScore: 0,
      interviewCompleted: false,
      currentStep: 'resume',
    }
  })),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  aiTyping: false,
  setAiTyping: (typing) => set({ aiTyping: typing }),
}))
