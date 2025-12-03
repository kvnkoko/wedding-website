# Update Production Database for Photos

The Photo table needs to be created in your production database. The error you're seeing is because the table doesn't exist yet.

## Quick Fix (Easiest)

1. Get your production DATABASE_URL from Vercel:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Copy the `DATABASE_URL` value (the one for Production)

2. Run this command (replace with your actual URL):
   ```bash
   DATABASE_URL="your-production-neon-url-here" npx prisma db push
   ```

## Or Use the Script

1. Get your production DATABASE_URL from Vercel
2. Run:
   ```bash
   export DATABASE_URL="your-production-neon-url-here"
   ./update-production-db.sh
   ```

## Or Use Neon SQL Editor

1. Go to https://console.neon.tech
2. Select your project → SQL Editor
3. Run this SQL:

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

After running any of these, try uploading photos again - they should save successfully! 🎉

