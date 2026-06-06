'use client'

import { useState, useCallback } from 'react'
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

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      if (!res.ok) {
        let errorMsg = 'Something went wrong'
        try { const e = await res.json(); errorMsg = e.error || errorMsg } catch { errorMsg = `Server error (${res.status}). Please try again.` }
        setError(errorMsg)
        return
      }

      const data = await res.json()

      if (!data.success) {
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

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#0a0a12' }}>
      {/* Hero Section */}
      <div className="flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.1), #0a0a12, rgba(6,182,212,0.05))' }} />
        <div className="relative px-6 pt-16 pb-8 text-center">
          <div
            className="flex size-16 mx-auto items-center justify-center rounded-2xl mb-4"
            style={{ backgroundColor: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}
          >
            <Sparkles className="size-8" style={{ color: '#2dd4bf' }} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#2dd4bf' }}>
            NexTech
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
            Your AI-Powered Career Mentor
          </p>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Title */}
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              {isRegister
                ? 'Start your journey to career success'
                : 'Sign in to continue your career journey'}
            </p>
          </div>

          {/* Name field — register mode only */}
          {isRegister && (
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: '#e2e8f0' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="e.g. Thabo Mokoena"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  suppressHydrationWarning
                  className="w-full rounded-xl h-12 text-base pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-400"
                  style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                    color: '#e2e8f0',
                  }}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#e2e8f0' }}>
              Email <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: '#94a3b8' }} />
              <input
                type="email"
                placeholder="you@example.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                suppressHydrationWarning
                className="w-full rounded-xl h-12 text-base pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-400"
                style={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  color: '#e2e8f0',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#e2e8f0' }}>
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                suppressHydrationWarning
                className="w-full rounded-xl h-12 text-base pl-10 pr-10 outline-none focus:ring-2 focus:ring-teal-400"
                style={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  color: '#e2e8f0',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#94a3b8' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                suppressHydrationWarning
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full rounded-xl h-13 text-base font-semibold flex items-center justify-center gap-2 transition-colors"
              style={{
                backgroundColor: loading ? 'rgba(20,184,166,0.5)' : '#14b8a6',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegister ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>

          {/* Switch Mode */}
          <div className="text-center pt-2">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-medium transition-colors"
                style={{ color: '#2dd4bf' }}
                suppressHydrationWarning
              >
                {isRegister ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </form>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(42,42,74,0.5)' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(20,184,166,0.15)' }}>
                <Sparkles className="size-4" style={{ color: '#2dd4bf' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>AI-Powered Tools</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  Build resumes, write cover letters &amp; practice interviews with AI guidance
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(42,42,74,0.5)' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(6,182,212,0.15)' }}>
                <Globe className="size-4" style={{ color: '#22d3ee' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>Built for South Africa</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  Tailored for Mzansi&apos;s youth — local context, local opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs" style={{ color: '#64748b' }}>
          <p>By continuing, you agree to NexTech&apos;s Terms of Service</p>
          <p className="mt-1">Built with ❤️ for Mzansi&apos;s youth</p>
        </div>
      </div>
    </div>
  )
}
