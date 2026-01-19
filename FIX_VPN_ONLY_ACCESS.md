# Fix: Site Only Works with VPN (DNS Issue)

## Why This Happens

If your site `tiffandko.com` only works with VPN but not without, it's a **DNS (Domain Name System) configuration issue**. Here's what's happening:

1. **Incomplete DNS Records**: Vercel requires **2-4 A records** for global reliability. If you only have 1, some regions can't resolve your domain.
2. **Regional DNS Propagation**: Different parts of the world use different DNS servers. Some haven't received your DNS records yet.
3. **VPN Uses Different DNS**: VPNs use different DNS servers (like Google DNS or Cloudflare DNS) that have the correct records, while your local ISP's DNS might not.

---

## ✅ Quick Fix (15 minutes)

### Step 1: Check Current DNS Configuration

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com
   - Log in → Your Project → Settings → Domains
   - Click on `tiffandko.com`
   - **Write down ALL A record IP addresses** (you should see 2-4 IP addresses)

2. **Go to GoDaddy DNS:**
   - Visit: https://www.godaddy.com
   - Sign in → My Products → Find `tiffandko.com` → Click three dots (⋯) → "DNS"
   - Count how many A records you have with Name = `@`
   - **You should have 2-4 A records, not just 1!**

### Step 2: Fix DNS Records in GoDaddy

**If you only have 1 A record (or missing some):**

1. **Get ALL A Record IPs from Vercel:**
   - Go back to Vercel → Settings → Domains → Click `tiffandko.com`
   - You'll see something like:
     ```
     A Record:
     @ → 76.76.21.21
     @ → 76.76.21.22
     @ → 76.76.21.23
     @ → 76.76.21.24
     ```
   - **You need ALL of these IPs!** Write them down.

2. **Add Missing A Records in GoDaddy:**
   - In GoDaddy DNS Management
   - For EACH IP address from Vercel (that you don't already have):
     - Click **"Add"** or **"Add Record"**
     - **Type:** Select **"A"**
     - **Name:** Type `@` (just the @ symbol)
     - **Value:** Paste ONE of the IP addresses from Vercel
     - **TTL:** Set to **600 seconds** (10 minutes)
     - Click **"Save"**
   - **Repeat for each IP address** - you should end up with 2-4 A records

3. **Verify CNAME Record:**
   - Make sure you have a CNAME record:
     - **Type:** CNAME
     - **Name:** `www`
     - **Value:** `cname.vercel-dns.com` (or whatever Vercel shows)
   - If missing, add it.

### Step 3: Wait for DNS Propagation (30 minutes - 2 hours)

DNS changes take time to spread across the internet:

1. **Wait 30 minutes** after making changes
2. **Check DNS Propagation:**
   - Visit: https://dnschecker.org
   - Enter: `tiffandko.com`
   - Select: **"A"** record type
   - Click **"Search"**
   - **Check locations worldwide** - they should all show your Vercel IP addresses
   - If some show errors or wrong IPs, wait longer (can take up to 48 hours, but usually 30 minutes - 2 hours)

### Step 4: Test Without VPN

1. **Disconnect from VPN**
2. **Clear DNS Cache:**
   - **Mac:** Open Terminal → `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
   - **Windows:** Open Command Prompt as Admin → `ipconfig /flushdns`
   - **Or:** Restart your computer
3. **Try accessing:**
   - `https://tiffandko.com`
   - Should work now! ✅

---

## 🔧 Alternative: Use Public DNS (Temporary Workaround)

If DNS propagation is slow, users can temporarily use public DNS servers:

### For Users Having Issues:

**Change DNS servers on their device:**

**Windows:**
1. Settings → Network & Internet → Change adapter options
2. Right-click your connection → Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties
4. Select "Use the following DNS server addresses"
5. Enter:
   - **Preferred:** `8.8.8.8` (Google DNS)
   - **Alternate:** `1.1.1.1` (Cloudflare DNS)
6. Click OK

**Mac:**
1. System Preferences → Network
2. Select your connection → Advanced → DNS
3. Click **"+"** to add:
   - `8.8.8.8` (Google DNS)
   - `1.1.1.1` (Cloudflare DNS)
4. Click OK

**This bypasses ISP DNS and uses public DNS servers that usually have correct records.**

---

## ✅ What Your DNS Should Look Like

**In GoDaddy, you should have:**

```
Type    Name    Value                    TTL
A       @       76.76.21.21             600
A       @       76.76.21.22             600
A       @       76.76.21.23             600
A       @       76.76.21.24             600
CNAME   www     cname.vercel-dns.com    600
```

*(Your IP addresses will be different - use the exact ones from Vercel)*

**Key Points:**
- ✅ **2-4 A records** (not just 1!)
- ✅ All A records have Name = `@`
- ✅ All point to Vercel IP addresses
- ✅ TTL set to 600 seconds (10 minutes)

---

## 🆘 Troubleshooting

### "I already have 2-4 A records but still doesn't work"

1. **Verify IP addresses match Vercel:**
   - Go to Vercel → Settings → Domains → Click `tiffandko.com`
   - Compare each IP in GoDaddy with Vercel's list
   - If any don't match, delete and add the correct ones

2. **Check for conflicting records:**
   - In GoDaddy, look for ANY other A or CNAME records for `@`
   - Delete any that don't point to Vercel

3. **Lower TTL for faster updates:**
   - Set all A records to TTL = 600 seconds (10 minutes)
   - This helps DNS updates propagate faster

### "Still doesn't work after 2 hours"

1. **Check Vercel Domain Status:**
   - Vercel → Settings → Domains → Click `tiffandko.com`
   - Does it show "Valid Configuration" or an error?
   - If error, fix what it says

2. **Re-add domain in Vercel:**
   - Sometimes removing and re-adding helps:
     - Remove `tiffandko.com` from Vercel
     - Wait 5 minutes
     - Add it back and follow setup instructions

3. **Contact Vercel Support:**
   - Visit: https://vercel.com/support
   - They can verify your DNS configuration

### "Works for me but not for guests"

This means DNS is propagating but slowly:

1. **Ask guests to:**
   - Wait a few hours
   - Clear their browser cache
   - Try using Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)

2. **Check DNS propagation:**
   - Use https://dnschecker.org
   - See which regions have correct DNS vs which don't
   - Regions showing errors will need more time

---

## 📊 Verify DNS Propagation Worldwide

**Use DNS Checker to verify:**
1. Visit: https://dnschecker.org
2. Enter: `tiffandko.com`
3. Select: **"A"** record
4. Click **"Search"**
5. **Check locations worldwide:**
   - All should show your Vercel IP addresses
   - If some show errors or wrong IPs, DNS hasn't fully propagated yet
   - Wait longer and check again

---

## ✅ Success Checklist

After fixing, verify:

- [ ] 2-4 A records in GoDaddy (all pointing to Vercel IPs)
- [ ] All A records have Name = `@`
- [ ] All IP addresses match what Vercel shows
- [ ] CNAME record for `www` exists
- [ ] TTL set to 600 seconds on all records
- [ ] Vercel shows "Valid Configuration" for domain
- [ ] DNS checker shows Vercel IPs worldwide
- [ ] Site works without VPN

---

## 🎯 Why Multiple A Records Matter

Vercel uses multiple IP addresses for:
- **Global redundancy**: If one server is down, others still work
- **Load balancing**: Traffic spreads across multiple servers
- **Regional routing**: Users connect to closest server
- **Reliability**: More servers = less downtime

**If you only have 1 A record:**
- Some DNS servers can't find your site
- Regional routing doesn't work properly
- No redundancy if that server has issues

**With 2-4 A records:**
- All DNS servers can find your site
- Works globally without VPN
- Better reliability and performance

---

## 📞 Need More Help?

1. **Vercel Support:** https://vercel.com/support
   - They can verify your DNS configuration
   - Can check if there are any other issues

2. **DNS Checker:** https://dnschecker.org
   - Verify DNS propagation worldwide
   - See which regions have correct DNS

3. **GoDaddy Support:** https://www.godaddy.com/help
   - Can help with DNS record management
   - Can verify your DNS configuration

---

## 💡 Quick Summary

**Problem:** Site only works with VPN = DNS configuration issue

**Solution:** Add ALL A records (2-4) from Vercel to GoDaddy

**Time:** 15 minutes to fix, 30 minutes - 2 hours to propagate

**Result:** Site works globally without VPN! ✅
