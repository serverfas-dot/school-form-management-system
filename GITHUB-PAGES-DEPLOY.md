# GitHub Pages Deployment Guide

## Auto-Deploy Setup

Your project is configured to **automatically deploy to GitHub Pages** every time you push code to the `main` branch. The workflow file is at `.github/workflows/deploy.yml`.

---

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon (top right) → **New repository**
3. **Repository name:** `school-form-management-system`
4. Choose **Public** (GitHub Pages on free accounts requires public repos)
5. **DO NOT** add README, .gitignore, or license (we already have them)
6. Click **Create repository**

## Step 2: Push Your Code to GitHub

In your terminal, from the project folder:

```bash
git init
git add .
git commit -m "Initial commit - School Form Management System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/school-form-management-system.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Step 3: Enable GitHub Pages

1. In your repository, go to **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. That's it — the workflow will handle the rest automatically

## Step 4: Add Your Secrets (IMPORTANT!)

Your app needs two secret keys to connect to the database. Without these, the site will be blank.

### How to Add Secrets

1. In your repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret below:

---

### Secret 1

| Field | Value |
|-------|-------|
| **Name** | `VITE_SUPABASE_URL` |
| **Secret** | `https://pvhpxmmssgdqqqndivnf.supabase.co` |

### Secret 2

| Field | Value |
|-------|-------|
| **Name** | `VITE_SUPABASE_ANON_KEY` |
| **Secret** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aHB4bW1zc2dkcXFxbmRpdm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDY2MDAsImV4cCI6MjA4MTUyMjYwMH0.Yfqj3valffpS4DjgMEE5FyXMg1VXMR69Ubah7X0eJNI` |

---

## Step 5: Trigger the First Deploy

After adding the secrets:

1. Go to the **Actions** tab in your repository
2. You should see a workflow named **Deploy to GitHub Pages**
3. If it didn't auto-trigger, make a small change, commit, and push:
   ```bash
   git commit --allow-empty -m "Trigger deploy"
   git push
   ```
4. Wait 2-3 minutes for the build to finish

## Your Live Site URL

Once deployed, your site will be live at:

```
https://YOUR-USERNAME.github.io/school-form-management-system/
```

## How Auto-Deploy Works

- Every time you push code to the `main` branch, GitHub automatically:
  1. Installs dependencies
  2. Injects your secret keys into the build
  3. Builds the project
  4. Publishes it to GitHub Pages
- No manual steps needed after the first setup

## Troubleshooting

### Site is blank or shows errors
- Make sure you added BOTH secrets exactly as shown above
- Check the **Actions** tab for any build errors
- Re-run the workflow if needed

### Deploy didn't trigger
- Go to **Actions** tab → click **Deploy to GitHub Pages** → **Run workflow** manually

### Page not found (404)
- Make sure **Settings** → **Pages** → **Source** is set to **GitHub Actions**
- Wait a few minutes after the first deploy for the URL to propagate

### Build failed
- Check the **Actions** tab for error logs
- Make sure Node version matches (we use 18)
- Verify the secrets are set correctly (no extra spaces)

## Success Checklist

- [ ] Created GitHub repository (public)
- [ ] Pushed code to `main` branch
- [ ] Enabled Pages with "GitHub Actions" source
- [ ] Added `VITE_SUPABASE_URL` secret
- [ ] Added `VITE_SUPABASE_ANON_KEY` secret
- [ ] First deploy completed successfully
- [ ] Site is live at `https://YOUR-USERNAME.github.io/school-form-management-system/`
