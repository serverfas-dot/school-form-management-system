# Netlify Deployment Guide

## Quick Setup

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Netlify will auto-detect the settings from `netlify.toml`
5. Click "Deploy site"

### 3. Add Environment Variables

In Netlify dashboard:

1. Go to Site settings → Environment variables
2. Add these variables (from your `.env` file):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 4. Redeploy

After adding environment variables, trigger a new deployment:
- Go to Deploys → Trigger deploy → Deploy site

## Automatic Deployments

Every push to the `main` branch will automatically deploy to Netlify.

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails
- Check the deploy logs in Netlify
- Ensure all environment variables are set
- Verify Node version matches `package.json` engines

### Environment Variables Not Working
- Make sure they start with `VITE_`
- Redeploy after adding/changing variables
- Check they're set in Netlify dashboard (not just `.env`)

### 404 on Refresh
- This is already handled by the redirect rule in `netlify.toml`
- If it still happens, check the `_redirects` file or `netlify.toml` configuration
