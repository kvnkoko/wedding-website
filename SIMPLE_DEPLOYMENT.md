# 🚀 Simple Guide: Make Your Wedding Website Public (ELI5)

## What You're Doing
You're putting your website on the internet so anyone can visit it from their phone or computer!

---

## Step 1: Get a Free Database (5 minutes)

**Why?** Your website needs a place to store RSVPs and events. Think of it like a digital filing cabinet.

### Easy Option: Neon (Free Forever)
1. Go to: https://neon.tech
2. Click "Sign Up" (use Google/GitHub - easiest!)
3. Click "Create Project"
4. Name it: `wedding-website` (or anything you want)
5. **IMPORTANT:** Copy the connection string (it looks like: `postgresql://user:pass@host/db`)
   - Click "Connection Details" or look for "Connection String"
   - Copy the WHOLE thing (starts with `postgresql://`)

**Save this connection string somewhere safe!** You'll need it in Step 4.

---

## Step 2: Put Your Code on GitHub (10 minutes)

**Why?** GitHub is like Google Drive for code. Vercel (where we'll host your site) needs to see your code.

### 2a. Create GitHub Account (if you don't have one)
1. Go to: https://github.com
2. Sign up (free!)

### 2b. Create a Repository
1. Click the "+" icon (top right) → "New repository"
2. Name it: `wedding-website`
3. **Don't check** "Add a README file" (you already have one)
4. Click "Create repository"

### 2c. Upload Your Code
Open Terminal (on Mac: press Cmd+Space, type "Terminal", press Enter)

**In Terminal, type these commands one by one:**

```bash
# Go to your project folder
cd "/Users/kevinkoko/wedding website"

# Initialize git (if not already done)
git init

# Add all your files
git add .

# Save your files
git commit -m "First upload"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/wedding-website.git

# Upload to GitHub
git branch -M main
git push -u origin main
```

**If it asks for username/password:**
- Username: Your GitHub username
- Password: Use a "Personal Access Token" (see below)

**To create a Personal Access Token:**
1. GitHub → Your profile (top right) → Settings
2. Scroll down → "Developer settings"
3. "Personal access tokens" → "Tokens (classic)"
4. "Generate new token" → "Generate new token (classic)"
5. Name it: `wedding-site`
6. Check "repo" (gives access to repositories)
7. Click "Generate token"
8. **COPY IT IMMEDIATELY** (you won't see it again!)
9. Use this as your password when pushing

---

## Step 3: Deploy to Vercel (10 minutes)

**Why?** Vercel is like a free hosting service. It makes your website live on the internet!

1. Go to: https://vercel.com
2. Click "Sign Up" → Use GitHub (easiest!)
3. Click "Add New Project"
4. Find your `wedding-website` repository → Click "Import"
5. Vercel will auto-detect everything ✅
6. **DON'T click Deploy yet!** First add your database:

---

## Step 4: Add Your Database Connection

**Before clicking Deploy:**

1. Scroll down to "Environment Variables"
2. Click "Add New"
3. Name: `DATABASE_URL`
4. Value: Paste the connection string you copied from Neon (Step 1)
5. Click "Add"
6. **NOW click "Deploy"** 🚀

Wait 2-3 minutes... Vercel is building your site!

---

## Step 5: Set Up Your Database Tables

After deployment, you need to create the tables in your database.

### Option A: Using Terminal (Easier)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project (it will ask which project - choose your wedding website)
vercel link

# Get your production environment variables
vercel env pull .env.local

# Create the database tables
npm run db:push

# Add starting data (events, admin user, etc.)
npm run db:seed
```

### Option B: Using Neon Dashboard (If Terminal is confusing)

1. Go back to Neon dashboard
2. Click on your project
3. Click "SQL Editor"
4. You'll need to run the Prisma migrations manually (this is harder, so try Option A first!)

---

## Step 6: You're Live! 🎉

Your website is now at: `your-project-name.vercel.app`

**Share this URL with anyone!** They can access it from any phone or computer.

---

## Step 7: Access Your Admin Panel

1. Go to: `your-project-name.vercel.app/admin/login`
2. Login with:
   - Email: `admin@wedding.com`
   - Password: `admin123`
3. **CHANGE YOUR PASSWORD IMMEDIATELY!** (Go to admin settings)

---

## Making Changes After Deployment

**Good news:** You can still edit everything!

1. **Edit files in Cursor** (like you normally do)
2. **In Terminal, type:**
   ```bash
   git add .
   git commit -m "Updated something"
   git push
   ```
3. **Wait 2 minutes** - Vercel automatically updates your live site!

---

## Quick Troubleshooting

### "Build failed" error?
- Check Vercel build logs (click on the failed deployment)
- Make sure `DATABASE_URL` is set correctly
- Make sure you ran `npm run db:push` and `npm run db:seed`

### "Can't connect to database"?
- Double-check your `DATABASE_URL` in Vercel environment variables
- Make sure you copied the ENTIRE connection string from Neon
- Try creating a new Neon project if it still doesn't work

### "Page not found"?
- Make sure you're using the correct Vercel URL
- Check Vercel dashboard to see if deployment succeeded

---

## Need Help?

- Vercel Support: https://vercel.com/support
- Neon Support: https://neon.tech/docs
- Check your deployment logs in Vercel dashboard

---

## Summary Checklist

- [ ] Created Neon account and database
- [ ] Copied database connection string
- [ ] Created GitHub repository
- [ ] Uploaded code to GitHub
- [ ] Deployed to Vercel
- [ ] Added DATABASE_URL to Vercel
- [ ] Ran `npm run db:push` and `npm run db:seed`
- [ ] Tested your live website
- [ ] Changed admin password
- [ ] Shared your website URL! 🎉

---

**You got this!** 🚀

