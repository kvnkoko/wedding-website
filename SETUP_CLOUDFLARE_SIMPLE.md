# Simple Cloudflare Setup Guide

This will route your site through Cloudflare, which should help with Myanmar access. It takes about 15 minutes, then wait 24-48 hours for it to work.

---

## Step 1: Sign Up for Cloudflare (2 minutes)

1. **Go to:** https://cloudflare.com
2. **Click "Sign Up"** (top right)
3. **Enter your email and password** (use any email - it's free)
4. **Click "Create Account"**
5. **Verify your email** (check your inbox, click the link)

---

## Step 2: Add Your Domain (3 minutes)

1. **After logging in, you'll see "Add a Site"** - Click it
2. **Enter:** `tiffandko.com`
3. **Click "Add site"**
4. **Select the Free plan** (it's free forever)
5. **Click "Continue"**

---

## Step 3: Let Cloudflare Scan Your DNS (2 minutes)

Cloudflare will automatically scan your current DNS records from GoDaddy.

1. **Wait for the scan to complete** (usually takes 1-2 minutes)
2. **You'll see your DNS records listed** - DON'T CHANGE ANYTHING YET
3. **Just review to make sure they look correct:**
   - Should see an A record for `@` pointing to an IP
   - Should see a CNAME record for `www`
4. **Scroll down and click "Continue"**

---

## Step 4: Update Nameservers in GoDaddy (5 minutes)

**Important:** This is the key step that routes traffic through Cloudflare.

### 4a. Get Nameservers from Cloudflare

1. **On the Cloudflare page, you'll see 2 nameservers** like:
   - `ns1.cloudflare.com`
   - `ns2.cloudflare.com`
   - (Your nameservers will be different - copy them exactly)
2. **Write them down or keep this page open**

### 4b. Update Nameservers in GoDaddy

1. **Open a new tab** → Go to: https://www.godaddy.com
2. **Sign in** to your GoDaddy account
3. **Click your name** (top right) → **"My Products"**
4. **Find `tiffandko.com`** in your domain list
5. **Click the three dots (⋯)** next to your domain
6. **Click "DNS"** or **"Manage DNS"**
7. **Scroll up to find "Nameservers"** section (usually at the top)
8. **Look for "Nameservers"** - you might see:
   - "GoDaddy nameservers" (selected) OR
   - "Custom nameservers" option
9. **Click "Change"** or select **"Custom nameservers"**
10. **Delete the existing nameservers** (usually 2-4 entries)
11. **Add Cloudflare's nameservers:**
    - **Nameserver 1:** Paste `ns1.cloudflare.com` (or whatever Cloudflare gave you)
    - **Nameserver 2:** Paste `ns2.cloudflare.com` (or whatever Cloudflare gave you)
12. **Click "Save"** or **"Update"**
13. **Confirm if asked** - Click "Yes" or "Save"

**✅ Done!** Your domain now uses Cloudflare's nameservers.

---

## Step 5: Configure DNS in Cloudflare (3 minutes)

1. **Go back to the Cloudflare tab**
2. **You should see your DNS records** - Cloudflare already scanned them
3. **Check each record:**

### For A Record (Root Domain):
- **Type:** A
- **Name:** `@`
- **IPv4 address:** Should show your Vercel IP (like `76.76.21.21` or similar)
- **Proxy status:** Click the cloud icon to turn it **ORANGE** (Proxied) ✅
  - **Gray cloud** = Not proxied (bypasses Cloudflare)
  - **Orange cloud** = Proxied (routes through Cloudflare) ← **You want this!**

### For CNAME Record (www):
- **Type:** CNAME
- **Name:** `www`
- **Target:** Should show `cname.vercel-dns.com` or similar
- **Proxy status:** Click the cloud icon to turn it **ORANGE** (Proxied) ✅

4. **If records look correct, click "Continue"**

---

## Step 6: Wait for Cloudflare Setup (Cloudflare does this automatically)

1. **Cloudflare will automatically:**
   - Set up SSL certificates
   - Configure security settings
   - This takes about 2-5 minutes
2. **You'll see a success message** when done
3. **Click "Finish"** or **"Done"**

---

## Step 7: Verify in Cloudflare Dashboard

1. **You should now be in the Cloudflare dashboard**
2. **Click on `tiffandko.com`** (your domain)
3. **Go to "DNS"** in the left sidebar
4. **Verify:**
   - A record for `@` has **orange cloud icon** ✅
   - CNAME record for `www` has **orange cloud icon** ✅
   - All records are correct

---

## Step 8: Wait for DNS Propagation (24-48 hours)

**Important:** Nameserver changes take 24-48 hours to propagate worldwide.

1. **During this time:**
   - Your site will still work (it's using old DNS)
   - Gradually, traffic will start routing through Cloudflare
   - After 24-48 hours, everyone will use Cloudflare

2. **You can check progress at:**
   - https://dnschecker.org
   - Enter: `tiffandko.com`
   - Select: "NS" (nameserver) record
   - Should eventually show Cloudflare nameservers worldwide

---

## ✅ You're Done!

After 24-48 hours:
- ✅ Your site routes through Cloudflare
- ✅ Uses Cloudflare's IPs (less likely to be blocked)
- ✅ Better regional routing
- ✅ Free SSL and security features
- ✅ Should work better from Myanmar

**No changes needed in Vercel** - Cloudflare automatically proxies to Vercel.

---

## 🆘 Troubleshooting

### "I can't find the Nameservers section in GoDaddy"

- Look for "DNS Management" or "Manage DNS"
- Nameservers might be in a separate "Nameservers" section at the top
- If using GoDaddy app, use the website instead (easier)

### "The cloud icon won't turn orange"

- Make sure you're clicking on the cloud icon itself
- If it's gray, click it to turn orange
- Orange = Proxied (good!)
- Gray = Not proxied (bypasses Cloudflare)

### "My site stopped working after changing nameservers"

- This is normal - wait 1-2 hours for DNS to update
- Your site should work again after DNS propagates
- Cloudflare will automatically route to Vercel

### "How do I know it's working?"

- After 24 hours, check: https://dnschecker.org
- Enter: `tiffandko.com`
- Select: "NS" record
- Should show Cloudflare nameservers (like `*.cloudflare.com`)

---

## 📞 Need Help?

If you get stuck:
1. **Tell me which step you're on**
2. **Tell me what you see on your screen**
3. **I'll help you figure it out!**

Good luck! 🚀
