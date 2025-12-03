# Setup Production Database (Quick Fix)

Since you already have `DATABASE_URL` configured in Vercel, you just need to create the database tables.

## Step 1: Check if Neon Database is Active

1. Go to https://neon.tech
2. Open your project
3. If you see "Paused" or "Suspended", click "Resume" to wake it up
4. Neon databases pause after inactivity to save resources

## Step 2: Get Your Connection String

1. In Neon dashboard, go to your project
2. Click "Connection Details" or "Connection String"
3. Copy the connection string (it should look like: `postgresql://user:pass@host.neon.tech/db?sslmode=require`)

## Step 3: Set Up Database Tables

You have two options:

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables (this creates .env.local with your DATABASE_URL)
vercel env pull .env.local

# Now set up the database
npm run db:push
npm run db:seed
```

### Option B: Manual Setup (If you have the connection string)

```bash
# Temporarily set the DATABASE_URL
export DATABASE_URL='your-neon-connection-string-here'

# Create the tables
npm run db:push

# Add initial data (events, admin user, etc.)
npm run db:seed
```

## Step 4: Verify It Worked

After running `db:seed`, you should see:
- ✅ Created events
- ✅ Created invite link configs  
- ✅ Created admin user

## Step 5: Test Admin Login

1. Go to your Vercel site: `https://your-site.vercel.app/admin/login`
2. Login with:
   - Email: `admin@wedding.com`
   - Password: `admin123`

## Troubleshooting

### "Connection timeout" or "Connection refused"
- Check if Neon database is paused → Resume it
- Make sure connection string includes `?sslmode=require`

### "Table does not exist"
- Run `npm run db:push` again
- Check Vercel logs to see if there are any errors

### "Admin user not found"
- Run `npm run db:seed` again
- This creates the admin user

