# Fix: Make tiffandko.com Work (Not Just www.tiffandko.com)

## The Problem
- ✅ `www.tiffandko.com` works (CNAME record is set up)
- ❌ `tiffandko.com` doesn't work (A record is missing or incorrect)

## Quick Fix Steps

### Step 1: Add Apex Domain to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Log in
   - Click on your project (wedding-website)

2. **Go to Settings → Domains**
   - Click "Settings" tab
   - Click "Domains" in the left menu

3. **Add the Apex Domain**
   - Look for "Add Domain" or the domain input field
   - Type: `tiffandko.com` (without www)
   - Click "Add" or "Continue"
   - Vercel will show you the DNS records you need

4. **Copy the A Record Values**
   - Vercel will show you something like:
     ```
     A Record:
     @ → 76.76.21.21
     ```
   - **Important:** Vercel might show you MULTIPLE A records (usually 2-4 IP addresses)
   - Copy ALL of them - you'll need to add each one in GoDaddy

---

### Step 2: Configure A Records in GoDaddy

1. **Go to GoDaddy DNS Management**
   - Visit: https://www.godaddy.com
   - Sign in
   - Click your name (top right) → "My Products"
   - Find "tiffandko.com"
   - Click the three dots (⋯) → "DNS" or "Manage DNS"

2. **Check Existing A Records**
   - Look for any A records with Name = `@`
   - If you see any, check if they point to Vercel's IP addresses
   - If they point to something else (like GoDaddy's IPs), you need to update or delete them

3. **Add Vercel A Records**
   - Vercel typically provides 2-4 A record IP addresses
   - You need to add EACH one as a separate A record
   - For each IP address Vercel gave you:
     - Click "Add" or "Add Record"
     - **Type:** Select "A"
     - **Name:** Type `@` (just the @ symbol)
     - **Value:** Paste ONE of the IP addresses from Vercel
     - **TTL:** Leave as default (usually 600 seconds)
     - Click "Save"
   - Repeat for each IP address Vercel provided

4. **Delete Conflicting Records**
   - If you see any A records for `@` that point to GoDaddy's IPs (like WebsiteBuilder or parking page IPs), DELETE them
   - Only keep the A records pointing to Vercel's IPs

---

### Step 3: Verify Both Domains in Vercel

1. **In Vercel Dashboard → Settings → Domains**
   - You should see BOTH:
     - ✅ `tiffandko.com` (apex domain)
     - ✅ `www.tiffandko.com` (www subdomain)
   - Both should show as "Valid Configuration" or have green checkmarks

2. **If tiffandko.com shows as "Invalid Configuration"**
   - Click on it to see what's wrong
   - Usually it will tell you which DNS records are missing or incorrect
   - Go back to GoDaddy and fix those records

---

### Step 4: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually it's much faster (5-30 minutes)
- You can check if it's working by:
  - Visiting: https://dnschecker.org
  - Enter: `tiffandko.com`
  - Select "A" record type
  - Check if it shows Vercel's IP addresses

---

## Common Issues & Solutions

### Issue 1: "Invalid Configuration" in Vercel
**Solution:** Make sure you added ALL the A record IP addresses Vercel provided. You need multiple A records, not just one.

### Issue 2: Still Not Working After 30 Minutes
**Solution:** 
- Clear your browser cache
- Try in incognito/private mode
- Check DNS propagation: https://dnschecker.org
- Make sure you deleted any conflicting A records in GoDaddy

### Issue 3: GoDaddy Shows "WebsiteBuilder" A Record
**Solution:** 
- This is a conflicting record
- DELETE it (it's pointing to GoDaddy's parking page, not Vercel)
- Only keep A records pointing to Vercel's IPs

### Issue 4: Can't Add Multiple A Records with Same Name
**Solution:** 
- This is normal! You CAN have multiple A records with Name = `@`
- Each one should have a different IP address (from Vercel)
- Add them one at a time

---

## What You Should Have in GoDaddy DNS

After setup, your GoDaddy DNS should look like this:

```
Type    Name    Value                    TTL
A       @       76.76.21.21             600
A       @       76.76.21.22             600
A       @       76.76.21.23             600
CNAME   www     cname.vercel-dns.com    600
```

(Your IP addresses will be different - use the ones Vercel gives you)

---

## Quick Checklist

- [ ] Added `tiffandko.com` (apex) to Vercel domains
- [ ] Copied ALL A record IP addresses from Vercel
- [ ] Added each A record in GoDaddy (Name = `@`, Value = Vercel IP)
- [ ] Deleted any conflicting A records (WebsiteBuilder, parking page, etc.)
- [ ] Verified both domains show as valid in Vercel
- [ ] Waited 5-30 minutes for DNS propagation
- [ ] Tested `tiffandko.com` in browser (try incognito mode)

---

## Still Not Working?

1. **Check Vercel Dashboard:**
   - Go to Settings → Domains
   - Click on `tiffandko.com`
   - Read the error message - it will tell you exactly what's wrong

2. **Check GoDaddy DNS:**
   - Make sure you have A records (not CNAME) for `@`
   - Make sure they point to Vercel's IPs (not GoDaddy's)

3. **Wait Longer:**
   - DNS can take up to 48 hours (rare, but possible)
   - Usually works within 30 minutes

4. **Contact Support:**
   - Vercel support: https://vercel.com/support
   - They can help verify your DNS configuration

---

## Success!

Once it's working, both should work:
- ✅ `tiffandko.com` → Your website
- ✅ `www.tiffandko.com` → Your website

Both will automatically redirect to HTTPS and work perfectly!

