# Deployment Guide

This guide provides step-by-step instructions for deploying the Two-Dashboard AI Feedback System.

## Prerequisites

- GitHub account
- Vercel account (free tier available) OR Render account (free tier available)
- LLM API key (Grok or OpenRouter) if not using Ollama

## Option 1: Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `task2-webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Configure Environment Variables

In Vercel dashboard, go to Project Settings → Environment Variables and add:

```
USE_OLLAMA=false
GROK_API_KEY=your_grok_api_key
GROK_URL=https://api.x.ai/v1/chat/completions
```

OR

```
USE_OLLAMA=false
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-project.vercel.app`

### Step 5: Database Setup

**Important**: SQLite won't work on Vercel's serverless functions. You need to:

1. Use a cloud database service (recommended):
   - **Supabase** (free tier): https://supabase.com
   - **PlanetScale** (free tier): https://planetscale.com
   - **Neon** (free tier): https://neon.tech

2. Update `lib/database.ts` to use PostgreSQL:
   ```typescript
   import { Pool } from 'pg';
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });
   ```

3. Add `DATABASE_URL` to Vercel environment variables

**Alternative**: Use Vercel KV (Redis) or Vercel Postgres for simple persistence.

## Option 2: Render Deployment

### Step 1: Prepare Your Repository

Same as Vercel - push to GitHub.

### Step 2: Create Render Web Service

1. Go to [Render](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### Step 3: Configure Service

- **Name**: `fynd-ai-feedback-system`
- **Environment**: Node
- **Build Command**: `cd task2-webapp && npm install && npm run build`
- **Start Command**: `cd task2-webapp && npm start`
- **Root Directory**: Leave empty (or set to `task2-webapp`)

### Step 4: Add Environment Variables

In Render dashboard, go to Environment and add:

```
NODE_ENV=production
USE_OLLAMA=false
GROK_API_KEY=your_grok_api_key
GROK_URL=https://api.x.ai/v1/chat/completions
DATABASE_URL=your_database_url
```

### Step 5: Add PostgreSQL Database (Optional but Recommended)

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Create a new PostgreSQL database
3. Copy the Internal Database URL
4. Add it as `DATABASE_URL` environment variable
5. Update `lib/database.ts` to use PostgreSQL

### Step 6: Deploy

1. Click "Create Web Service"
2. Wait for deployment (first deploy takes 5-10 minutes)
3. Your app will be available at `https://your-service.onrender.com`

## Database Migration (SQLite to PostgreSQL)

If you need to migrate from SQLite to PostgreSQL, update `lib/database.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize schema
pool.query(`
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    ai_response TEXT,
    ai_summary TEXT,
    ai_recommended_actions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_created_at ON reviews(created_at);
  CREATE INDEX IF NOT EXISTS idx_rating ON reviews(rating);
`);

export const dbOperations = {
  insertReview: async (rating: number, reviewText: string, aiResponse: string, aiSummary: string, aiActions: string) => {
    const result = await pool.query(
      `INSERT INTO reviews (rating, review_text, ai_response, ai_summary, ai_recommended_actions)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [rating, reviewText, aiResponse, aiSummary, aiActions]
    );
    return result.rows[0].id;
  },

  getAllReviews: async (): Promise<Review[]> => {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    return result.rows;
  },

  // ... other operations
};
```

## Testing Deployment

1. Visit your deployed User Dashboard URL
2. Submit a test review
3. Visit your deployed Admin Dashboard URL
4. Verify the review appears
5. Check that AI responses are generated

## Troubleshooting

### Issue: Database errors

**Solution**: Ensure you're using a cloud database (PostgreSQL) instead of SQLite for production.

### Issue: LLM API errors

**Solution**: 
- Verify API keys are set correctly
- Check API rate limits
- Ensure API endpoints are correct

### Issue: Build failures

**Solution**:
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Issue: Environment variables not working

**Solution**:
- Ensure variables are set in deployment platform
- Restart/redeploy after adding variables
- Check variable names match exactly

## Post-Deployment Checklist

- [ ] User Dashboard is accessible
- [ ] Admin Dashboard is accessible
- [ ] Can submit reviews from User Dashboard
- [ ] Reviews appear in Admin Dashboard
- [ ] AI responses are generated
- [ ] Statistics are displayed correctly
- [ ] Auto-refresh works on Admin Dashboard
- [ ] Database persists data across refreshes

## URLs for Submission

After successful deployment, add your URLs:

- **User Dashboard URL**: `https://your-app.vercel.app` or `https://your-app.onrender.com`
- **Admin Dashboard URL**: `https://your-app.vercel.app/admin` or `https://your-app.onrender.com/admin`

## Support

For deployment issues:
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- Next.js: https://nextjs.org/docs/deployment

