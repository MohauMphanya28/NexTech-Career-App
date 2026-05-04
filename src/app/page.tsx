'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import OnboardingFlow from '@/components/career/OnboardingFlow'
import Dashboard from '@/components/career/Dashboard'
import Navbar from '@/components/career/Navbar'
import CareerGuide from '@/components/career/CareerGuide'
import ResumeBuilder from '@/components/career/ResumeBuilder'
import ResumeAnalyzer from '@/components/career/ResumeAnalyzer'
import CoverLetterGenerator from '@/components/career/CoverLetterGenerator'
import InterviewCoach from '@/components/career/InterviewCoach'
import ProgressTracker from '@/components/career/ProgressTracker'
import DocumentHistory from '@/components/career/DocumentHistory'
import { User, LogOut, Edit3, ChevronRight, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function ProfileView() {
  const { user, setCurrentView } = useAppStore()

  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mx-auto flex items-center justify-center mb-3">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{user?.name || 'Guest User'}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.field || 'Set up your profile to get started'}
        </p>
      </div>

      {/* Profile Info */}
      <Card className="glass p-4 space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Profile Details</h3>
        <div className="space-y-2 text-sm">
          {user?.location && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span>{user.location}</span>
            </div>
          )}
          {user?.education && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Education</span>
              <span>{user.education}</span>
            </div>
          )}
          {user?.experience && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Experience</span>
              <span>{user.experience}</span>
            </div>
          )}
          {user?.careerGoal && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Career Goal</span>
              <span>{user.careerGoal}</span>
            </div>
          )}
          {user?.skills && (
            <div>
              <span className="text-muted-foreground">Skills</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills)?.map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-between glass rounded-xl p-4 h-auto"
          onClick={() => setCurrentView('resume')}
        >
          <div className="flex items-center gap-3">
            <Edit3 className="w-4 h-4 text-primary" />
            <span>Edit Resume</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-between glass rounded-xl p-4 h-auto"
          onClick={() => setCurrentView('progress')}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-primary" />
            <span>View Progress</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-between glass rounded-xl p-4 h-auto"
          onClick={() => setCurrentView('onboarding')}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-destructive" />
            <span>Restart Onboarding</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* App Info */}
      <div className="text-center text-xs text-muted-foreground pt-4 space-y-1">
        <p>NexTech Career v1.0</p>
        <p>AI-Powered Career Platform for South Africa</p>
        <p className="text-primary/50">Built with ❤️ for Mzansi&apos;s youth</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { currentView, dbUserId, setDbUserId, user, setUser } = useAppStore()

  // On mount, try to resolve the DB user ID if we don't have one
  // This is needed because Zustand state resets on page refresh
  useEffect(() => {
    if (dbUserId) return // Already have it
    fetch('/api/career-documents')
      .then(r => r.json())
      .then(data => {
        if (data.userId) {
          setDbUserId(data.userId)
        }
        if (data.success && !user) {
          // Also try to restore the user profile from the DB
          fetch(`/api/user?id=${data.userId}`)
            .then(r => r.json())
            .then(userData => {
              if (userData.success && userData.user) {
                setUser({
                  id: userData.user.id,
                  name: userData.user.name || '',
                  email: userData.user.email || '',
                  phone: userData.user.phone || '',
                  age: userData.user.age,
                  location: userData.user.location || '',
                  education: userData.user.education || '',
                  field: userData.user.field || '',
                  experience: userData.user.experience || '',
                  skills: userData.user.skills ? JSON.parse(userData.user.skills) : [],
                  careerGoal: userData.user.careerGoal || '',
                  onboardingDone: userData.user.onboardingDone || false,
                  onboardingStep: userData.user.onboardingStep || 0,
                })
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [dbUserId, setDbUserId, user, setUser])

  // Onboarding flow is full-screen (no navbar)
  if (currentView === 'onboarding') {
    return <OnboardingFlow />
  }

  // All other views share the navbar
  return (
    <div className="min-h-screen bg-background pb-20">
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'resume' && <ResumeBuilder />}
      {currentView === 'resume-analyzer' && <ResumeAnalyzer />}
      {currentView === 'cover-letter' && <CoverLetterGenerator />}
      {currentView === 'interview' && <InterviewCoach />}
      {currentView === 'progress' && <ProgressTracker />}
      {currentView === 'documents' && <DocumentHistory />}
      {currentView === 'profile' && <ProfileView />}
      <Navbar />
      <CareerGuide />
    </div>
  )
}
