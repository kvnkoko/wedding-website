import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with connection string validation
const createPrismaClient = () => {
  // During build time, if DATABASE_URL is not set, create a client that won't connect
  // This prevents build failures when the database isn't available
  if (process.env.DATABASE_URL) {
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }
  // Return a client that will fail gracefully if used during build
  // This should never happen in production, but prevents build errors
  return new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

