# Database Setup Guide (ELI5)

## What is a Database?

Think of a database like a digital filing cabinet. It stores all your wedding RSVPs, events, and guest information in an organized way that your website can read and write to.

## Step 1: Get PostgreSQL (The Database Software)

You need to install PostgreSQL on your computer. Here are the easiest ways:

### Option A: Install on Your Mac (Recommended for Beginners)

1. **Download Postgres.app** (Easiest way!)
   - Go to: https://postgresapp.com/
   - Download the app
   - Drag it to your Applications folder
   - Open it and click "Initialize" to create a new server
   - You'll see a green light when it's running ✅

2. **Or use Homebrew** (If you have it installed)
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

### Option B: Use a Cloud Database (No Installation Needed!)

This is easier if you don't want to install anything on your computer:

1. **Neon** (Free tier, recommended)
   - Go to: https://neon.tech
   - Sign up for free
   - Create a new project
   - Copy the connection string (it looks like: `postgresql://user:password@host/database`)

2. **Supabase** (Also free)
   - Go to: https://supabase.com
   - Sign up and create a project
   - Go to Settings → Database
   - Copy the connection string

3. **Railway** (Free tier)
   - Go to: https://railway.app
   - Sign up and create a PostgreSQL database
   - Copy the connection string

## Step 2: Create Your Connection String

A connection string is like an address that tells your website where to find the database.

### If Using Postgres.app (Local):
```
postgresql://localhost:5432/wedding_db
```

### If Using a Cloud Service:
They'll give you a connection string that looks like:
```
postgresql://user:password@host.neon.tech/database?sslmode=require
```

## Step 3: Add It to Your Project

1. **Create a `.env` file** in your project root (same folder as `package.json`)
   - If you don't have one, create it
   - If you have `.env.example`, copy it: `cp .env.example .env`

2. **Add your connection string**:
   ```env
   DATABASE_URL="postgresql://localhost:5432/wedding_db"
   ```
   
   Or if using cloud:
   ```env
   DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"
   ```

   ⚠️ **Important**: Replace the example with YOUR actual connection string!

## Step 4: Set Up the Database Tables

This creates the "drawers" in your filing cabinet (tables for events, RSVPs, etc.)

```bash
# Generate the Prisma client (the tool that talks to your database)
npm run db:generate

# Create all the tables in your database
npm run db:push

# Add the starting data (events, invite links, admin user)
npm run db:seed
```

### What Each Command Does:

- `db:generate`: Creates the code that lets your app talk to the database
- `db:push`: Creates all the empty tables (like creating empty drawers)
- `db:seed`: Fills them with starting data (like putting sample files in the drawers)

## Step 5: Verify It Worked

If everything worked, you should see:
- ✅ No error messages
- ✅ Messages like "Created events", "Created invite link configs", "Created admin user"

## Troubleshooting

### "Can't connect to database"
- Make sure PostgreSQL is running (green light in Postgres.app)
- Check your `DATABASE_URL` is correct
- If using cloud, make sure you copied the full connection string

### "Database doesn't exist"
- For local: Create it manually:
  ```bash
  createdb wedding_db
  ```
- For cloud: Usually created automatically when you create the project

### "Permission denied"
- Make sure your database user has the right permissions
- For local Postgres.app, this usually works automatically

## Quick Start Checklist

- [ ] Install PostgreSQL (or sign up for cloud service)
- [ ] Get your connection string
- [ ] Create `.env` file with `DATABASE_URL`
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:push`
- [ ] Run `npm run db:seed`
- [ ] Start your app: `npm run dev`

## Need Help?

- Check the main README.md for more details
- Prisma docs: https://www.prisma.io/docs
- Postgres.app docs: https://postgresapp.com/documentation

