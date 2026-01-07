// PostgreSQL version for production deployment
// Use this file instead of database.ts when deploying to production

import { Pool } from 'pg';

const pool = new Pool({
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

export interface Review {
  id: number;
  rating: number;
  review_text: string;
  ai_response: string | null;
  ai_summary: string | null;
  ai_recommended_actions: string | null;
  created_at: string;
}

export const dbOperations = {
  // Insert a new review
  insertReview: async (rating: number, reviewText: string, aiResponse: string, aiSummary: string, aiActions: string) => {
    const result = await pool.query(
      `INSERT INTO reviews (rating, review_text, ai_response, ai_summary, ai_recommended_actions)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [rating, reviewText, aiResponse, aiSummary, aiActions]
    );
    return result.rows[0].id;
  },

  // Get all reviews
  getAllReviews: async (): Promise<Review[]> => {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    return result.rows;
  },

  // Get review by ID
  getReviewById: async (id: number): Promise<Review | undefined> => {
    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Get statistics
  getStatistics: async () => {
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
  },
};

export default pool;

