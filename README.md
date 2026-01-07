# Two-Dashboard AI Feedback System

A production-style web application with User and Admin dashboards for restaurant review management with AI-powered responses.

## Features

### User Dashboard
- Submit restaurant reviews with 1-5 star ratings
- Receive AI-generated personalized responses
- Real-time validation and error handling

### Admin Dashboard
- View all submitted reviews
- AI-generated summaries for each review
- AI-suggested recommended actions
- Real-time statistics and analytics
- Auto-refresh functionality
- Filter reviews by rating

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **LLM Integration**: Ollama, Grok, OpenRouter

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- For Ollama: Install and run Ollama locally (https://ollama.ai)
- For Grok/OpenRouter: API keys (optional)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your LLM settings:
```env
USE_OLLAMA=true
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.2

# Or use Grok/OpenRouter
GROK_API_KEY=your_grok_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) for User Dashboard
5. Open [http://localhost:3000/admin](http://localhost:3000/admin) for Admin Dashboard

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Database Considerations

For production deployment, consider:
- Using PostgreSQL instead of SQLite
- Using a managed database service (Supabase, PlanetScale, etc.)
- Updating `lib/database.ts` to use the production database

## API Endpoints

### POST /api/reviews
Submit a new review.

**Request Body:**
```json
{
  "rating": 5,
  "review_text": "Great food and service!"
}
```

**Response:**
```json
{
  "success": true,
  "review_id": 1,
  "ai_response": "Thank you for your positive feedback..."
}
```

### GET /api/reviews
Get all reviews.

**Response:**
```json
{
  "reviews": [...]
}
```

### GET /api/statistics
Get review statistics.

**Response:**
```json
{
  "total": 100,
  "ratingDistribution": {
    "5": 60,
    "4": 25,
    "3": 10,
    "2": 3,
    "1": 2
  }
}
```

## Project Structure

```
task2-webapp/
├── pages/
│   ├── index.tsx          # User Dashboard
│   ├── admin.tsx          # Admin Dashboard
│   └── api/
│       ├── reviews.ts     # Review API endpoints
│       └── statistics.ts  # Statistics API
├── lib/
│   ├── database.ts        # Database operations
│   └── llm.ts            # LLM integration
├── styles/
│   ├── globals.css
│   ├── Home.module.css
│   └── Admin.module.css
└── database/
    └── reviews.db        # SQLite database (created automatically)
```

## LLM Configuration

The system supports multiple LLM providers:

1. **Ollama** (Local, Recommended for development)
   - Install Ollama: https://ollama.ai
   - Pull a model: `ollama pull llama3.2`
   - Set `USE_OLLAMA=true` in `.env`

2. **Grok** (Cloud)
   - Get API key from x.ai
   - Set `GROK_API_KEY` in `.env`

3. **OpenRouter** (Cloud, Free tier available)
   - Get API key from openrouter.ai
   - Set `OPENROUTER_API_KEY` in `.env`

## Notes

- All LLM calls are server-side only
- Database is automatically initialized on first run
- Reviews are persisted across server restarts
- Auto-refresh on Admin Dashboard updates every 10 seconds

## License

MIT

