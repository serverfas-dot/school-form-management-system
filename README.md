# School Form Management System

A comprehensive form management system built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- 📋 Multiple form types (Club Registration, Position Applications, Volunteer Forms, Office Items Requests)
- 👥 Admin dashboard with approval workflows
- 🔐 Secure authentication system
- 📊 Real-time form submissions tracking
- 🎨 Modern, responsive UI
- 🔒 Row Level Security (RLS) with Supabase

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify

## Quick Start - Local Development

### Prerequisites

- Node.js 18+ installed
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/samm2217H-beep/School-Form-Management-System.git
cd School-Form-Management-System
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173)

## Deploying to Netlify

### Step-by-Step Guide

1. **Push to GitHub**
   - Ensure all your code is committed and pushed to GitHub
   - The `.env` file is automatically ignored (already in `.gitignore`)

2. **Import to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Netlify will auto-detect settings from `netlify.toml`

3. **Configure Environment Variables**
   - In Netlify dashboard → Site settings → Environment variables
   - Add these variables:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy site" button
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### Netlify Configuration

The project includes `netlify.toml` with:
- ✅ Automatic build settings
- ✅ SPA routing configuration
- ✅ Node version specification
- ✅ Optimized for Vite

### Automatic Deployments

Every push to your `main` branch triggers automatic redeployment.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── ClubRegistrationForm.tsx
│   │   ├── PositionApplicationForm.tsx
│   │   └── ...
│   ├── lib/                 # Utilities and configurations
│   │   ├── supabase.ts     # Supabase client
│   │   ├── auth.ts         # Authentication utilities
│   │   └── formConfig.ts   # Form configurations
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── netlify.toml           # Netlify configuration
└── package.json           # Dependencies

```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## Database Setup

The project uses Supabase with pre-configured migrations in `supabase/migrations/`.

### Tables:
- `form_submissions` - General form submissions
- `office_items_requests` - Office items requests
- `volunteer_form` - Volunteer applications
- `club_registration` - Club registrations
- `position_applications` - Position applications
- `form_configurations` - Form settings
- `form_fields` - Dynamic form fields
- `admin_passwords` - Admin authentication

## Admin Access

Default credentials are configured in the database. Check with your administrator for access.

## Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGc...` |

## Security

- All tables have Row Level Security (RLS) enabled
- Admin authentication required for dashboard access
- Secure password hashing
- Environment variables for sensitive data

## Troubleshooting

### Build Fails
- Ensure all environment variables are set
- Run `npm run build` locally to test
- Check build logs in Netlify dashboard

### Database Connection Issues
- Verify Supabase credentials
- Check if Supabase project is active
- Ensure RLS policies are correctly configured

### Forms Not Submitting
- Check browser console for errors
- Verify database tables exist
- Check RLS policies allow public inserts

## Support

For issues and questions:
- Check Netlify documentation: [docs.netlify.com](https://docs.netlify.com)
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Open an issue on GitHub

## License

Private project - All rights reserved
