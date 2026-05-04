import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const user = await db.user.create({
      data: {
        name: data.name || '',
        email: data.email || null,
        phone: data.phone || null,
        age: data.age || null,
        location: data.location || '',
        education: data.education || '',
        field: data.field || '',
        experience: data.experience || '',
        skills: data.skills ? JSON.stringify(data.skills) : null,
        careerGoal: data.careerGoal || '',
        onboardingDone: data.onboardingDone || false,
        onboardingStep: data.onboardingStep || 0,
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('id')

    if (!userId) {
      const users = await db.user.findMany({ take: 1, orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ success: true, user: users[0] || null })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.age !== undefined) updateData.age = data.age
    if (data.location !== undefined) updateData.location = data.location
    if (data.education !== undefined) updateData.education = data.education
    if (data.field !== undefined) updateData.field = data.field
    if (data.experience !== undefined) updateData.experience = data.experience
    if (data.skills !== undefined) updateData.skills = JSON.stringify(data.skills)
    if (data.careerGoal !== undefined) updateData.careerGoal = data.careerGoal
    if (data.onboardingDone !== undefined) updateData.onboardingDone = data.onboardingDone
    if (data.onboardingStep !== undefined) updateData.onboardingStep = data.onboardingStep

    const user = await db.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
