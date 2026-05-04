'use client'

import { LayoutDashboard, FileText, Mail, Mic, User } from 'lucide-react'
import { useAppStore, type AppView } from '@/lib/store'

interface NavTab {
  id: AppView
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: NavTab[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'cover-letter', label: 'Letter', icon: Mail },
  { id: 'interview', label: 'Interview', icon: Mic },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function Navbar() {
  const { currentView, setCurrentView } = useAppStore()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-black/80 backdrop-blur-xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`
                flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200
                min-w-[60px] touch-manipulation select-none
                ${
                  isActive
                    ? 'text-teal-400'
                    : 'text-muted-foreground hover:text-foreground/70 active:scale-95'
                }
              `}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`size-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? 'text-teal-400' : ''
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -top-px left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-teal-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Safe area spacer for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
