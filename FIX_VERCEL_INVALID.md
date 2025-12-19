# Fix: Vercel Shows "Invalid Configuration" for tiffandko.com

## The Problem
You have **TWO** A records with Name `@` in GoDaddy:
1. ✅ **Correct one:** `216.198.79.1` (this is what Vercel wants)
2. ❌ **Wrong one:** `WebsiteBuilder Site` (this is a GoDaddy website builder record - DELETE THIS!)

Vercel can't verify your domain because of the conflicting record.

---

## Solution: Delete the "WebsiteBuilder Site" A Record

### Step-by-Step:

1. **In GoDaddy DNS Records:**
   - Find the A record that says:
     - Type: A
     - Name: @
     - Value: **"WebsiteBuilder Site"** ← This is the bad one!

2. **Delete It:**
   - Click the **trash can icon** 🗑️ next to that record
   - Confirm the deletion

3. **Keep the Good One:**
   - Make sure you KEEP the A record with:
     - Type: A
     - Name: @
     - Value: **"216.198.79.1"** ← This is correct!

4. **Check Your www Record:**
   - Make sure you have the CNAME record:
     - Type: CNAME
     - Name: www
     - Value: `890fdac6aed22401.vercel-dns-017.com.`
   - This looks correct in your screenshot! ✅

---

## What You Should Have After Fixing:

### A Records (Name = @):
- ✅ **ONE** A record: Value = `216.198.79.1`
- ❌ **NO** "WebsiteBuilder Site" record

### CNAME Records:
- ✅ **ONE** CNAME record: Name = `www`, Value = `890fdac6aed22401.vercel-dns-017.com.`

### Other Records (Don't Touch):
- NS records (nameservers) - leave these alone
- SOA record - leave this alone
- TXT records - leave these alone
- Other CNAME records (like `pay`, `_domainconnect`) - leave these alone

---

## After Deleting:

1. **Go back to Vercel**
2. **Click "Refresh"** button in Vercel (top right of the domain settings)
3. **Wait 5-10 minutes**
4. **Check again** - it should change from "Invalid Configuration" to "Valid Configuration" ✅

---

## Why This Happened:

GoDaddy automatically creates a "WebsiteBuilder Site" A record when you use their website builder. Since you're using Vercel instead, you need to remove that record.

---

## Quick Checklist:

- [ ] Delete the A record with Value "WebsiteBuilder Site"
- [ ] Keep the A record with Value "216.198.79.1"
- [ ] Verify www CNAME record is correct (looks good!)
- [ ] Refresh in Vercel
- [ ] Wait 5-10 minutes
- [ ] Check Vercel again - should say "Valid Configuration"

---

## Still Not Working?

If after 10 minutes it's still invalid:
1. Double-check you only have ONE A record for `@` (the one with `216.198.79.1`)
2. Make sure the www CNAME is correct
3. Wait up to 30 minutes (DNS can be slow)
4. Try clicking "Refresh" in Vercel again

