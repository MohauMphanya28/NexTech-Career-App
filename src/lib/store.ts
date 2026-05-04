import { create } from 'zustand'

export type AppView = 'dashboard' | 'onboarding' | 'resume' | 'cover-letter' | 'interview' | 'progress' | 'profile'

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

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  aiTyping: false,
  setAiTyping: (typing) => set({ aiTyping: typing }),
}))
