import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function verifyAdminSession(request: NextRequest): Promise<{ id: string; email: string } | null> {
  const sessionId = request.cookies.get('admin_session')?.value
  if (!sessionId) return null

  // In production, use a proper session store (Redis, database, etc.)
  // For now, we'll use a simple approach with the session stored in memory
  // This is a simplified version - in production, use proper session management
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: sessionId },
    })
    return admin ? { id: admin.id, email: admin.email } : null
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateEditToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

