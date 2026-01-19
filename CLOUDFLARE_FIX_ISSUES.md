# Fix Cloudflare DNS Issues

## Issue 1: Nameservers Not Updated (Most Important!)

**Problem:** Your NS records still show Domain Connect nameservers instead of Cloudflare nameservers.

**This means:** Traffic is NOT routing through Cloudflare yet - you need to update nameservers in GoDaddy!

### How to Fix:

1. **Get Cloudflare Nameservers:**
   - In Cloudflare dashboard → Click on `tiffandko.com`
   - Look at the right sidebar or top of the page
   - You should see "Nameservers" section
   - It will show 2 nameservers like:
     - `ns1.cloudflare.com`
     - `ns2.cloudflare.com`
   - **Copy these exactly** (yours will be different)

2. **Update Nameservers in GoDaddy:**
   - Go to: https://www.godaddy.com
   - Sign in → My Products → Find `tiffandko.com`
   - Click three dots (⋯) → "DNS" or "Manage DNS"
   - Look for **"Nameservers"** section (usually at the top)
   - Click "Change" or select "Custom nameservers"
   - **Delete the current nameservers** (the Domain Connect ones)
   - **Add Cloudflare's nameservers:**
     - Nameserver 1: `ns1.cloudflare.com` (or whatever Cloudflare gave you)
     - Nameserver 2: `ns2.cloudflare.com` (or whatever Cloudflare gave you)
   - **Save**
   - **Wait 24-48 hours** for this to propagate

---

## Issue 2: www CNAME Record Looks Wrong

**Problem:** Your `www` CNAME shows `890fdac6aed22...` which looks like a Vercel auto-generated value, not the standard CNAME.

**To Fix:**

1. **In Cloudflare DNS page:**
   - Find the `www` CNAME record
   - Click "Edit" on that record
   - Check what the current value is
   - **It should be:** `cname.vercel-dns.com` (or similar Vercel CNAME)
   - **If it's different:**
     - Go to Vercel → Settings → Domains → Click `www.tiffandko.com`
     - See what CNAME value Vercel shows
     - Update the Cloudflare CNAME to match that value
   - Make sure Proxy status is **ON (orange)** ✅
   - Save

---

## Issue 3: SSL Certificate Warning (Normal!)

**Problem:** "This hostname is not covered by a certificate" popup.

**Solution:** This is **normal during setup** - just ignore it!

- Cloudflare automatically provisions SSL certificates
- This usually takes 10-30 minutes
- The warning will disappear automatically
- You can click "Continue to activation" - it's fine

---

## Quick Checklist:

After fixing nameservers, you should have:

- [ ] **Nameservers in GoDaddy** = Cloudflare nameservers (not Domain Connect)
- [ ] **A record** = Proxied (orange cloud) ✅
- [ ] **www CNAME** = Correct Vercel CNAME + Proxied (orange cloud) ✅
- [ ] **Wait 24-48 hours** for nameservers to propagate

---

## How to Check if Nameservers Are Updated:

1. **In GoDaddy:**
   - Check Nameservers section
   - Should show Cloudflare nameservers (like `ns1.cloudflare.com`)

2. **In Cloudflare:**
   - After 24-48 hours, NS records in DNS should update to Cloudflare's
   - Or use: https://dnschecker.org
   - Enter: `tiffandko.com`
   - Select: "NS" record
   - Should show Cloudflare nameservers worldwide

---

## Most Important Action:

**Update nameservers in GoDaddy NOW** - this is the critical step that routes traffic through Cloudflare!

After that, wait 24-48 hours and your site should work better from Myanmar.
