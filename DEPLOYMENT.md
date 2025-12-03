# Making Your Wedding Website Public

You have two main options to access your site from your phone:

## Option 1: Quick Testing with ngrok (Temporary)

This gives you a public URL instantly for testing, but it's temporary.

### Setup:
1. **Install ngrok:**
   ```bash
   brew install ngrok
   ```
   Or download from: https://ngrok.com/download

2. **Start your dev server** (if not already running):
   ```bash
   npm run dev
   ```

3. **In a new terminal, run ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (looks like `https://abc123.ngrok.io`)

5. **Access from your phone:**
   - Open the ngrok URL on your phone's browser
   - Your site is now accessible from anywhere!

**Note:** The free ngrok URL changes each time you restart it. For a permanent solution, use Option 2.

---

## Option 2: Deploy to Vercel (Permanent & Free)

This gives you a permanent URL like `your-wedding-site.vercel.app`

### Prerequisites:
- GitHub account (free)
- Vercel account (free)

### Steps:

1. **Create a GitHub repository:**
   - Go to https://github.com/new
   - Create a new repository (e.g., "wedding-website")
   - Don't initialize with README (you already have one)

2. **Push your code to GitHub:**
   ```bash
   # Initialize git (if not already done)
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit"
   
   # Add your GitHub repo (replace with your actual repo URL)
   git remote add origin https://github.com/YOUR_USERNAME/wedding-website.git
   
   # Push
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - **Important:** Add your environment variable:
     - Go to "Environment Variables"
     - Add: `DATABASE_URL` with your PostgreSQL connection string
   - Click "Deploy"

4. **Set up your database:**
   - After deployment, you'll need a production database
   - Options:
     - **Vercel Postgres** (easiest, integrated)
     - **Neon** (free tier, recommended)
     - **Supabase** (free tier)
     - **Railway** (free tier)

5. **Run database migrations:**
   - In Vercel dashboard, go to your project → Settings → Functions
   - Or use Vercel CLI:
     ```bash
     npm i -g vercel
     vercel login
     vercel env pull .env.local
     npm run db:push
     npm run db:seed
     ```

6. **Your site is live!**
   - Access at: `your-project-name.vercel.app`
   - Share this URL with anyone!

---

## Option 3: Deploy to Render (Alternative)

Similar to Vercel but with different setup:

1. Go to https://render.com
2. Sign up/login
3. Create new "Web Service"
4. Connect your GitHub repo
5. Set build command: `npm run build`
6. Set start command: `npm start`
7. Add environment variable: `DATABASE_URL`
8. Deploy!

---

## Quick Start: ngrok for Immediate Testing

If you just want to test right now on your phone:

```bash
# Terminal 1: Make sure dev server is running
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

Then open the ngrok URL on your phone!

---

## Production Database Setup

For permanent deployment, you'll need a production database. Here are free options:

### Neon (Recommended):
1. Go to https://neon.tech
2. Sign up (free)
3. Create project
4. Copy connection string
5. Add to Vercel environment variables

### Supabase:
1. Go to https://supabase.com
2. Create project
3. Get connection string from Settings → Database
4. Add to Vercel

---

## Security Notes for Production:

1. **Change admin password** immediately after first deployment
2. **Use HTTPS** (Vercel provides this automatically)
3. **Keep DATABASE_URL secret** (never commit to GitHub)
4. **Use environment variables** for all sensitive data

---

## Need Help?

- Vercel docs: https://vercel.com/docs
- ngrok docs: https://ngrok.com/docs
- Render docs: https://render.com/docs

