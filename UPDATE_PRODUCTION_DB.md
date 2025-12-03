# Update Production Database for Photos

The Photo table needs to be created in your production database. Here's how:

## Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Link to your project:
   ```bash
   vercel link
   ```

3. Pull production environment variables:
   ```bash
   vercel env pull .env.production
   ```

4. Run the migration:
   ```bash
   DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma db push
   ```

## Option 2: Using Neon Dashboard

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Go to "SQL Editor"
4. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS "photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);
```

## Option 3: Using Prisma Studio (Local with Production DB)

1. Set your production DATABASE_URL:
   ```bash
   export DATABASE_URL="your-production-neon-url"
   ```

2. Run:
   ```bash
   npx prisma db push
   ```

After running any of these, your photos should save successfully!

