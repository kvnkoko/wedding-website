# Super Simple Guide: Connect tiffandko.com to Your Website

Think of it like this:
- **GoDaddy** = Where you bought your domain name (like buying a house address)
- **Vercel** = Where your website actually lives (like the actual house)
- **DNS** = The phone book that tells people where to find your website

We need to tell GoDaddy: "Hey, when someone types tiffandko.com, send them to Vercel!"

---

## 🎯 What You're Doing (In Plain English)

You're connecting two things:
1. Your domain name (tiffandko.com) that you bought on GoDaddy
2. Your website that's hosted on Vercel

It's like connecting a phone number to a phone - when someone calls your number, it rings your phone.

---

## 📋 Step-by-Step (Super Simple)

### STEP 1: Tell Vercel About Your Domain (5 minutes)

**What you're doing:** You're telling Vercel "Hey, I own tiffandko.com, connect it to my website!"

1. **Open Vercel**
   - Go to: https://vercel.com
   - Log in (use the same account you used to deploy your website)

2. **Find Your Project**
   - You should see a list of your projects
   - Click on the one that says "wedding-website" (or whatever you named it)

3. **Go to Settings**
   - Look at the top of the page - you'll see tabs like "Overview", "Deployments", "Settings"
   - Click on **"Settings"**

4. **Click on "Domains"**
   - On the left side, you'll see a menu
   - Click on **"Domains"**

5. **Add Your Domain**
   - You'll see a box that says something like "Add domain" or has a text field
   - Type: `tiffandko.com`
   - Click the **"Add"** button (or "Continue")

6. **Copy the Numbers Vercel Shows You**
   - Vercel will show you some information
   - You'll see something like:
     ```
     A Record:
     @ → 76.76.21.21
     
     CNAME Record:
     www → cname.vercel-dns.com
     ```
   - **Don't worry about what these mean!** Just copy them or take a screenshot
   - You'll need these numbers in the next step

**✅ You're done with Step 1!**

---

### STEP 2: Tell GoDaddy Where Your Website Lives (10 minutes)

**What you're doing:** You're telling GoDaddy "When someone types tiffandko.com, send them to these Vercel addresses!"

1. **Open GoDaddy**
   - Go to: https://www.godaddy.com
   - Click **"Sign In"** (top right corner)
   - Enter your email and password

2. **Find Your Domain**
   - After logging in, click on your name (top right)
   - Click **"My Products"**
   - You'll see a list - find **"tiffandko.com"**
   - Click the **three dots (⋯)** next to it
   - Click **"DNS"** or **"Manage DNS"**

3. **Add the First Record (A Record)**
   - Look for a button that says **"Add"** or **"Add Record"**
   - Click it
   - You'll see a form with dropdowns:
     - **Type:** Select **"A"** from the dropdown
     - **Name:** Type `@` (just the @ symbol, nothing else)
     - **Value:** Paste the IP address from Vercel (the number that looks like 76.76.21.21)
     - **TTL:** Leave it as is (don't change this)
   - Click **"Save"** or **"Add Record"**

4. **Add the Second Record (CNAME Record)**
   - Click **"Add"** again
   - Fill in the form:
     - **Type:** Select **"CNAME"** from the dropdown
     - **Name:** Type `www` (just www, nothing else)
     - **Value:** Paste the CNAME value from Vercel (the one that looks like cname.vercel-dns.com)
     - **TTL:** Leave it as is
   - Click **"Save"** or **"Add Record"**

5. **Check Your Work**
   - You should now see two new records:
     - One A record with `@` as the name
     - One CNAME record with `www` as the name
   - If you see them, you're good! ✅

**✅ You're done with Step 2!**

---

### STEP 3: Wait (30 minutes - 2 hours)

**What's happening:** The internet is updating its "phone book" to point tiffandko.com to your Vercel website.

1. **Go back to Vercel**
   - Go back to: Vercel → Your Project → Settings → Domains
   - You should see `tiffandko.com` listed
   - It might say "Validating" or "Pending" - that's normal!

2. **Wait**
   - This takes time - usually 30 minutes to 2 hours
   - You can refresh the page every 30 minutes to check
   - When it's ready, it will say **"Valid"** ✅

3. **What's Happening Behind the Scenes:**
   - Vercel is checking if you set up the DNS correctly
   - Once it sees the records are correct, it will say "Valid"
   - Then Vercel automatically sets up HTTPS (the lock icon) for you

**✅ Just wait - you're done with Step 3!**

---

### STEP 4: Test It! (5 minutes)

**What you're doing:** Checking if everything works!

1. **Wait at least 30 minutes** after Step 2 (give DNS time to update)

2. **Open a new browser window** (or use incognito/private mode)

3. **Type in the address bar:**
   - `https://tiffandko.com`
   - Press Enter

4. **What Should Happen:**
   - Your wedding website should appear! 🎉
   - You should see a lock icon 🔒 in the address bar (that means it's secure)

5. **Also Test:**
   - Try: `https://www.tiffandko.com`
   - This should also work!

**✅ If you see your website, you're done!**

---

## 🆘 Troubleshooting (If It's Not Working)

### "I don't see my website after 2 hours"

**Check these things:**

1. **Did you type `@` correctly?**
   - In GoDaddy, the A record Name should be exactly `@`
   - Not `tiffandko.com`, not blank, just `@`

2. **Did you type `www` correctly?**
   - In GoDaddy, the CNAME record Name should be exactly `www`
   - Not `www.tiffandko.com`, just `www`

3. **Did you copy the right numbers?**
   - Go back to Vercel → Settings → Domains
   - Click on `tiffandko.com` to see the exact values again
   - Make sure they match what you put in GoDaddy

4. **Wait longer**
   - Sometimes it takes up to 48 hours (but usually much faster)
   - Try again in a few hours

5. **Clear your browser**
   - Close all browser windows
   - Open a new one
   - Try again

---

## 📝 Quick Checklist

Before you start, make sure you have:
- ✅ GoDaddy account login (email and password)
- ✅ Vercel account login (email and password)
- ✅ Your website already deployed on Vercel (it should be working at something like `your-site.vercel.app`)

---

## 🎉 What Happens When It Works

Once everything is set up:
- ✅ People can visit `tiffandko.com` and see your website
- ✅ It will have a lock icon (secure/HTTPS)
- ✅ You can share this link with guests for RSVPs!
- ✅ Every time you update your website, it automatically updates on tiffandko.com

---

## 💡 Remember

- **DNS changes take time** - be patient!
- **You only need to do this once** - after it's set up, it works forever
- **If you get stuck**, check the troubleshooting section above
- **The exact numbers/values** will be shown in your Vercel dashboard - use those!

---

## 🆘 Still Need Help?

If you're stuck on a specific step:
1. Tell me which step you're on (Step 1, 2, 3, or 4)
2. Tell me what you see on your screen
3. I'll help you figure it out!

Good luck! You've got this! 🚀

