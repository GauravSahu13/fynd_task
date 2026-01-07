import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '@/lib/database';
import { generateUserResponse, generateSummary, generateRecommendedActions } from '@/lib/llm';

interface ReviewRequest {
  rating: number;
  review_text: string;
}

interface ReviewResponse {
  success: boolean;
  review_id?: number;
  ai_response?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewResponse | { reviews: any[] } | { statistics: any }>
) {
  if (req.method === 'POST') {
    try {
      const { rating, review_text }: ReviewRequest = req.body;

      // Validation
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5',
        });
      }

      if (!review_text || review_text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Review text cannot be empty',
        });
      }

      if (review_text.length > 5000) {
        return res.status(400).json({
          success: false,
          error: 'Review text is too long (max 5000 characters)',
        });
      }

      // Generate AI responses
      const [aiResponse, aiSummary, aiActions] = await Promise.all([
        generateUserResponse(rating, review_text),
        generateSummary(rating, review_text),
        generateRecommendedActions(rating, review_text),
      ]);

      // Save to database
      const reviewId = dbOperations.insertReview(
        rating,
        review_text.trim(),
        aiResponse,
        aiSummary,
        aiActions
      );

      return res.status(201).json({
        success: true,
        review_id: Number(reviewId),
        ai_response: aiResponse,
      });
    } catch (error: any) {
      console.error('Error creating review:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process review. Please try again.',
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const reviews = dbOperations.getAllReviews();
      return res.status(200).json({ reviews });
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reviews',
      } as any);
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  } as any);
}

