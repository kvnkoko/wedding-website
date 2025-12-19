# Fix: "Record name www conflicts with another record" Error

## The Problem
GoDaddy is saying you already have a `www` record, so you can't add a new one. You need to either delete the old one or edit it.

---

## Solution: Delete the Old www Record First

### Step 1: Find the Existing www Record

1. **In GoDaddy DNS Settings:**
   - You should see a list of all your DNS records
   - Look for a record that has:
     - **Type:** CNAME (or sometimes A)
     - **Name:** www

2. **It might look like:**
   ```
   Type: CNAME
   Name: www
   Value: (some old value)
   ```

### Step 2: Delete the Old Record

1. **Find the three dots (⋯) or trash icon** next to the old `www` record
2. **Click it**
3. **Click "Delete"** or the trash icon
4. **Confirm** if it asks you to confirm

### Step 3: Now Add Your New Vercel Record

1. **Click "Add"** button again
2. **Fill in the form:**
   - **Type:** CNAME
   - **Name:** www
   - **Value:** `890fdac6aed22401.vercel-dns-017.com.` (the value from Vercel)
   - **TTL:** 1/2 Hour (or leave as default)
3. **Click "Save"**

✅ **Done!** The error should be gone now.

---

## Alternative: Edit the Existing Record (If You Can't Delete)

If you can't delete the old record, you can edit it instead:

1. **Find the existing `www` record**
2. **Click on it** (or click the edit/pencil icon)
3. **Change the Value field** to: `890fdac6aed22401.vercel-dns-017.com.`
4. **Click "Save"**

---

## Quick Checklist

- ✅ Delete (or edit) the old `www` record
- ✅ Add new `www` CNAME record with Vercel's value
- ✅ Make sure the A record for `@` is also set up
- ✅ Save everything

---

## Still Having Issues?

If you can't find the old `www` record:
1. Look at ALL records in your DNS list
2. Check if there's a record with Name = `www` (might be CNAME or A type)
3. If you see it, delete it
4. If you don't see it but still get the error, try refreshing the page

If the error persists:
- Wait 5 minutes and try again (sometimes GoDaddy needs a moment to update)
- Clear your browser cache and try again

