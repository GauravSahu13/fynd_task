import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import styles from '@/styles/Home.module.css';

export default function UserDashboard() {
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAiResponse('');
    setSuccess(false);

    try {
      const response = await axios.post('/api/reviews', {
        rating,
        review_text: reviewText,
      });

      if (response.data.success) {
        setAiResponse(response.data.ai_response || '');
        setSuccess(true);
        setReviewText(''); // Clear form
      } else {
        setError(response.data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Restaurant Review - User Dashboard</title>
        <meta name="description" content="Submit your restaurant review" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Restaurant Review</h1>
          <p className={styles.subtitle}>Share your dining experience with us</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="rating" className={styles.label}>
                Rating
              </label>
              <div className={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starButton} ${rating >= star ? styles.active : ''}`}
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
                <span className={styles.ratingText}>{rating} {rating === 1 ? 'star' : 'stars'}</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="review" className={styles.label}>
                Your Review
              </label>
              <textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about your experience..."
                className={styles.textarea}
                rows={6}
                maxLength={5000}
                required
              />
              <div className={styles.charCount}>
                {reviewText.length} / 5000 characters
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || reviewText.trim().length === 0}
              className={styles.submitButton}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>

          {error && (
            <div className={styles.errorMessage}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && aiResponse && (
            <div className={styles.successMessage}>
              <h3>Thank you for your review!</h3>
              <div className={styles.aiResponse}>
                <strong>Our Response:</strong>
                <p>{aiResponse}</p>
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <a href="/admin" className={styles.adminLink}>
              Admin Dashboard →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

