# Setting Up Your Custom Domain: tiffandko.com

This guide will help you connect your GoDaddy domain to your Vercel deployment.

## Prerequisites
- ✅ Domain purchased on GoDaddy: `tiffandko.com`
- ✅ Website deployed on Vercel
- ✅ Access to GoDaddy account
- ✅ Access to Vercel account

---

## Step 1: Add Domain to Vercel (5 minutes)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Log in to your account
   - Click on your **wedding-website** project

2. **Navigate to Domain Settings**
   - Click on **"Settings"** tab (top navigation)
   - Click on **"Domains"** in the left sidebar

3. **Add Your Domain**
   - In the "Domains" section, you'll see a text input
   - Type: `tiffandko.com`
   - Click **"Add"** button
   - Vercel will show you DNS configuration instructions

4. **Copy DNS Records**
   - Vercel will display DNS records you need to add
   - You'll see something like:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21 (example IP - yours will be different)
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com (example - yours will be different)
     ```
   - **Keep this page open** - you'll need these values in Step 2

---

## Step 2: Configure DNS in GoDaddy (10 minutes)

1. **Log in to GoDaddy**
   - Go to: https://www.godaddy.com
   - Click **"Sign In"** (top right)
   - Enter your GoDaddy account credentials

2. **Access Domain Settings**
   - Click on your name (top right) → **"My Products"**
   - Find **"tiffandko.com"** in your domain list
   - Click the **three dots (⋯)** next to your domain
   - Click **"DNS"** or **"Manage DNS"**

3. **Remove Existing DNS Records (if any)**
   - Look for existing A records and CNAME records
   - Delete any that point to other services (if you're not using them)
   - **Keep MX records** (for email) if you have email set up
   - **Keep TXT records** if you have any important ones

4. **Add Vercel A Record (Root Domain)**
   - Click **"Add"** button
   - Select **"A"** from the Type dropdown
   - **Name/Host:** Enter `@` (this represents the root domain)
   - **Value/Points to:** Enter the IP address from Vercel (Step 1, A record)
   - **TTL:** Leave as default (usually 600 seconds or 1 hour)
   - Click **"Save"**

5. **Add Vercel CNAME Record (www subdomain)**
   - Click **"Add"** button again
   - Select **"CNAME"** from the Type dropdown
   - **Name/Host:** Enter `www`
   - **Value/Points to:** Enter the CNAME value from Vercel (Step 1, CNAME record)
   - **TTL:** Leave as default
   - Click **"Save"**

6. **Verify Records**
   - You should now have:
     - One **A record** with Name `@` pointing to Vercel's IP
     - One **CNAME record** with Name `www` pointing to Vercel's CNAME
   - **Note:** DNS changes can take 24-48 hours to propagate, but usually work within 1-2 hours

---

## Step 3: Verify Domain in Vercel (Wait 5-30 minutes)

1. **Go back to Vercel**
   - Return to your project → Settings → Domains
   - You should see `tiffandko.com` listed
   - It will show status: **"Validating"** or **"Pending"**

2. **Wait for DNS Propagation**
   - Vercel automatically checks if DNS is configured correctly
   - This usually takes **5-30 minutes**, but can take up to 48 hours
   - You can refresh the page to check status

3. **Check Status**
   - Once configured correctly, status will change to **"Valid"** ✅
   - Vercel will automatically issue an SSL certificate (HTTPS)
   - This usually takes another 5-10 minutes after DNS is valid

---

## Step 4: Test Your Domain

1. **Wait for DNS Propagation** (at least 30 minutes after Step 2)
   - You can check DNS propagation status at: https://dnschecker.org
   - Enter `tiffandko.com` and check if it shows Vercel's IP

2. **Test in Browser**
   - Open a new incognito/private window
   - Visit: `https://tiffandko.com`
   - Also test: `https://www.tiffandko.com`
   - Both should show your wedding website!

3. **If It's Not Working**
   - Wait a bit longer (DNS can take time)
   - Clear your browser cache
   - Try a different browser or device
   - Check Vercel dashboard for any error messages

---

## Step 5: Set Primary Domain (Optional but Recommended)

1. **In Vercel Dashboard**
   - Go to Settings → Domains
   - Find `tiffandko.com` in the list
   - Click the **three dots (⋯)** next to it
   - Click **"Set as Primary Domain"**

2. **This ensures:**
   - `www.tiffandko.com` redirects to `tiffandko.com` (or vice versa)
   - All traffic goes to your preferred domain

---

## Troubleshooting

### Domain Not Working After 2 Hours?

1. **Check DNS Records in GoDaddy**
   - Make sure A record Name is `@` (not blank, not `tiffandko.com`)
   - Make sure CNAME record Name is `www` (not `www.tiffandko.com`)
   - Verify the IP addresses match what Vercel provided

2. **Check Vercel Status**
   - Go to Vercel dashboard → Settings → Domains
   - Look for any error messages
   - Click on your domain to see detailed status

3. **Verify DNS Propagation**
   - Visit: https://dnschecker.org
   - Enter `tiffandko.com`
   - Check if it shows Vercel's IP address globally

4. **Common Issues:**
   - **Wrong record type:** Make sure you used A record for `@`, not CNAME
   - **Wrong values:** Double-check IP addresses from Vercel
   - **TTL too high:** Lower TTL to 600 seconds for faster updates
   - **Cached DNS:** Clear your browser cache or use a different network

### SSL Certificate Not Issuing?

- Wait 10-15 minutes after DNS is valid
- Vercel automatically issues SSL certificates
- If it takes longer than 24 hours, contact Vercel support

### www Not Working?

- Make sure you added the CNAME record for `www`
- Wait for DNS propagation
- Vercel should automatically redirect www to root domain (or vice versa)

---

## What Happens Next?

✅ **Your website is now live at:**
- `https://tiffandko.com`
- `https://www.tiffandko.com`

✅ **All future deployments** will automatically update your custom domain

✅ **SSL/HTTPS is automatic** - Vercel handles this for you

✅ **You can share your domain** with guests for RSVPs!

---

## Need Help?

- **Vercel Support:** https://vercel.com/support
- **GoDaddy Support:** https://www.godaddy.com/help
- **DNS Checker:** https://dnschecker.org (to verify DNS propagation)

---

## Quick Reference: DNS Records You Need

```
Type: A
Name: @
Value: [IP from Vercel]

Type: CNAME  
Name: www
Value: [CNAME from Vercel]
```

**Note:** The exact values will be shown in your Vercel dashboard when you add the domain.

