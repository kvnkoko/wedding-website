# Fix: Intermittent "Site Can't Be Reached" Issues

## Why This Happens

When `tiffandko.com` sometimes works and sometimes doesn't, it's usually a **DNS (Domain Name System) problem**. Here's what's likely happening:

1. **Missing or Incomplete DNS Records**: Vercel requires multiple A records for reliability
2. **DNS Propagation Issues**: Different parts of the internet see different DNS records
3. **DNS Caching**: Your browser or ISP is caching old/incorrect DNS information
4. **Conflicting DNS Records**: Old records pointing to wrong servers

---

## 🔍 Step 1: Diagnose the Problem (5 minutes)

### Check Your Current DNS Configuration

1. **Go to GoDaddy DNS Management:**
   - Visit: https://www.godaddy.com
   - Sign in → My Products → Find `tiffandko.com` → Click three dots (⋯) → "DNS"

2. **Check Your A Records:**
   - Look for records with Type = "A" and Name = "@"
   - **You should have 2-4 A records** pointing to Vercel's IP addresses
   - If you only have 1, or if they point to GoDaddy's IPs, that's the problem!

3. **Check Vercel Domain Status:**
   - Go to: https://vercel.com → Your Project → Settings → Domains
   - Click on `tiffandko.com`
   - Does it show "Valid Configuration" or an error?
   - If there's an error, it will tell you exactly what's wrong

4. **Test DNS Propagation:**
   - Visit: https://dnschecker.org
   - Enter: `tiffandko.com`
   - Select: "A" record type
   - Click "Search"
   - **Check if all locations show Vercel's IP addresses**
   - If some show different IPs or errors, DNS isn't fully propagated

---

## ✅ Step 2: Fix DNS Configuration (15 minutes)

### Get the Correct DNS Records from Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com
   - Log in → Your Project → Settings → Domains

2. **Add/Verify Domain:**
   - If `tiffandko.com` isn't listed, click "Add Domain" and add it
   - If it's listed, click on it to see the DNS records

3. **Copy ALL A Record IP Addresses:**
   - Vercel will show you 2-4 IP addresses (like `76.76.21.21`, `76.76.21.22`, etc.)
   - **You need ALL of them** - write them down or take a screenshot
   - Example:
     ```
     A Record:
     @ → 76.76.21.21
     @ → 76.76.21.22
     @ → 76.76.21.23
     @ → 76.76.21.24
     ```

### Update GoDaddy DNS Records

1. **Go to GoDaddy DNS Management:**
   - Visit: https://www.godaddy.com
   - Sign in → My Products → `tiffandko.com` → DNS

2. **Delete Old/Incorrect A Records:**
   - Find ALL A records with Name = "@"
   - If any point to GoDaddy IPs (like WebsiteBuilder or parking page), DELETE them
   - If any point to wrong Vercel IPs, DELETE them
   - You'll add the correct ones next

3. **Add ALL Vercel A Records:**
   - For EACH IP address Vercel gave you:
     - Click "Add" or "Add Record"
     - **Type:** Select "A"
     - **Name:** Type `@` (just the @ symbol)
     - **Value:** Paste ONE of the IP addresses from Vercel
     - **TTL:** Set to 600 seconds (or leave default)
     - Click "Save"
   - **Repeat for each IP address** - you should end up with 2-4 A records, all with Name = "@"

4. **Verify CNAME Record:**
   - Make sure you have a CNAME record:
     - **Type:** CNAME
     - **Name:** `www`
     - **Value:** `cname.vercel-dns.com` (or whatever Vercel shows)
   - If missing, add it

### What Your DNS Should Look Like:

```
Type    Name    Value                    TTL
A       @       76.76.21.21             600
A       @       76.76.21.22             600
A       @       76.76.21.23             600
A       @       76.76.21.24             600
CNAME   www     cname.vercel-dns.com    600
```

*(Your IP addresses will be different - use the exact ones Vercel gives you)*

---

## ⏳ Step 3: Wait for DNS Propagation (30 minutes - 2 hours)

DNS changes take time to spread across the internet. This is normal!

1. **Wait 30 minutes** after making DNS changes
2. **Check DNS Propagation:**
   - Visit: https://dnschecker.org
   - Enter: `tiffandko.com`
   - Select: "A" record
   - Check if locations worldwide show your Vercel IPs
   - It may take up to 48 hours, but usually works within 30 minutes

3. **Clear Your Browser Cache:**
   - Close all browser windows
   - Open a new incognito/private window
   - Try visiting `https://tiffandko.com`

---

## 🛡️ Step 4: Ensure High Availability (Always On)

### Why Multiple A Records Matter

Having multiple A records (2-4 IP addresses) is crucial for reliability:
- **Load Balancing**: Traffic spreads across multiple servers
- **Redundancy**: If one server goes down, others still work
- **Faster Response**: Closest server handles the request

### Best Practices for Always-On Websites:

1. **✅ Multiple A Records:**
   - Always add ALL A records Vercel provides
   - Don't just add one - you need redundancy

2. **✅ Proper TTL Settings:**
   - Set TTL to 600 seconds (10 minutes)
   - This balances speed and flexibility

3. **✅ Regular Monitoring:**
   - Check Vercel dashboard weekly for deployment status
   - Use uptime monitoring (see below)

4. **✅ Keep DNS Simple:**
   - Only have A records pointing to Vercel
   - Remove any conflicting records

---

## 📊 Step 5: Set Up Monitoring (Optional but Recommended)

### Free Uptime Monitoring Services:

These will alert you if your site goes down:

1. **UptimeRobot** (Free):
   - Visit: https://uptimerobot.com
   - Sign up (free)
   - Add monitor for `https://tiffandko.com`
   - Get email alerts if site is down

2. **StatusCake** (Free):
   - Visit: https://www.statuscake.com
   - Free tier includes basic monitoring

3. **Pingdom** (Free trial):
   - Visit: https://www.pingdom.com
   - Free trial available

---

## 🔧 Step 6: Verify Everything Works

### Test Checklist:

- [ ] `https://tiffandko.com` loads correctly
- [ ] `https://www.tiffandko.com` loads correctly
- [ ] Both show lock icon (HTTPS is working)
- [ ] Vercel dashboard shows "Valid Configuration" for both domains
- [ ] DNS checker shows Vercel IPs worldwide
- [ ] Site loads from different devices/networks

### Test from Different Locations:

1. **Your Phone (on cellular, not WiFi):**
   - Open browser → Visit `https://tiffandko.com`

2. **Different Browser:**
   - Try Chrome, Safari, Firefox
   - Use incognito/private mode

3. **Ask a Friend:**
   - Have someone else try accessing the site
   - If it works for them but not you, it's likely DNS caching on your end

---

## 🆘 Troubleshooting

### "Still Not Working After 2 Hours"

1. **Check Vercel Dashboard:**
   - Go to Settings → Domains
   - Click on `tiffandko.com`
   - Read the error message - it tells you exactly what's wrong

2. **Verify DNS Records:**
   - Go back to GoDaddy DNS
   - Make sure you have ALL A records from Vercel
   - Make sure none point to GoDaddy IPs

3. **Check for Conflicting Records:**
   - Look for any other A or CNAME records for "@"
   - Delete any that don't point to Vercel

4. **Wait Longer:**
   - DNS can take up to 48 hours (rare)
   - Usually works within 2 hours

### "Works Sometimes, Not Other Times"

This is a classic DNS propagation issue:

1. **Clear DNS Cache:**
   - **Mac:** Open Terminal → `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
   - **Windows:** Open Command Prompt as Admin → `ipconfig /flushdns`
   - **Or:** Restart your router

2. **Use Different DNS Servers:**
   - Try using Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)
   - This bypasses your ISP's DNS cache

3. **Wait for Full Propagation:**
   - Use https://dnschecker.org to check
   - When all locations show Vercel IPs, it should work everywhere

### "Vercel Shows Invalid Configuration"

1. **Check the Error Message:**
   - Vercel will tell you which records are missing or wrong
   - Fix those specific records

2. **Common Issues:**
   - Missing A records (need 2-4, not just 1)
   - Wrong IP addresses
   - Conflicting records

3. **Re-add Domain in Vercel:**
   - Sometimes removing and re-adding helps
   - Go to Settings → Domains → Remove `tiffandko.com`
   - Wait 5 minutes
   - Add it back and follow the setup instructions

---

## ✅ Success Checklist

After fixing, you should have:

- [ ] 2-4 A records in GoDaddy (all pointing to Vercel IPs)
- [ ] 1 CNAME record for www
- [ ] No conflicting DNS records
- [ ] Vercel shows "Valid Configuration"
- [ ] Both `tiffandko.com` and `www.tiffandko.com` work
- [ ] HTTPS (lock icon) works on both
- [ ] Site loads consistently from different locations

---

## 🎯 Why This Ensures "Always On" Like Other Websites

Professional websites stay up because they:

1. **Use Multiple Servers**: Multiple A records = multiple servers = redundancy
2. **Proper DNS Configuration**: All records point to the right place
3. **No Conflicts**: Conflicting records are removed
4. **Monitoring**: Alerts when something goes wrong

By following this guide, your site will have the same reliability as professional websites!

---

## 📞 Need More Help?

1. **Check Vercel Status:**
   - Visit: https://www.vercel-status.com
   - See if Vercel is experiencing issues

2. **Vercel Support:**
   - Visit: https://vercel.com/support
   - They can help verify your DNS configuration

3. **GoDaddy Support:**
   - They can help with DNS record management

---

## 💡 Quick Reference

**Most Common Issue:** Missing multiple A records. Vercel needs 2-4 A records, not just one!

**Quick Fix:** Add all A record IPs from Vercel to GoDaddy, delete conflicting records, wait 30 minutes.

**Prevention:** Set up uptime monitoring to get alerts if the site goes down.

