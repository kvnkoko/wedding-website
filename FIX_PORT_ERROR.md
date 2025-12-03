# Fix: "Port 5432 is already in use"

## What This Means

You already have PostgreSQL running on your Mac! This is actually **good news** - you don't need to start a new one.

## Solution: Use the Existing PostgreSQL

You have two options:

### Option 1: Use the Existing Server (Easiest!)

1. **Click "OK"** on the error dialog
2. **Don't click Initialize** - you don't need to!
3. Your PostgreSQL is already running ✅

Now you just need to:
- Find out what database name to use
- Create your `.env` file with the connection string

### Option 2: Stop the Other PostgreSQL First

If you really want to use Postgres.app instead:

1. **Find what's using port 5432:**
   ```bash
   lsof -i :5432
   ```
   This shows what's running on that port.

2. **Stop the existing PostgreSQL:**
   - If it's Homebrew: `brew services stop postgresql`
   - If it's another Postgres.app: Quit that app first
   - If it's a system service: Check System Preferences

3. **Then try Initialize again in Postgres.app**

## Recommended: Just Use What's Running!

Since you already have PostgreSQL running, let's use it:

1. **Create your database:**
   Open Terminal and run:
   ```bash
   createdb wedding_db
   ```

2. **Create your `.env` file** in your project folder:
   ```env
   DATABASE_URL="postgresql://localhost:5432/wedding_db"
   ```

3. **Continue with setup:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

That's it! You're good to go. 🎉

