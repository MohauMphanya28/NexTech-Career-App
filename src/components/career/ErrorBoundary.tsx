'use client'

import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/15">
            <AlertTriangle className="size-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              An unexpected error occurred. Don&apos;t worry — your data is safe. Try refreshing or go back.
            </p>
            {this.state.error && (
              <p className="mt-2 text-xs text-muted-foreground/70 font-mono break-all max-w-md">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={this.handleReset}
              className="gap-2 bg-teal-500 text-white hover:bg-teal-400 rounded-xl"
            >
              <RotateCcw className="size-4" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="rounded-xl"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
