# Vercel Deployment Setup for mon.royaltyrepair.org

## Project Configuration

This document outlines the setup for deploying the Montfort landing page to Vercel with the subdomain `mon.royaltyrepair.org`.

## Prerequisites

- ✅ Vercel CLI installed (v47.0.7 or later)
- ✅ Vercel account authenticated
- ✅ Existing royaltyrepair.org domain in Vercel
- ✅ Next.js project ready

## Setup Steps

### Step 1: Link Project to Vercel (INTERACTIVE)

Run this command in the project directory:

```bash
vercel
```

**When prompted:**
- Select: "Create a new project" (or link to existing if you've already created it in dashboard)
- Project Name: `montfort-mon` or `montfort`
- Project Location: Current directory
- Framework: Next.js (auto-detected)

### Step 2: Manual Project Creation (If CLI prompts fail)

Go to https://vercel.com/dashboard and:
1. Click "Add New" → "Project"
2. Import from GitHub (if repo is connected)
3. Project Name: `montfort-mon`
4. Framework: Next.js
5. Build & Output settings: Auto-detected

### Step 3: Configure Domain

After project creation, add the subdomain:

```bash
vercel domains add mon.royaltyrepair.org --cwd .
```

**Expected Output:**
```
✓ Domain added to project "montfort-mon"
```

### Step 4: Configure DNS Records

In your DNS provider (where royaltyrepair.org is managed):

**Add these records:**
```
Type: CNAME
Name: mon
Value: cname.vercel.com
TTL: 3600
```

OR (if using Vercel nameservers):
```
Type: A
Name: mon
Value: 76.76.19.131
TTL: 3600
```

### Step 5: Set Environment Variables

Create `.env.local` for development:

```bash
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Set production environment variables in Vercel dashboard:

```bash
vercel env add NEXT_PUBLIC_APP_ENV production
vercel env add NEXT_PUBLIC_API_URL https://mon.royaltyrepair.org
```

### Step 6: Deploy

**Development Deploy:**
```bash
vercel dev
```

**Production Deploy (Preview):**
```bash
vercel deploy --prod
```

**Automatic Deploy (Connected to GitHub):**
- Push to `main` branch
- Vercel automatically deploys

## Configuration Files

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "lhr1"],
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

### Environment Variables (Vercel Dashboard)

Set in Project Settings → Environment Variables:

| Variable | Value | When |
|----------|-------|------|
| `NEXT_PUBLIC_APP_ENV` | `production` | Production |
| `NEXT_PUBLIC_API_URL` | `https://mon.royaltyrepair.org` | Production |
| `NEXT_PUBLIC_APP_ENV` | `development` | Preview |

## Verify Deployment

1. **Check domain status:**
   ```bash
   vercel domains ls
   ```

2. **View project info:**
   ```bash
   vercel projects ls
   ```

3. **Test the deployment:**
   ```
   https://mon.royaltyrepair.org
   ```

4. **Check deployment logs:**
   ```bash
   vercel logs --follow
   ```

## Troubleshooting

### Issue: Domain not resolving

**Solution:**
1. Verify CNAME record in DNS provider
2. Wait up to 48 hours for DNS propagation
3. Use `nslookup mon.royaltyrepair.org` to verify

### Issue: Build fails

**Solution:**
1. Check build logs: `vercel logs --follow`
2. Verify `npm run build` works locally
3. Check for environment variables in production

### Issue: 404 errors on routes

**Solution:**
1. Ensure `next.config.js` has proper config
2. Verify `vercel.json` has correct framework setting
3. Check rewrites/redirects in `next.config.js`

## Production Checklist

- [ ] Domain added to Vercel project
- [ ] DNS records configured
- [ ] Environment variables set in Vercel dashboard
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in browser DevTools
- [ ] FPS counter shows 55+ FPS
- [ ] Mobile responsive (test on real device)
- [ ] All animations smooth
- [ ] Analytics configured (if needed)
- [ ] SSL certificate active (auto-enabled by Vercel)

## Monitoring & Analytics

### View Deployment Status
```bash
vercel projects list
vercel deploy --prod --confirm
```

### Check Logs
```bash
vercel logs --follow
```

### Performance Metrics
Vercel automatically provides:
- Build time tracking
- Deployment history
- Error tracking
- Performance monitoring

Access via: https://vercel.com/dashboard

## Custom Domains Summary

- **Primary Domain:** `mon.royaltyrepair.org` (CNAME → cname.vercel.com)
- **Project Name:** `montfort-mon`
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Dev Command:** `npm run dev`
- **Auto-Deploy:** On push to main branch

## Next Steps

1. Complete Step 1-3 above using Vercel CLI
2. Configure DNS records in your domain provider
3. Set environment variables in Vercel dashboard
4. Run `vercel deploy --prod` for first production deployment
5. Verify deployment at `https://mon.royaltyrepair.org`

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel CLI Docs: https://vercel.com/docs/cli
- Domain & DNS: https://vercel.com/docs/projects/domains

---

**Project:** Montfort Landing Page  
**Domain:** mon.royaltyrepair.org  
**Setup Date:** October 24, 2025
