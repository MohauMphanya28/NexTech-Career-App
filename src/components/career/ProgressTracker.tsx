'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  FileText,
  Mail,
  Mic,
  Award,
  Target,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle,
  Lock,
  ChevronRight,
} from 'lucide-react'
import { useAppStore, type AppView } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// ─── Animation Variants ───
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

// ─── Achievement Definitions ───
interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  unlocked: boolean
}

// ─── Circular Progress Component ───
function CircularProgress({
  value,
  size = 180,
  strokeWidth = 10,
}: {
  value: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const color = value < 40 ? '#ef4444' : value < 70 ? '#eab308' : '#14b8a6'
  const glowColor =
    value < 40
      ? 'rgba(239,68,68,0.3)'
      : value < 70
        ? 'rgba(234,179,8,0.3)'
        : 'rgba(20,184,166,0.4)'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.2 0.02 260)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {value}%
        </motion.span>
        <span className="text-xs font-medium text-muted-foreground">
          Career Readiness
        </span>
      </div>
    </div>
  )
}

// ─── Score Bar Component ───
function ScoreBar({
  label,
  value,
  maxValue = 10,
  color = 'bg-teal-400',
}: {
  label: string
  value: number
  maxValue?: number
  color?: string
}) {
  const percentage = Math.min(100, (value / maxValue) * 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───
export default function ProgressTracker() {
  const {
    resumes,
    coverLetterContent,
    coverLetterJobTitle,
    interviewHistory,
    setCurrentView,
  } = useAppStore()

  // ─── Computed Stats ───
  const stats = useMemo(() => {
    const resumeCount = resumes.length
    const bestAtsScore =
      resumes.length > 0
        ? Math.max(...resumes.map((r) => r.atsScore || 0))
        : 0

    // Cover letter count: if content exists with meaningful length and a job title, count as 1
    const coverLetterCount =
      coverLetterContent && coverLetterContent.trim().length > 50 && coverLetterJobTitle
        ? 1
        : 0

    const completedInterviews = interviewHistory.filter((s) => s.completed)
    const interviewCount = completedInterviews.length
    const avgInterviewScore =
      interviewCount > 0
        ? Math.round(
            completedInterviews.reduce((sum, s) => sum + s.score, 0) /
              interviewCount
          )
        : 0

    // ─── Score Calculation ───
    // Resume score: 40pts base if resumes exist + atsScore * 0.2
    const resumeScore = resumeCount > 0 ? 40 + bestAtsScore * 0.2 : 0

    // Cover letter score: min(20, count * 10)
    const coverLetterScore = Math.min(20, coverLetterCount * 10)

    // Interview score: min(40, avgScore * 4)
    const interviewScore = Math.min(40, avgInterviewScore * 4)

    const totalScore = Math.round(
      Math.min(100, resumeScore + coverLetterScore + interviewScore)
    )

    // Interview breakdown
    const avgConfidence =
      interviewCount > 0
        ? Math.round(
            completedInterviews.reduce((s, i) => s + i.confidence, 0) /
              interviewCount
          )
        : 0
    const avgClarity =
      interviewCount > 0
        ? Math.round(
            completedInterviews.reduce((s, i) => s + i.clarity, 0) /
              interviewCount
          )
        : 0
    const avgRelevance =
      interviewCount > 0
        ? Math.round(
            completedInterviews.reduce((s, i) => s + i.relevance, 0) /
              interviewCount
          )
        : 0

    // Interview trend (last 3 vs previous)
    let trend: 'improving' | 'declining' | 'steady' = 'steady'
    if (interviewCount >= 2) {
      const recent = completedInterviews.slice(-3)
      const earlier = completedInterviews.slice(0, -3)
      if (earlier.length > 0) {
        const recentAvg =
          recent.reduce((s, i) => s + i.score, 0) / recent.length
        const earlierAvg =
          earlier.reduce((s, i) => s + i.score, 0) / earlier.length
        const diff = recentAvg - earlierAvg
        trend = diff > 0.5 ? 'improving' : diff < -0.5 ? 'declining' : 'steady'
      } else if (interviewCount >= 2) {
        // If all are "recent", compare last to first
        const lastScore = completedInterviews[completedInterviews.length - 1].score
        const firstScore = completedInterviews[0].score
        const diff = lastScore - firstScore
        trend = diff > 0.5 ? 'improving' : diff < -0.5 ? 'declining' : 'steady'
      }
    }

    // Best / worst area
    const areas = [
      { name: 'Confidence', value: avgConfidence },
      { name: 'Clarity', value: avgClarity },
      { name: 'Relevance', value: avgRelevance },
    ]
    const bestArea = interviewCount > 0
      ? areas.reduce((a, b) => (a.value > b.value ? a : b)).name
      : null
    const worstArea = interviewCount > 0
      ? areas.reduce((a, b) => (a.value < b.value ? a : b)).name
      : null

    // Latest interview score
    const latestScore =
      interviewCount > 0
        ? completedInterviews[completedInterviews.length - 1].score
        : 0

    return {
      resumeCount,
      coverLetterCount,
      interviewCount,
      avgInterviewScore,
      totalScore,
      resumeScore: Math.round(resumeScore),
      coverLetterScore,
      interviewScore: Math.round(interviewScore),
      avgConfidence,
      avgClarity,
      avgRelevance,
      trend,
      bestArea,
      worstArea,
      latestScore,
    }
  }, [resumes, coverLetterContent, coverLetterJobTitle, interviewHistory])

  // ─── Achievements ───
  const achievements: Achievement[] = useMemo(
    () => [
      {
        id: 'first-resume',
        title: 'First Resume',
        description: 'Created your first resume',
        icon: FileText,
        unlocked: stats.resumeCount >= 1,
      },
      {
        id: 'cover-letter-pro',
        title: 'Cover Letter Pro',
        description: 'Wrote 3+ cover letters',
        icon: Mail,
        unlocked: stats.coverLetterCount >= 3,
      },
      {
        id: 'interview-ready',
        title: 'Interview Ready',
        description: 'Completed 3+ practice interviews',
        icon: Mic,
        unlocked: stats.interviewCount >= 3,
      },
      {
        id: 'high-scorer',
        title: 'High Scorer',
        description: 'Scored 8+ on an interview',
        icon: Star,
        unlocked: interviewHistory.some((s) => s.score >= 8),
      },
      {
        id: 'career-ready',
        title: 'Career Ready',
        description: 'Career readiness above 80%',
        icon: Award,
        unlocked: stats.totalScore >= 80,
      },
    ],
    [stats, interviewHistory]
  )

  // ─── Career Tip ───
  const careerTip = useMemo(() => {
    if (stats.resumeCount === 0) {
      return "Start by building your resume — it's the foundation of your job search!"
    }
    if (stats.interviewCount === 0) {
      return 'Your resume is ready! Time to practice interviewing and build your confidence.'
    }
    return "You're making great progress! Keep refining your skills and you'll be unstoppable."
  }, [stats.resumeCount, stats.interviewCount])

  // ─── Next Step ───
  const nextStep = useMemo(() => {
    if (stats.resumeCount === 0) {
      return { label: 'Complete your resume', view: 'resume' as AppView }
    }
    if (stats.coverLetterCount === 0) {
      return {
        label: 'Write a cover letter',
        view: 'cover-letter' as AppView,
      }
    }
    if (stats.interviewCount === 0) {
      return {
        label: 'Practice interviewing',
        view: 'interview' as AppView,
      }
    }
    if (stats.totalScore < 80) {
      return {
        label: 'Keep building your profile',
        view: 'dashboard' as AppView,
      }
    }
    return { label: 'You’re career ready! 🎉', view: 'dashboard' as AppView }
  }, [stats])

  // ─── Score Color ───
  const scoreColor =
    stats.totalScore < 40
      ? 'text-red-400'
      : stats.totalScore < 70
        ? 'text-yellow-400'
        : 'text-teal-400'

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
          Your Progress
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your career preparation journey
        </p>
      </motion.header>

      {/* ─── 1. Career Readiness Score (Hero Card) ─── */}
      <motion.section variants={itemVariants} aria-label="Career Readiness Score">
        <div className="glass-strong glow-teal-sm relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl p-6">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-cyan-400/10 blur-3xl" />

          <CircularProgress value={stats.totalScore} />

          <div className="relative text-center">
            <p className="text-lg font-semibold text-foreground">
              You&apos;re{' '}
              <span className={scoreColor}>{stats.totalScore}%</span> ready to
              apply for jobs!
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.totalScore < 40
                ? 'Every journey starts with a single step — let\'s get going!'
                : stats.totalScore < 70
                  ? 'Great progress! A few more steps and you\'ll be unstoppable.'
                  : 'Amazing work! You\'re nearly there — keep pushing!'}
            </p>
          </div>

          {/* Score breakdown mini bars */}
          <div className="relative w-full space-y-2 pt-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Resume</span>
              <span>{stats.resumeScore}pts</span>
            </div>
            <Progress value={stats.resumeScore} className="h-1.5" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Cover Letters</span>
              <span>{stats.coverLetterScore}pts</span>
            </div>
            <Progress value={(stats.coverLetterScore / 20) * 100} className="h-1.5" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Interviews</span>
              <span>{stats.interviewScore}pts</span>
            </div>
            <Progress value={(stats.interviewScore / 40) * 100} className="h-1.5" />
          </div>
        </div>
      </motion.section>

      {/* ─── 2. Progress Stats Grid (2x2) ─── */}
      <motion.section variants={itemVariants} aria-label="Progress stats">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Progress Stats
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Resumes */}
          <StatCard
            icon={<FileText className="size-5 text-teal-400" />}
            iconBg="bg-teal-400/15"
            number={stats.resumeCount}
            label="Resumes"
            description={
              stats.resumeCount === 0
                ? 'Create your first'
                : 'Keep building!'
            }
          />
          {/* Cover Letters */}
          <StatCard
            icon={<Mail className="size-5 text-cyan-400" />}
            iconBg="bg-cyan-400/15"
            number={stats.coverLetterCount}
            label="Cover Letters"
            description="Write one for each application"
          />
          {/* Interviews */}
          <StatCard
            icon={<Mic className="size-5 text-purple-400" />}
            iconBg="bg-purple-400/15"
            number={stats.interviewCount}
            label="Interviews"
            description="Practice makes perfect"
          />
          {/* Avg Interview Score */}
          <StatCard
            icon={<Target className="size-5 text-amber-400" />}
            iconBg="bg-amber-400/15"
            number={stats.interviewCount > 0 ? stats.avgInterviewScore : 0}
            label="Avg Score"
            description={
              stats.interviewCount === 0
                ? 'No interviews yet'
                : stats.avgInterviewScore >= 7
                  ? 'Great job!'
                  : 'Keep improving!'
            }
            suffix={stats.interviewCount > 0 ? '/10' : ''}
          />
        </div>
      </motion.section>

      {/* ─── 3. Interview Performance ─── */}
      <AnimatePresence>
        {stats.interviewCount > 0 && (
          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            aria-label="Interview performance"
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Interview Performance
            </h2>
            <div className="glass space-y-4 rounded-2xl p-4">
              {/* Latest score + trend */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Latest Interview Score
                  </p>
                  <p className="gradient-text text-2xl font-bold">
                    {stats.latestScore}/10
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {stats.trend === 'improving' && (
                    <Badge className="gap-1 border-green-400/30 bg-green-400/10 text-green-400">
                      <TrendingUp className="size-3" />
                      Improving
                    </Badge>
                  )}
                  {stats.trend === 'declining' && (
                    <Badge className="gap-1 border-red-400/30 bg-red-400/10 text-red-400">
                      <TrendingUp className="size-3 rotate-180" />
                      Declining
                    </Badge>
                  )}
                  {stats.trend === 'steady' && (
                    <Badge className="gap-1 border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
                      <Target className="size-3" />
                      Steady
                    </Badge>
                  )}
                </div>
              </div>

              {/* Score bars */}
              <div className="space-y-3">
                <ScoreBar
                  label="Confidence"
                  value={stats.avgConfidence}
                  maxValue={10}
                  color="bg-teal-400"
                />
                <ScoreBar
                  label="Clarity"
                  value={stats.avgClarity}
                  maxValue={10}
                  color="bg-cyan-400"
                />
                <ScoreBar
                  label="Relevance"
                  value={stats.avgRelevance}
                  maxValue={10}
                  color="bg-purple-400"
                />
              </div>

              {/* Best & worst areas */}
              <div className="flex gap-3">
                {stats.bestArea && (
                  <div className="flex flex-1 flex-col gap-1 rounded-xl bg-teal-400/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                      Best Area
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {stats.bestArea}
                    </p>
                  </div>
                )}
                {stats.worstArea && (
                  <div className="flex flex-1 flex-col gap-1 rounded-xl bg-amber-400/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      Needs Work
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {stats.worstArea}
                    </p>
                  </div>
                )}
              </div>

              {/* Interview history mini chart */}
              {interviewHistory.filter((s) => s.completed).length > 1 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Score History
                  </p>
                  <div className="flex items-end gap-1.5">
                    {interviewHistory
                      .filter((s) => s.completed)
                      .map((session, idx) => {
                        const height = Math.max(8, session.score * 10)
                        const isLast =
                          idx ===
                          interviewHistory.filter((s) => s.completed).length - 1
                        return (
                          <motion.div
                            key={session.id}
                            className={`flex-1 rounded-t-md ${
                              isLast ? 'bg-teal-400' : 'bg-teal-400/40'
                            }`}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{
                              duration: 0.5,
                              delay: 0.1 * idx,
                            }}
                            style={{ minHeight: 8 }}
                          />
                        )
                      })}
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>First</span>
                    <span>Latest</span>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── 4. Achievements / Milestones ─── */}
      <motion.section variants={itemVariants} aria-label="Achievements">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Achievements
        </h2>
        <div className="space-y-2">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <motion.div
                key={achievement.id}
                className={`flex items-center gap-3 rounded-2xl p-3.5 transition-all ${
                  achievement.unlocked
                    ? 'glass border-teal-400/30 shadow-[0_0_12px_rgba(20,184,166,0.12)]'
                    : 'bg-secondary/30 opacity-50'
                }`}
                whileTap={achievement.unlocked ? { scale: 0.98 } : undefined}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    achievement.unlocked
                      ? 'bg-teal-400/15'
                      : 'bg-muted/50'
                  }`}
                >
                  {achievement.unlocked ? (
                    <Icon className="size-5 text-teal-400" />
                  ) : (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      achievement.unlocked
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {achievement.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <CheckCircle className="size-5 shrink-0 text-teal-400" />
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* ─── 5. Career Tips ─── */}
      <motion.section variants={itemVariants} aria-label="Career tips">
        <div className="glass relative overflow-hidden rounded-2xl p-4">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-teal-400/10 blur-2xl" />

          <div className="relative flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-400/15">
              <Sparkles className="size-4 text-teal-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Career Tip
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                {careerTip}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── 6. Next Steps ─── */}
      <motion.section variants={itemVariants} aria-label="Next steps">
        <div className="glass-strong relative overflow-hidden rounded-2xl p-5">
          <div className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-teal-400/15">
              <ChevronRight className="size-5 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Next Step
              </p>
              <p className="text-base font-semibold text-foreground">
                {nextStep.label}
              </p>
            </div>
            <Button
              onClick={() => setCurrentView(nextStep.view)}
              className="gap-2 bg-teal-500 text-white hover:bg-teal-400"
              size="sm"
            >
              Go
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

// ─── Stat Card Sub-component ───
function StatCard({
  icon,
  iconBg,
  number,
  label,
  description,
  suffix = '',
}: {
  icon: React.ReactNode
  iconBg: string
  number: number
  label: string
  description: string
  suffix?: string
}) {
  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4">
      <div
        className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="gradient-text text-3xl font-bold">
          {number}
          {suffix && (
            <span className="text-sm text-muted-foreground">{suffix}</span>
          )}
        </p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground/70">
          {description}
        </p>
      </div>
    </div>
  )
}
