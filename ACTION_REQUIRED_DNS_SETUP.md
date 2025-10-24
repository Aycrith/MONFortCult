# 🎯 ACTION REQUIRED: Complete Custom Domain Setup

## ⚠️ Current Status
✅ **Production deployment complete**  
✅ **Auto-deploy configured**  
⏳ **Custom domain setup pending** (requires DNS configuration)

---

## 📍 What's Done
- ✅ Vercel project created (montfort-landing)
- ✅ Production deployment live at: https://montfort-landing-tjabt3r9h-aycriths-projects.vercel.app
- ✅ GitHub auto-deploy configured
- ✅ All source code pushed to GitHub

## ⏳ What Needs to Happen
Your custom domain `mon.royaltyrepair.org` is ready but requires DNS configuration at your domain provider.

---

## 🔧 Step-by-Step: Complete Domain Setup

### Step 1: Access Your DNS Provider

Go to your domain provider's DNS settings for **royaltyrepair.org**:

- **GoDaddy:** https://dcc.godaddy.com/manage
- **Cloudflare:** https://dash.cloudflare.com/
- **Namecheap:** https://www.namecheap.com/domains/
- **Other provider:** Login to their control panel

### Step 2: Add the CNAME Record

In your DNS provider's control panel, create a **new CNAME record** with these settings:

```
Type:    CNAME
Host:    mon
Points to: cname.vercel.com
TTL:     3600 (or default)
```

**Visual Example (GoDaddy):**
```
Type       | Name | Value              | TTL
-----------|------|-------------------|-----
CNAME      | mon  | cname.vercel.com   | 3600
```

**Visual Example (Cloudflare):**
```
Type   | Name | Content            | TTL  | Proxied
-------|------|--------------------|----- |--------
CNAME  | mon  | cname.vercel.com   | Auto | Off
```

### Step 3: Wait for DNS Propagation

DNS changes take time to propagate worldwide:
- **Usually:** 5-30 minutes
- **Sometimes:** 1-2 hours
- **Rarely:** Up to 48 hours

**To verify DNS is updated:**

Open PowerShell and run:
```powershell
nslookup mon.royaltyrepair.org
```

You should see output similar to:
```
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name: mon.royaltyrepair.org
Address: 76.76.19.131
Aliases: cname.vercel.com
```

### Step 4: Link Domain to Vercel (After DNS Propagates)

Once DNS is updated, run this command:

```bash
cd "C:\Users\camer\Desktop\JulesLandingPage\MONFortCult"
vercel domains add mon.royaltyrepair.org
```

**Expected output:**
```
Vercel CLI 47.0.7
> Success! Domain mon.royaltyrepair.org added to project montfort-landing [2s]
```

### Step 5: Verify Everything Works

Once the command succeeds:

1. **Test the URL:**
   ```
   https://mon.royaltyrepair.org
   ```

2. **Check SSL Certificate:**
   - Click the padlock icon in browser
   - Should show valid HTTPS certificate
   - Issued by Vercel/Let's Encrypt

3. **Verify Content Loads:**
   - Three.js mountain scene should render
   - FPS counter should appear in top-left
   - Scroll animations should work smoothly

---

## 🛠️ Troubleshooting

### Problem: DNS Still Not Resolving
**Solution:**
1. Check TTL on the old DNS record (might have 24-hour TTL)
2. Wait another 5-10 minutes
3. Try from a different network or use a public DNS:
   ```powershell
   nslookup mon.royaltyrepair.org 8.8.8.8
   ```

### Problem: Domain Already in Use
**Solution:**
1. Check that no other service is using the subdomain
2. If migrating from another service, wait 24 hours after TTL expires
3. Contact your DNS provider if unsure

### Problem: vercel domains add Shows Error
**Solution:**
1. Ensure DNS CNAME is set up first
2. Wait 10+ minutes for propagation
3. Try again with:
   ```bash
   vercel domains add --force mon.royaltyrepair.org
   ```

---

## 📋 Verification Checklist

- [ ] Logged into domain provider (royaltyrepair.org)
- [ ] Found DNS/Records management section
- [ ] Created new CNAME record:
  - [ ] Name: `mon`
  - [ ] Value: `cname.vercel.com`
  - [ ] TTL: 3600
  - [ ] Saved changes
- [ ] Waited 5-30 minutes for propagation
- [ ] Tested with `nslookup mon.royaltyrepair.org`
- [ ] Ran `vercel domains add mon.royaltyrepair.org`
- [ ] Tested https://mon.royaltyrepair.org in browser
- [ ] Verified HTTPS certificate is valid
- [ ] Confirmed content loads and animations work

---

## 📞 If You Get Stuck

### Check Vercel Domain Status
```bash
vercel domains inspect mon.royaltyrepair.org
```

### View All Domains on Project
```bash
vercel domains ls
```

### Verify Project Settings
```bash
vercel projects inspect
```

### Check Deployment Status
```bash
vercel ls
```

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| **Add DNS record** | 2-3 min | 👈 You are here |
| **DNS propagation** | 5-60 min | ⏳ Auto |
| **`vercel domains add`** | 1 min | Next |
| **Vercel verification** | 1-2 min | Auto |
| **SSL cert issued** | 2-5 min | Auto |
| **Total time** | ~10-70 min | 🎉 Done! |

---

## 📝 Reference Information

### Current Deployment
- **Live URL:** https://montfort-landing-tjabt3r9h-aycriths-projects.vercel.app
- **Project ID:** prj_7vvXmtPEe5cN2RBPvn2RZh9CdBWF
- **Organization:** aycriths-projects
- **Framework:** Next.js 15.3.2

### Domain Information
- **Domain:** mon.royaltyrepair.org
- **Registrant:** royaltyrepair.org
- **Subdomain:** mon
- **Target:** cname.vercel.com

### DNS Record to Add
```
Type:  CNAME
Name:  mon
Value: cname.vercel.com
TTL:   3600
```

---

## 🎯 Once Complete

After you've successfully added the DNS records and linked the domain, your site will be available at:

✅ **https://mon.royaltyrepair.org**

The site will:
- Load the Montfort landing page
- Show the Three.js mountain hero scene
- Display the FPS counter (top-left)
- Support smooth scroll animations
- Respond to interactions
- Work on all devices (desktop, tablet, mobile)
- Have a valid HTTPS certificate
- Auto-deploy on every GitHub push

---

## 📞 Need Help?

1. **Vercel Dashboard:** https://vercel.com/dashboard
2. **DNS Provider Support:** Contact your domain provider's support
3. **Vercel Support:** https://vercel.com/support

---

**Action Required By:** You  
**Estimated Time:** 10-15 minutes (plus DNS propagation wait)  
**Difficulty:** Easy - Just add one DNS record!  
**Next Step:** Add the CNAME record at your DNS provider →
