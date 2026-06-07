'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
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
import AuthScreen from '@/components/career/AuthScreen'
import ErrorBoundary from '@/components/career/ErrorBoundary'
import { User, LogOut, Edit3, ChevronRight, Shield, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

function ProfileView() {
  const { user, dbUserId, setCurrentView, setIsAuthenticated, setUser, setDbUserId } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
    setDbUserId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nextech_auth')
    }
    setCurrentView('auth')
    toast.success('Signed out successfully')
  }, [setIsAuthenticated, setUser, setDbUserId, setCurrentView])

  const startEditing = useCallback(() => {
    if (!user) return
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      education: user.education || '',
      field: user.field || '',
      experience: user.experience || '',
      careerGoal: user.careerGoal || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : (typeof user.skills === 'string' ? JSON.parse(user.skills).join(', ') : ''),
    })
    setIsEditing(true)
  }, [user])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setEditForm({})
  }, [])

  const handleSave = useCallback(async () => {
    if (!user || !dbUserId) return
    setIsSaving(true)

    try {
      const skillsArray = editForm.skills
        ? editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dbUserId,
          name: editForm.name,
          phone: editForm.phone,
          location: editForm.location,
          education: editForm.education,
          field: editForm.field,
          experience: editForm.experience,
          careerGoal: editForm.careerGoal,
          skills: skillsArray,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || `Update failed (${res.status})`)
      }

      const data = await res.json()

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          age: data.user.age,
          location: data.user.location || '',
          education: data.user.education || '',
          field: data.user.field || '',
          experience: data.user.experience || '',
          skills: data.user.skills ? JSON.parse(data.user.skills) : [],
          careerGoal: data.user.careerGoal || '',
          onboardingDone: data.user.onboardingDone || false,
          onboardingStep: data.user.onboardingStep || 0,
        })
        setIsEditing(false)
        setEditForm({})
        toast.success('Profile updated successfully!')
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }, [user, dbUserId, editForm, setUser])

  const updateField = useCallback((field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }, [])

  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mx-auto flex items-center justify-center mb-3">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{isEditing ? (editForm.name || 'Guest User') : (user?.name || 'Guest User')}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.email || user?.field || 'Set up your profile to get started'}
        </p>
      </div>

      {/* Edit / Save / Cancel Buttons */}
      {!isEditing ? (
        <Button
          className="w-full rounded-xl"
          onClick={startEditing}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button
            className="flex-1 rounded-xl"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={cancelEditing}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {/* Profile Info */}
      <Card className="glass p-4 space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Profile Details</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input
                value={editForm.name || ''}
                onChange={e => updateField('name', e.target.value)}
                placeholder="Your full name"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <Input
                value={editForm.phone || ''}
                onChange={e => updateField('phone', e.target.value)}
                placeholder="e.g. +27 82 123 4567"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <Input
                value={editForm.location || ''}
                onChange={e => updateField('location', e.target.value)}
                placeholder="e.g. Johannesburg, Gauteng"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Education</label>
              <Input
                value={editForm.education || ''}
                onChange={e => updateField('education', e.target.value)}
                placeholder="e.g. National Diploma in IT"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Field</label>
              <Input
                value={editForm.field || ''}
                onChange={e => updateField('field', e.target.value)}
                placeholder="e.g. Software Development"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Experience</label>
              <Textarea
                value={editForm.experience || ''}
                onChange={e => updateField('experience', e.target.value)}
                placeholder="Describe your work experience"
                className="rounded-lg min-h-20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Career Goal</label>
              <Textarea
                value={editForm.careerGoal || ''}
                onChange={e => updateField('careerGoal', e.target.value)}
                placeholder="What career are you working toward?"
                className="rounded-lg min-h-20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Skills (comma-separated)</label>
              <Textarea
                value={editForm.skills || ''}
                onChange={e => updateField('skills', e.target.value)}
                placeholder="e.g. JavaScript, React, Node.js, Python"
                className="rounded-lg min-h-16"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {user?.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{user.phone}</span>
              </div>
            )}
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
            {user?.field && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Field</span>
                <span>{user.field}</span>
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
            {user?.skills && (Array.isArray(user.skills) ? user.skills : []).length > 0 && (
              <div>
                <span className="text-muted-foreground">Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills)?.map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Show prompt when profile is sparse */}
            {!user?.location && !user?.education && !user?.experience && !user?.careerGoal && (
              <p className="text-muted-foreground text-center py-4 text-xs">
                No profile details yet. Tap &quot;Edit Profile&quot; to add your information.
              </p>
            )}
          </div>
        )}
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
          onClick={handleSignOut}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-destructive" />
            <span className="text-destructive">Sign Out</span>
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
  const {
    currentView, dbUserId, setDbUserId, user, setUser, isAuthenticated, setIsAuthenticated,
    setResumes, setInterviewHistory, setSavedDocuments, setCareerContext,
    setCoverLetterContent, setCoverLetterJobTitle, setCoverLetterCompany,
    setCoverLetterJobDesc, setCoverLetterTone,
  } = useAppStore()

  // Use a ref to ensure auth check only runs once on mount
  const authCheckDone = useRef(false)

  // On mount, check localStorage for existing auth
  useEffect(() => {
    if (authCheckDone.current) return
    authCheckDone.current = true

    if (typeof window === 'undefined') return

    try {
      const authData = localStorage.getItem('nextech_auth')
      if (authData) {
        const { userId } = JSON.parse(authData)
        if (userId) {
          setDbUserId(userId)
          setIsAuthenticated(true)
          // Restore user profile AND session data in parallel
          Promise.all([
            fetch(`/api/user?id=${userId}`).then(r => r.json()),
            fetch(`/api/career-documents?userId=${userId}`).then(r => r.json()),
          ])
            .then(([userData, docsData]) => {
              // Restore user profile
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

              // Restore session data from DB (resumes, interviews, cover letters, career context)
              if (docsData.success && docsData.sessionData) {
                const s = docsData.sessionData
                // Restore resumes
                if (s.resumes && s.resumes.length > 0) {
                  setResumes(s.resumes)
                }
                // Restore interview history
                if (s.interviewHistory && s.interviewHistory.length > 0) {
                  setInterviewHistory(s.interviewHistory)
                }
                // Restore saved documents list
                if (docsData.documents) {
                  setSavedDocuments(docsData.documents)
                }
                // Restore career context (only if store is empty)
                const storeState = useAppStore.getState()
                if (!storeState.careerContext.resumeCompleted && s.careerContext) {
                  setCareerContext(s.careerContext)
                }
                // Restore latest cover letter
                if (s.latestCoverLetter && !storeState.coverLetterContent) {
                  setCoverLetterContent(s.latestCoverLetter.content || '')
                  setCoverLetterJobTitle(s.latestCoverLetter.jobTitle || '')
                  setCoverLetterCompany(s.latestCoverLetter.company || '')
                  setCoverLetterJobDesc(s.latestCoverLetter.jobDesc || '')
                  setCoverLetterTone(s.latestCoverLetter.tone || 'formal')
                }
              } else if (docsData.success && docsData.documents) {
                setSavedDocuments(docsData.documents)
              }
            })
            .catch(() => {
              // If user fetch fails, clear the stale auth data
              localStorage.removeItem('nextech_auth')
              setIsAuthenticated(false)
              setDbUserId(null)
            })
        }
      }
    } catch {
      // Invalid localStorage data, clear it
      localStorage.removeItem('nextech_auth')
    }
  }, [])

  // Auth screen (no navbar)
  if (!isAuthenticated && currentView !== 'onboarding') {
    return <AuthScreen />
  }

  // Onboarding flow is full-screen (no navbar)
  if (currentView === 'onboarding') {
    return <OnboardingFlow />
  }

  // All other views share the navbar
  return (
    <div className="min-h-screen bg-background pb-20">
      <ErrorBoundary>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'resume' && <ResumeBuilder />}
        {currentView === 'resume-analyzer' && <ResumeAnalyzer />}
        {currentView === 'cover-letter' && <CoverLetterGenerator />}
        {currentView === 'interview' && <InterviewCoach />}
        {currentView === 'progress' && <ProgressTracker />}
        {currentView === 'documents' && <DocumentHistory />}
        {currentView === 'profile' && <ProfileView />}
      </ErrorBoundary>
      <Navbar />
      <CareerGuide />
    </div>
  )
}
