import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/progress?userId=xxx — Fetch all progress milestones for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: true, milestones: [] })
    }

    const milestones = await db.progress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, milestones })
  } catch (error) {
    console.error('Fetch progress error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

// POST /api/progress — Record a new milestone
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    let { userId, type, milestone, value } = data

    if (!userId) {
      // Find the most recent user
      const existingUser = await db.user.findFirst({ orderBy: { createdAt: 'desc' } })
      if (existingUser) {
        userId = existingUser.id
      } else {
        return NextResponse.json({ error: 'No user found' }, { status: 400 })
      }
    }

    // Check if this milestone already exists (avoid duplicates)
    const existing = await db.progress.findFirst({
      where: { userId, type, milestone },
    })

    if (existing) {
      // Update the value if the milestone already exists
      const updated = await db.progress.update({
        where: { id: existing.id },
        data: { value: value ?? existing.value },
      })
      return NextResponse.json({ success: true, milestone: updated })
    }

    const result = await db.progress.create({
      data: {
        userId,
        type,
        milestone,
        value: value ?? 0,
      },
    })

    return NextResponse.json({ success: true, milestone: result })
  } catch (error) {
    console.error('Save progress error:', error)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}
