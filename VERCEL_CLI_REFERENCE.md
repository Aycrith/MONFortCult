# 🚀 Vercel Deployment CLI Commands Reference

## Quick Start

### 1. First Time Setup (Interactive)
```bash
# Run the automated setup script
npm run setup-vercel

# OR manually link to Vercel
vercel
```

### 2. Deploy Commands

```bash
# Deploy to production (builds first)
npm run deploy

# Deploy preview version (non-production)
npm run deploy:preview

# View deployment logs in real-time
npm run vercel:logs

# Start development server with Vercel environment
npm run vercel:dev
```

---

## Complete Command Reference

### Project Management

#### Link Project to Vercel
```bash
vercel
# Interactive prompt to create/link project
# Returns: Project ID and auth token
```

#### List Vercel Projects
```bash
vercel projects list
# Shows all projects in your account
```

#### Get Project Info
```bash
vercel projects inspect
# Shows detailed project configuration
```

#### Rename Project (if needed)
```bash
vercel projects rename
# Interactive prompt to rename project
```

---

### Domain Management

#### Add Custom Domain
```bash
# Add subdomain mon.royaltyrepair.org
vercel domains add mon.royaltyrepair.org

# Verify domain added
vercel domains list

# Check domain status
vercel domains inspect mon.royaltyrepair.org
```

#### DNS Configuration

**If using Vercel Nameservers:**
```
Type: A
Name: mon
Value: 76.76.19.131
TTL: 3600
```

**If using CNAME (recommended):**
```
Type: CNAME
Name: mon
Value: cname.vercel.com
TTL: 3600
```

#### Verify DNS Resolution
```bash
# Windows/PowerShell
nslookup mon.royaltyrepair.org

# Linux/Mac
dig mon.royaltyrepair.org

# Verify Vercel records
nslookup mon.royaltyrepair.org cname.vercel.com
```

---

### Environment Variables

#### Add Environment Variable
```bash
# Add to production environment
vercel env add NEXT_PUBLIC_APP_ENV production

# Add to preview environment (development)
vercel env add --environment=preview NEXT_PUBLIC_APP_ENV preview

# Interactive prompt with options
vercel env add
```

#### List Environment Variables
```bash
# Show all environment variables
vercel env list

# List for specific environment
vercel env list --environment=production
```

#### Remove Environment Variable
```bash
vercel env remove VARIABLE_NAME
```

#### Pull Environment Variables Locally
```bash
# Creates .env.local with Vercel env vars
vercel env pull

# Specific environment
vercel env pull --environment=production
```

---

### Deployment

#### Deploy to Production
```bash
# Full production deployment
vercel deploy --prod

# With confirmation prompt
vercel deploy --prod --confirm

# Show build logs during deployment
vercel deploy --prod --verbose
```

#### Deploy to Preview
```bash
# Preview deployment (automatic on PR)
vercel deploy

# Creates preview URL for testing
# Format: montfort-mon-[hash].vercel.app
```

#### View Deployment History
```bash
# List recent deployments
vercel ls

# Show deployment details
vercel inspect [deployment-url]
```

#### Check Deployment Status
```bash
# Real-time logs
vercel logs --follow

# Follow specific deployment
vercel logs [deployment-url] --follow

# Show last 50 lines
vercel logs --lines=50
```

---

### Development

#### Start Local Dev Server
```bash
# Runs with Vercel environment variables
vercel dev

# Specific port
vercel dev --port 3001

# Show additional info
vercel dev --verbose
```

#### Pull Production Environment
```bash
# Downloads production settings
vercel pull --yes --environment=production

# Creates .vercel directory with settings
```

#### Build Locally with Vercel
```bash
# Build using Vercel's build process
vercel build

# Build for production
vercel build --prod
```

---

### Authentication & Account

#### Check Authentication Status
```bash
vercel whoami
# Shows logged-in account email/username
```

#### Login to Vercel
```bash
# Interactive login
vercel login

# Login with specific provider
vercel login --github
vercel login --gitlab
vercel login --bitbucket
```

#### Logout
```bash
vercel logout
```

#### View Account Teams
```bash
vercel teams list
```

---

### Troubleshooting

#### Clear Cache
```bash
# Clear local Vercel cache
vercel projects list --force

# Rebuild project without cache
vercel rebuild
```

#### Check Deployment Health
```bash
# Detailed deployment info
vercel inspect [deployment-url] --verbose

# Check edge functions
vercel inspect [deployment-url] --edge
```

#### Verify Project Configuration
```bash
# Show vercel.json configuration
cat vercel.json

# Validate configuration
vercel projects inspect
```

#### Reset Project
```bash
# Remove local settings (creates new .vercel)
rm -r .vercel
vercel
```

---

### Advanced Options

#### Deploy with Custom Build Command
```bash
# Override build command
vercel deploy --build-command "npm run custom-build"
```

#### Specify Installation Command
```bash
# Use specific package manager
vercel deploy --install-command "pnpm install"
```

#### Deploy from Different Directory
```bash
# Deploy from subdirectory
vercel deploy --cwd ./projects/montfort
```

#### Set Metadata on Deployment
```bash
# Add metadata tags
vercel deploy --meta app_version=1.0.0

# List with metadata
vercel ls --meta
```

---

## Environment Variables for GitHub Actions

Add these to GitHub Secrets for CI/CD:

```bash
# Required for automated deployments
VERCEL_TOKEN              # Personal access token
VERCEL_ORG_ID            # Organization ID
VERCEL_PROJECT_ID        # Project ID
```

Get values:
```bash
# Show current token info
vercel teams list

# Get project ID from vercel.json or dashboard
cat .vercel/project.json | grep projectId
```

---

## Deployment Checklist

### Before Deploying
- [ ] All tests pass: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in development
- [ ] Environment variables set in Vercel dashboard
- [ ] DNS records configured
- [ ] commit message is descriptive

### After Deploying
- [ ] Visit production URL: `https://mon.royaltyrepair.org`
- [ ] Test key features work
- [ ] Check FPS counter (should be 55+)
- [ ] Verify no console errors
- [ ] Check Lighthouse score
- [ ] Monitor deployment logs: `npm run vercel:logs`

### Troubleshooting Deployment Failures
```bash
# 1. Check what went wrong
npm run vercel:logs

# 2. Verify build locally
npm run build

# 3. Check environment variables
vercel env list

# 4. Rebuild from scratch
vercel rebuild

# 5. Try preview deploy first
npm run deploy:preview
```

---

## Common Workflow Examples

### Complete Deployment Workflow
```bash
# 1. Pull latest code
git pull origin main

# 2. Install/update dependencies
npm install

# 3. Test locally
npm run dev
# Test in browser at http://localhost:3000

# 4. Pull Vercel environment
vercel pull --yes

# 5. Build locally
npm run build

# 6. Deploy to production
npm run deploy

# 7. Monitor deployment
npm run vercel:logs
```

### Update Only Environment Variables
```bash
# 1. Pull current settings
vercel env pull

# 2. Update environment variables
vercel env add NEXT_PUBLIC_API_URL https://api.example.com

# 3. Redeploy to apply
npm run deploy --prod
```

### Rollback to Previous Deployment
```bash
# 1. View deployments
vercel ls

# 2. Inspect previous version
vercel inspect [previous-deployment-url]

# 3. Promote previous deployment to production
vercel promote [previous-deployment-url]
```

### Add New Domain
```bash
# 1. Add domain to project
vercel domains add new-domain.com

# 2. Configure DNS (in your DNS provider):
#    Type: CNAME
#    Name: new-domain
#    Value: cname.vercel.com

# 3. Verify DNS
nslookup new-domain.com

# 4. Test domain
curl https://new-domain.com
```

---

## Performance Monitoring

### Check Build Times
```bash
# Recent deployment times
vercel ls --metrics

# Detailed metrics
vercel inspect [deployment-url] --metrics
```

### Monitor Real-time Traffic
```bash
# Watch logs as requests come in
vercel logs --follow --real

# Filter by status code
vercel logs --follow | grep " 200 "
```

### Lighthouse Audit
```bash
# Run on production
npm run build

# Check performance
# Visit: https://mon.royaltyrepair.org
# View: Chrome DevTools > Lighthouse
```

---

## GitHub Integration

### Setup GitHub Actions Deployment
```bash
# 1. Get Vercel tokens
vercel tokens create

# 2. Get org/project IDs
vercel projects inspect

# 3. Add to GitHub Secrets
# VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

# 4. Create .github/workflows/deploy.yml
# Already provided in this project

# 5. Push to trigger deployment
git push origin main
```

### Automatic PR Preview Deployments
- Every PR automatically gets a preview deployment
- Vercel adds comment with preview URL
- Works automatically with GitHub integration

---

## Reference Links

- **Vercel CLI Docs:** https://vercel.com/docs/cli
- **Vercel Projects:** https://vercel.com/docs/projects/overview
- **Domains & DNS:** https://vercel.com/docs/projects/domains
- **Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Deployments:** https://vercel.com/docs/deployments/overview

---

## Quick Command Summary

| Command | Purpose |
|---------|---------|
| `vercel` | Interactive project setup |
| `vercel deploy --prod` | Deploy to production |
| `vercel deploy` | Deploy preview version |
| `vercel logs --follow` | Watch deployment logs |
| `vercel env add KEY value` | Add environment variable |
| `vercel domains add domain.com` | Add custom domain |
| `vercel ls` | List deployments |
| `vercel projects list` | List projects |
| `vercel dev` | Local dev server |
| `vercel inspect [url]` | Get deployment info |

---

**Last Updated:** October 24, 2025  
**Project:** Montfort (mon.royaltyrepair.org)  
**Framework:** Next.js 15.3.2
