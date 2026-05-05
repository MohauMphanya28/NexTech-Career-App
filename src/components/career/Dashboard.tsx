'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  FileText,
  Mail,
  Mic,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
  Award,
  Zap,
  Search,
  FolderOpen,
  Sun,
  Moon,
  CloudSun,
  Rocket,
} from 'lucide-react'
import { useAppStore, type AppView } from '@/lib/store'
import { Button } from '@/components/ui/button'

// Career tips that rotate
const careerTips = [
  'Tailor your resume to each job posting — highlight the skills they\'re asking for first.',
  'Quantify your achievements: "Increased sales by 30%" beats "Improved sales".',
  'Practice the STAR method for interviews: Situation, Task, Action, Result.',
  'Your cover letter should tell a story your resume can\'t — show your passion.',
  'Research the company culture before your interview — it shows you care.',
  'Network on LinkedIn before applying — a referral increases your chances by 5x.',
  'South Africa\'s growing sectors: tech, renewable energy, healthcare, and fintech.',
  'Soft skills matter! Communication and problem-solving are top employer priorities.',
]

// Quick action card definitions
interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  iconBg: string
  view: AppView
}

const quickActions: QuickAction[] = [
  {
    title: 'Build Resume',
    description: 'AI-powered ATS-friendly resumes',
    icon: FileText,
    accent: 'text-teal-400',
    iconBg: 'bg-teal-400/15',
    view: 'resume',
  },
  {
    title: 'Analyse Resume',
    description: 'Upload & get expert AI feedback',
    icon: Search,
    accent: 'text-rose-400',
    iconBg: 'bg-rose-400/15',
    view: 'resume-analyzer',
  },
  {
    title: 'Write Letter',
    description: 'Professional cover letters in minutes',
    icon: Mail,
    accent: 'text-cyan-400',
    iconBg: 'bg-cyan-400/15',
    view: 'cover-letter',
  },
  {
    title: 'Practice Interview',
    description: 'Mock interviews with AI feedback',
    icon: Mic,
    accent: 'text-purple-400',
    iconBg: 'bg-purple-400/15',
    view: 'interview',
  },
  {
    title: 'Track Progress',
    description: 'Monitor your career growth',
    icon: TrendingUp,
    accent: 'text-green-400',
    iconBg: 'bg-green-400/15',
    view: 'progress',
  },
  {
    title: 'My Documents',
    description: 'View saved resumes, letters & more',
    icon: FolderOpen,
    accent: 'text-amber-400',
    iconBg: 'bg-amber-400/15',
    view: 'documents',
  },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
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

// Time-of-day greeting helper
function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', icon: <Sun className="size-5 text-amber-400" /> }
  } else if (hour >= 12 && hour < 17) {
    return { text: 'Good afternoon', icon: <CloudSun className="size-5 text-orange-400" /> }
  } else {
    return { text: 'Good evening', icon: <Moon className="size-5 text-indigo-300" /> }
  }
}

// Career journey steps for progress indicator
const journeySteps = [
  { label: 'Resume', key: 'resumeCompleted' },
  { label: 'Letter', key: 'coverLetterCompleted' },
  { label: 'Interview', key: 'interviewCompleted' },
] as const

export default function Dashboard() {
  const { user, setCurrentView, resumes, interviewHistory, careerContext } = useAppStore()

  // Pick a rotating tip based on the day
  const tipIndex = new Date().getDate() % careerTips.length
  const todayTip = careerTips[tipIndex]

  // Time-of-day greeting
  const greeting = getGreeting()

  // Compute stats
  const resumeCount = resumes.length
  const letterCount = 0
  const interviewCount = interviewHistory.length
  const avgScore =
    interviewCount > 0
      ? Math.round(
          interviewHistory.reduce((sum, s) => sum + s.score, 0) / interviewCount
        )
      : 0

  // Career journey progress
  const completedSteps = [
    careerContext.resumeCompleted,
    careerContext.coverLetterCompleted,
    careerContext.interviewCompleted,
  ].filter(Boolean).length

  const progressPercent = Math.round((completedSteps / 3) * 100)

  const hasOnboarded = user?.onboardingDone ?? false

  return (
    <motion.div
      className="flex min-h-screen flex-col gap-6 px-4 pb-28 pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Immersive Hero Section ─── */}
      <motion.section
        variants={itemVariants}
        aria-label="Hero section"
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Animated gradient background */}
        <div className="hero-gradient-bg absolute inset-0" />

        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-orb-1 absolute -right-8 -top-8 size-40 rounded-full bg-teal-400/8 blur-3xl" />
          <div className="hero-orb-2 absolute -left-10 top-1/4 size-32 rounded-full bg-cyan-400/6 blur-3xl" />
          <div className="hero-orb-3 absolute bottom-0 right-1/4 size-28 rounded-full bg-teal-300/5 blur-2xl" />
        </div>

        {/* Shimmer overlay */}
        <div className="hero-shimmer pointer-events-none absolute inset-0" />

        {/* Hero image layer */}
        <div className="relative min-h-[240px] w-full sm:min-h-[280px]">
          <Image
            src="/nextech-hero.png"
            alt="NexTech Career - AI-Powered Career Platform for South Africa"
            fill
            sizes="100vw"
            className="object-cover opacity-30 mix-blend-luminosity"
            priority
          />
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_180)] via-[oklch(0.12_0.03_180)]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.12_0.03_180)]/40 via-transparent to-transparent" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            {/* Top row: Greeting + Brand */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {greeting.icon}
                  <span className="text-sm font-medium text-foreground/70">{greeting.text}</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {user?.name ? (
                    <>
                      Hey, <span className="gradient-text">{user.name.split(' ')[0]}</span>
                    </>
                  ) : (
                    <>
                      Welcome to <span className="gradient-text">NexTech</span>
                    </>
                  )}
                </h1>
                <p className="text-xs text-foreground/60 mt-1">Your AI Career Mentor</p>
              </div>

              {/* NexTech mini logo */}
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-400/15 border border-teal-400/20 shrink-0">
                <Sparkles className="size-5 text-teal-400" />
              </div>
            </div>

            {/* Bottom row: Journey Progress + Quick Stats */}
            <div className="space-y-3">
              {/* Career Journey Progress Bar */}
              <div className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Rocket className="size-3.5 text-teal-400" />
                    <span className="text-xs font-semibold text-foreground/80">Career Journey</span>
                  </div>
                  <span className="text-xs font-bold text-teal-400">{progressPercent}%</span>
                </div>
                <div className="flex gap-1.5">
                  {journeySteps.map((step, i) => {
                    const isCompleted = careerContext[step.key]
                    return (
                      <div key={step.key} className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <div
                            className={`size-1.5 rounded-full ${
                              isCompleted ? 'bg-teal-400' : 'bg-foreground/15'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-medium ${
                              isCompleted ? 'text-teal-400' : 'text-foreground/35'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isCompleted ? '100%' : '0%' }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="flex gap-2">
                <div className="glass flex-1 rounded-xl px-3 py-2.5 flex items-center gap-2 min-h-[44px]">
                  <FileText className="size-4 text-teal-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground leading-none">{resumeCount}</p>
                    <p className="text-[10px] text-foreground/50 leading-none mt-0.5">Resumes</p>
                  </div>
                </div>
                <div className="glass flex-1 rounded-xl px-3 py-2.5 flex items-center gap-2 min-h-[44px]">
                  <Mail className="size-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground leading-none">{letterCount}</p>
                    <p className="text-[10px] text-foreground/50 leading-none mt-0.5">Letters</p>
                  </div>
                </div>
                <div className="glass flex-1 rounded-xl px-3 py-2.5 flex items-center gap-2 min-h-[44px]">
                  <Award className="size-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground leading-none">
                      {interviewCount > 0 ? `${avgScore}%` : '—'}
                    </p>
                    <p className="text-[10px] text-foreground/50 leading-none mt-0.5">Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Quick Actions Grid ─── */}
      <motion.section variants={itemVariants} aria-label="Quick actions">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.title}
                variants={itemVariants}
                onClick={() => setCurrentView(action.view)}
                className={`
                  glass group flex flex-col items-start gap-3 rounded-2xl p-4 text-left
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none
                  ${i === quickActions.length - 1 && quickActions.length % 2 !== 0 ? 'col-span-2' : ''}
                `}
                aria-label={action.title}
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${action.iconBg}`}
                >
                  <Icon className={`size-5 ${action.accent}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {action.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.section>

      {/* ─── AI Tip of the Day ─── */}
      <motion.section variants={itemVariants} aria-label="Tip of the day">
        <div className="glass relative overflow-hidden rounded-2xl p-4">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-teal-400/10 blur-2xl" />

          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-400/15">
              <Sparkles className="size-4 text-teal-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Tip of the Day
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                {todayTip}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Getting Started (only if no onboarding) ─── */}
      {!hasOnboarded && (
        <motion.section
          variants={itemVariants}
          aria-label="Getting started"
          className="glass-strong glow-teal-sm relative overflow-hidden rounded-2xl p-5"
        >
          <div className="pointer-events-none absolute -left-8 -bottom-8 size-32 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-teal-400/15">
              <Target className="size-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Start Your Journey
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete your profile so our AI can personalize your career
                tools — resumes, letters, and interviews tailored just for you.
              </p>
            </div>
            <Button
              onClick={() => setCurrentView('onboarding')}
              className="mt-1 gap-2 bg-teal-500 text-white hover:bg-teal-400"
              size="lg"
            >
              <Zap className="size-4" />
              Get Started
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </motion.section>
      )}
    </motion.div>
  )
}
