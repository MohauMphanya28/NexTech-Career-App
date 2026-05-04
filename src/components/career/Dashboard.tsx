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

export default function Dashboard() {
  const { user, setCurrentView, resumes, interviewHistory } = useAppStore()

  // Pick a rotating tip based on the day
  const tipIndex = new Date().getDate() % careerTips.length
  const todayTip = careerTips[tipIndex]

  // Compute stats
  const resumeCount = resumes.length
  const letterCount = 0 // Could be extended with cover letter history
  const interviewCount = interviewHistory.length
  const avgScore =
    interviewCount > 0
      ? Math.round(
          interviewHistory.reduce((sum, s) => sum + s.score, 0) / interviewCount
        )
      : 0

  const hasOnboarded = user?.onboardingDone ?? false

  return (
    <motion.div
      className="flex min-h-screen flex-col gap-6 px-4 pb-28 pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header ─── */}
      <motion.header variants={itemVariants} className="flex flex-col gap-1">
        <h1 className="gradient-text text-3xl font-bold tracking-tight">
          NexTech
        </h1>
        <p className="text-sm text-muted-foreground">Your AI Career Mentor</p>
        {user?.name && (
          <p className="mt-1 text-base font-medium text-foreground/90">
            Welcome back, <span className="text-teal-400">{user.name}</span> 👋
          </p>
        )}
      </motion.header>

      {/* ─── Hero Banner ─── */}
      <motion.section variants={itemVariants} aria-label="Hero banner" className="relative overflow-hidden rounded-2xl">
        <div className="relative h-40 w-full">
          <Image
            src="/nextech-hero.png"
            alt="NexTech Career - AI-Powered Career Platform for South Africa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm font-semibold text-teal-400">Empowering South Africa&apos;s Youth</p>
            <p className="text-xs text-foreground/70 mt-0.5">AI-powered tools to bridge skills and employment</p>
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

      {/* ─── Stats Section ─── */}
      <motion.section variants={itemVariants} aria-label="Your stats">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Your Progress
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          <StatCard
            icon={<FileText className="size-4 text-teal-400" />}
            label="Resumes"
            value={resumeCount}
          />
          <StatCard
            icon={<Mail className="size-4 text-cyan-400" />}
            label="Letters"
            value={letterCount}
          />
          <StatCard
            icon={<Mic className="size-4 text-purple-400" />}
            label="Interviews"
            value={interviewCount}
          />
          <StatCard
            icon={<Award className="size-4 text-amber-400" />}
            label="Avg Score"
            value={avgScore}
            suffix={interviewCount > 0 ? '%' : ''}
          />
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

/* ─── Stat Card Sub-component ─── */
function StatCard({
  icon,
  label,
  value,
  suffix = '',
}: {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
}) {
  return (
    <div className="glass flex min-w-[110px] flex-col gap-2 rounded-2xl p-3.5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground">
        {value}
        {suffix}
      </p>
    </div>
  )
}
