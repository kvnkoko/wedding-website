import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we're in build mode (only during actual build, not runtime)
const isBuildTime = () => {
  // Only return true during actual Next.js build phase, not during runtime
  return process.env.NEXT_PHASE === 'phase-production-build'
}

// Lazy getter for Prisma client - only creates it when accessed
const getPrismaClient = (): PrismaClient => {
  // During build time, return a safe mock that doesn't throw
  if (isBuildTime()) {
    // Return a proxy that returns empty arrays/objects instead of throwing
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        // Return a mock object for model access
        if (typeof prop === 'string' && prop[0] === prop[0].toLowerCase()) {
          return new Proxy({}, {
            get() {
              return {
                findMany: async () => [],
                findUnique: async () => null,
                create: async () => ({}),
                update: async () => ({}),
                delete: async () => ({}),
                deleteMany: async () => ({ count: 0 }),
                createMany: async () => ({ count: 0 }),
                updateMany: async () => ({ count: 0 }),
              }
            },
          })
        }
        return undefined
      },
    })
  }

  // Create or return cached client
  if (!globalForPrisma.prisma) {
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    // For Neon and serverless environments, configure connection pooling
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  
  return globalForPrisma.prisma
}

// Export a proxy that lazily creates the client only when accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    try {
      const client = getPrismaClient()
      const value = (client as any)[prop]
      return typeof value === 'function' ? value.bind(client) : value
    } catch (error) {
      // During build, return safe defaults
      if (isBuildTime()) {
        return () => Promise.resolve([])
      }
      throw error
    }
  },
})

