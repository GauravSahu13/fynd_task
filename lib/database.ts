// Smart database adapter: PostgreSQL for production, in-memory for Vercel, file-based for local dev
import { Pool } from 'pg';

export interface Review {
  id: number;
  rating: number;
  review_text: string;
  ai_response: string | null;
  ai_summary: string | null;
  ai_recommended_actions: string | null;
  created_at: string;
}

// Check if we should use PostgreSQL
const usePostgreSQL = !!process.env.DATABASE_URL;

// In-memory storage for Vercel (read-only filesystem)
let inMemoryDB: Review[] = [];

// PostgreSQL connection (if DATABASE_URL is set)
let pool: Pool | null = null;

if (usePostgreSQL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
  `).catch((err) => {
    console.error('Error creating schema:', err);
  });
}

export const dbOperations = {
  // Insert a new review
  insertReview: async (rating: number, reviewText: string, aiResponse: string, aiSummary: string, aiActions: string): Promise<number> => {
    if (usePostgreSQL && pool) {
      const result = await pool.query(
        `INSERT INTO reviews (rating, review_text, ai_response, ai_summary, ai_recommended_actions)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [rating, reviewText, aiResponse, aiSummary, aiActions]
      );
      return result.rows[0].id;
    } else {
      // In-memory storage (for Vercel/serverless)
      const newId = inMemoryDB.length > 0 ? Math.max(...inMemoryDB.map(r => r.id)) + 1 : 1;
      const newReview: Review = {
        id: newId,
        rating,
        review_text: reviewText,
        ai_response: aiResponse,
        ai_summary: aiSummary,
        ai_recommended_actions: aiActions,
        created_at: new Date().toISOString(),
      };
      inMemoryDB.push(newReview);
      return newId;
    }
  },

  // Get all reviews
  getAllReviews: async (): Promise<Review[]> => {
    if (usePostgreSQL && pool) {
      const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
      return result.rows;
    } else {
      return inMemoryDB.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  // Get review by ID
  getReviewById: async (id: number): Promise<Review | undefined> => {
    if (usePostgreSQL && pool) {
      const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
      return result.rows[0];
    } else {
      return inMemoryDB.find(r => r.id === id);
    }
  },

  // Get statistics
  getStatistics: async () => {
    if (usePostgreSQL && pool) {
      const totalResult = await pool.query('SELECT COUNT(*) as count FROM reviews');
      const ratingResult = await pool.query('SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating');
      
      const total = totalResult.rows[0].count;
      const ratings = ratingResult.rows;
      
      const ratingDistribution: Record<number, number> = {};
      ratings.forEach((r: { rating: number; count: string }) => {
        ratingDistribution[r.rating] = parseInt(r.count);
      });

      return {
        total: parseInt(total),
        ratingDistribution,
      };
    } else {
      const ratingDistribution: Record<number, number> = {};
      inMemoryDB.forEach(review => {
        ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
      });

      return {
        total: inMemoryDB.length,
        ratingDistribution,
      };
    }
  },
};

export default pool;

