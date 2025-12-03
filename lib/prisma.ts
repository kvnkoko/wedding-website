import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy getter for Prisma client - only creates it when accessed
const getPrismaClient = (): PrismaClient => {
  // During build time, return a mock that throws if accessed
  if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error('Prisma client is not available during build. DATABASE_URL must be set at runtime.')
      },
    })
  }

  // Create or return cached client
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }
  
  return globalForPrisma.prisma
}

// Export a proxy that lazily creates the client only when accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

