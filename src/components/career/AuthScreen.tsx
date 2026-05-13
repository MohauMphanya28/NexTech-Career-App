'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

type AuthMode = 'login' | 'register'

export default function AuthScreen() {
  const { setUser, setDbUserId, setIsAuthenticated, setCurrentView } = useAppStore()

  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Prevent hydration mismatch: browser extensions (password managers, autofill)
  // inject `fdprocessedid` attributes into form elements before React hydrates,
  // causing a server/client DOM mismatch. By deferring the form render until
  // after mount, we skip SSR entirely for the form and eliminate the mismatch.
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields')
      return
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong')
        return
      }

      const apiUser = data.user
      const profileData = {
        id: apiUser.id,
        name: apiUser.name || '',
        email: apiUser.email || '',
        phone: apiUser.phone || '',
        age: null as number | null,
        location: apiUser.location || '',
        education: apiUser.education || '',
        field: apiUser.field || '',
        experience: apiUser.experience || '',
        skills: apiUser.skills ? (typeof apiUser.skills === 'string' ? JSON.parse(apiUser.skills) : apiUser.skills) : [],
        careerGoal: apiUser.careerGoal || '',
        onboardingDone: apiUser.onboardingDone || false,
        onboardingStep: apiUser.onboardingStep || 0,
      }

      setUser(profileData)
      setDbUserId(apiUser.id)
      setIsAuthenticated(true)

      if (typeof window !== 'undefined') {
        localStorage.setItem('nextech_auth', JSON.stringify({
          userId: apiUser.id,
          email: apiUser.email,
        }))
      }

      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!')

      if (apiUser.onboardingDone) {
        setCurrentView('dashboard')
      } else {
        setCurrentView('onboarding')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [mode, email, password, name, setUser, setDbUserId, setIsAuthenticated, setCurrentView])

  const switchMode = useCallback(() => {
    setMode(prev => prev === 'login' ? 'register' : 'login')
    setError('')
  }, [])

  const isRegister = mode === 'register'

  // Pre-mount: show a branded loading state (NOT a blank screen).
  // This avoids SSR hydration mismatches from browser extensions
  // that inject fdprocessedid attributes into form elements.
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-teal-400/15 border border-teal-400/30 mb-4">
          <Sparkles className="size-8 text-teal-400" />
        </div>
        <h1 className="gradient-text text-3xl font-bold tracking-tight">NexTech</h1>
        <p className="text-sm text-muted-foreground mt-1">Your AI-Powered Career Mentor</p>
        <div className="mt-6 size-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-background to-cyan-500/5" />
        <div className="relative px-6 pt-16 pb-8 text-center">
          <div className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-teal-400/15 border border-teal-400/30 mb-4">
            <Sparkles className="size-8 text-teal-400" />
          </div>
          <h1 className="gradient-text text-3xl font-bold tracking-tight">
            NexTech
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your AI-Powered Career Mentor
          </p>
        </div>
      </div>

      {/* Auth Form — client-only to avoid hydration mismatch from browser extensions */}
      <div className="flex-1 px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Title */}
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isRegister
                ? 'Start your journey to career success'
                : 'Sign in to continue your career journey'}
            </p>
          </div>

          {/* Name field — register mode only */}
          {isRegister && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="e.g. Thabo Mokoena"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary border-border focus:border-primary rounded-xl h-12 text-base pl-10"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Email <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder="you@example.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border focus:border-primary rounded-xl h-12 text-base pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border focus:border-primary rounded-xl h-12 text-base pl-10 pr-10"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white hover:bg-teal-400 rounded-xl h-13 text-base font-semibold gap-2 disabled:opacity-50"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegister ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>

          {/* Switch Mode */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-teal-400 font-medium hover:text-teal-300 transition-colors"
              >
                {isRegister ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </form>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="glass rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-400/15">
                <Sparkles className="size-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">AI-Powered Tools</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Build resumes, write cover letters &amp; practice interviews with AI guidance
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/15">
                <Globe className="size-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Built for South Africa</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tailored for Mzansi&apos;s youth — local context, local opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By continuing, you agree to NexTech&apos;s Terms of Service</p>
          <p className="mt-1 text-primary/30">Built with ❤️ for Mzansi&apos;s youth</p>
        </div>
      </div>
    </div>
  )
}
