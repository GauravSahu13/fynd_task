# Database Setup

## Development (Current Setup)

The application uses a **JSON file-based storage** for development, which:
- ✅ No native compilation required (works on Windows without Visual Studio)
- ✅ No additional setup needed
- ✅ Perfect for local development and testing
- ✅ Data persists across server restarts

The database file is stored at: `database/reviews.json`

## Production Deployment

For production deployment (Vercel, Render, etc.), you should use PostgreSQL:

### Option 1: Use PostgreSQL Database File

1. Replace `lib/database.ts` with `lib/database-postgres.ts`:
   ```bash
   mv lib/database.ts lib/database-sqlite.ts
   mv lib/database-postgres.ts lib/database.ts
   ```

2. Set up a PostgreSQL database:
   - **Supabase** (free tier): https://supabase.com
   - **Neon** (free tier): https://neon.tech
   - **Render PostgreSQL**: Create in Render dashboard

3. Add `DATABASE_URL` environment variable:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

### Option 2: Keep JSON Storage (Simple Deployment)

The JSON file storage works for simple deployments too, but:
- ⚠️ Not suitable for serverless (Vercel) - file system is read-only
- ✅ Works on Render with persistent disk
- ✅ Works on traditional servers

## Migration from JSON to PostgreSQL

If you need to migrate data:

1. Export from JSON:
   ```javascript
   const reviews = require('./database/reviews.json');
   console.log(JSON.stringify(reviews, null, 2));
   ```

2. Import to PostgreSQL using the `database-postgres.ts` file

## Current Status

✅ **Development**: Using JSON file storage (no setup required)
⚠️ **Production**: Should use PostgreSQL for better scalability

