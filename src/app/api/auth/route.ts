import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/auth — Login or Register
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { action, email, password, name } = data

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (action === 'register') {
      // Check if user already exists
      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      // Create user
      const user = await db.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          passwordHash,
          onboardingDone: false,
        },
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          onboardingDone: user.onboardingDone,
        },
      })
    }

    if (action === 'login') {
      // Find user by email
      const user = await db.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      // Check if user has a password (legacy users might not)
      if (!user.passwordHash) {
        // Auto-set password for legacy users
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)
        await db.user.update({
          where: { id: user.id },
          data: { passwordHash },
        })
      } else {
        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          education: user.education,
          field: user.field,
          experience: user.experience,
          skills: user.skills,
          careerGoal: user.careerGoal,
          onboardingDone: user.onboardingDone,
          onboardingStep: user.onboardingStep,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid action. Use "login" or "register"' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
