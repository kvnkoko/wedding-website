# Vercel Deployment Guide

## How It Works After Deployment

✅ **Yes, you can still make changes!** Here's how:

1. **Make changes in Cursor** (edit files as normal)
2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Your change description"
   git push
   ```
3. **Vercel automatically deploys** - Your changes go live in ~2 minutes!

## Step-by-Step Deployment

### Step 1: Initialize Git (if needed)

```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `wedding-website` (or whatever you prefer)
3. **Don't** check "Initialize with README" (you already have files)
4. Click "Create repository"

### Step 3: Push to GitHub

GitHub will show you commands. Use these (replace YOUR_USERNAME):

```bash
git remote add origin https://github.com/YOUR_USERNAME/wedding-website.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/Login (use GitHub to connect)
3. Click "Add New Project"
4. Import your `wedding-website` repository
5. Vercel auto-detects Next.js settings ✅
6. **Important:** Add Environment Variable:
   - Click "Environment Variables"
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
   - Click "Add"
7. Click "Deploy"

### Step 5: Set Up Production Database

You'll need a production database. Options:

**Option A: Neon (Recommended - Free)**
1. Go to https://neon.tech
2. Sign up (free)
3. Create new project
4. Copy the connection string
5. Add it to Vercel environment variables (replace the local one)

**Option B: Vercel Postgres (Easiest)**
1. In Vercel dashboard → Storage → Create Database
2. Select Postgres
3. It automatically adds `POSTGRES_URL` environment variable
4. Update your code to use `POSTGRES_URL` instead of `DATABASE_URL` (or rename it)

### Step 6: Run Database Migrations

After deployment, set up your database:

**Option 1: Using Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel link  # Link to your project
vercel env pull .env.local  # Get production env vars
npm run db:push
npm run db:seed
```

**Option 2: Using Vercel Dashboard**
1. Go to your project → Settings → Functions
2. Or use Vercel's database UI if using Vercel Postgres

### Step 7: You're Live! 🎉

Your site is now at: `your-project-name.vercel.app`

---

## Making Changes After Deployment

### Workflow:

1. **Edit files in Cursor** (as you normally would)

2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Updated hero section"
   git push
   ```

3. **Vercel automatically:**
   - Detects the push
   - Builds your site
   - Deploys the new version
   - Usually takes 1-2 minutes

4. **Check deployment:**
   - Go to Vercel dashboard
   - See your new deployment
   - Click to preview or it auto-deploys to production

### Pro Tips:

- **Preview deployments:** Every push creates a preview URL (great for testing)
- **Production deployments:** Pushes to `main` branch auto-deploy to production
- **Rollback:** Can rollback to previous versions in Vercel dashboard
- **Environment variables:** Update in Vercel dashboard → Settings → Environment Variables

---

## Troubleshooting

### Database Connection Issues:
- Make sure `DATABASE_URL` is set in Vercel
- Use production database (not localhost)
- Check database allows connections from Vercel IPs

### Build Errors:
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Check for TypeScript errors locally first

### Font Files Not Loading:
- Make sure fonts are in `public/fonts/` directory
- Check file paths in `lib/fonts.ts`
- Fonts should be committed to Git

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Check deployment logs in Vercel dashboard

