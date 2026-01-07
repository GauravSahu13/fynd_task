// Pure JavaScript file-based storage (no native compilation required)
// For production, use PostgreSQL (see database-postgres.ts)
import path from 'path';
import fs from 'fs';

// Ensure database directory exists
const dbDir = path.join(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'reviews.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
}

interface Review {
  id: number;
  rating: number;
  review_text: string;
  ai_response: string | null;
  ai_summary: string | null;
  ai_recommended_actions: string | null;
  created_at: string;
}

// Read database
function readDB(): Review[] {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write database
function writeDB(reviews: Review[]): void {
  fs.writeFileSync(dbPath, JSON.stringify(reviews, null, 2));
}

export type { Review };

export const dbOperations = {
  // Insert a new review
  insertReview: (rating: number, reviewText: string, aiResponse: string, aiSummary: string, aiActions: string): number => {
    const reviews = readDB();
    const newId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
    const newReview: Review = {
      id: newId,
      rating,
      review_text: reviewText,
      ai_response: aiResponse,
      ai_summary: aiSummary,
      ai_recommended_actions: aiActions,
      created_at: new Date().toISOString(),
    };
    reviews.push(newReview);
    writeDB(reviews);
    return newId;
  },

  // Get all reviews
  getAllReviews: (): Review[] => {
    const reviews = readDB();
    return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Get review by ID
  getReviewById: (id: number): Review | undefined => {
    const reviews = readDB();
    return reviews.find(r => r.id === id);
  },

  // Get statistics
  getStatistics: () => {
    const reviews = readDB();
    const ratingDistribution: Record<number, number> = {};
    
    reviews.forEach(review => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
    });

    return {
      total: reviews.length,
      ratingDistribution,
    };
  },
};

