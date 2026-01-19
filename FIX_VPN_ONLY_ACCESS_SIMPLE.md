# Fix: Site Only Works with VPN (Quick Guide)

## The Problem

Your site `tiffandko.com` only works with VPN because you likely only have **1 A record** in GoDaddy, but Vercel needs **2-4 A records** for global reliability.

---

## ✅ Quick Fix (Check GoDaddy DNS)

Since Vercel doesn't show DNS records after validation, we'll check and fix it directly in GoDaddy:

### Step 1: Check Your Current DNS in GoDaddy (5 minutes)

1. **Go to GoDaddy:**
   - Visit: https://www.godaddy.com
   - Sign in → Click your name (top right) → "My Products"
   - Find `tiffandko.com` → Click the **three dots (⋯)** → **"DNS"**

2. **Count Your A Records:**
   - Look for records with **Type = "A"** and **Name = "@"**
   - **Count how many you have**
   - If you only see **1 A record**, that's the problem!
   - You need **2-4 A records**

### Step 2: Add Missing A Records (10 minutes)

**Standard Vercel IP addresses for A records:**

Vercel uses these IP addresses for A records (you should have all of them):
- `76.76.21.21`
- `76.76.21.22` 
- `76.76.21.23`
- `76.76.21.24`

**If you only have 1 or 2 A records, add the missing ones:**

1. **In GoDaddy DNS Management:**
   - For each IP address you're missing (from the list above):
     - Click **"Add"** or **"Add Record"**
     - **Type:** Select **"A"**
     - **Name:** Type `@` (just the @ symbol)
     - **Value:** Paste one of the IP addresses from above
     - **TTL:** Set to **600** (10 minutes)
     - Click **"Save"**
   - **Repeat for each missing IP address**

2. **Final Result:**
   - You should have **4 A records**:
     - A record: `@` → `76.76.21.21`
     - A record: `@` → `76.76.21.22`
     - A record: `@` → `76.76.21.23`
     - A record: `@` → `76.76.21.24`
   - Plus 1 CNAME record:
     - CNAME record: `www` → `cname.vercel-dns.com`

### Step 3: Verify Your DNS (5 minutes)

1. **Check DNS Propagation:**
   - Visit: https://dnschecker.org
   - Enter: `tiffandko.com`
   - Select: **"A"** record
   - Click **"Search"**
   - **Check locations worldwide** - they should all show the Vercel IPs

2. **Wait 30 minutes - 2 hours** for DNS to propagate globally

3. **Test Without VPN:**
   - Disconnect from VPN
   - Clear browser cache (or use incognito mode)
   - Visit: `https://tiffandko.com`
   - Should work now! ✅

---

## 📋 What Your GoDaddy DNS Should Look Like

**After fixing, you should have:**

```
Type    Name    Value                    TTL
A       @       76.76.21.21             600
A       @       76.76.21.22             600
A       @       76.76.21.23             600
A       @       76.76.21.24             600
CNAME   www     cname.vercel-dns.com    600
```

**Key Points:**
- ✅ **4 A records** (not just 1!)
- ✅ All have Name = `@`
- ✅ All point to Vercel IPs
- ✅ TTL = 600 seconds

---

## 🆘 Troubleshooting

### "I already have some of these IPs but not all"

- **Keep the ones you have** (if they match the list above)
- **Add the missing ones** using Step 2

### "I have different IP addresses than the ones listed"

- **If your domain is already working** (just not without VPN), keep your current IPs
- **But make sure you have 2-4 A records total**
- If you only have 1, add more using your existing IP pattern (usually they're sequential like `.21`, `.22`, `.23`, `.24`)

### "I have A records with different IPs"

- Check what IPs you currently have
- If they're not Vercel IPs (like GoDaddy parking page IPs), **delete them**
- Add the correct Vercel IPs from the list above

---

## 💡 Why Multiple A Records Matter

- **1 A record** = Only some DNS servers can find your site = Only works with VPN
- **2-4 A records** = All DNS servers can find your site = Works globally without VPN ✅

---

## 📞 Need Help?

1. **Check what A records you currently have in GoDaddy**
2. **Share the count** - Do you have 1, 2, 3, or 4 A records?
3. **Share the IP addresses** (if you want me to verify they're correct)

I can help you verify if your current DNS configuration is correct!
