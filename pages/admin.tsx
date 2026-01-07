import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import styles from '@/styles/Admin.module.css';

interface Review {
  id: number;
  rating: number;
  review_text: string;
  ai_response: string | null;
  ai_summary: string | null;
  ai_recommended_actions: string | null;
  created_at: string;
}

interface Statistics {
  total: number;
  ratingDistribution: Record<number, number>;
}

export default function AdminDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        axios.get('/api/reviews'),
        axios.get('/api/statistics'),
      ]);

      setReviews(reviewsRes.data.reviews || []);
      setStatistics(statsRes.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load data. Please refresh the page.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - Restaurant Reviews</title>
        <meta name="description" content="Admin dashboard for restaurant reviews" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <div className={styles.controls}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh (10s)
              </label>
              <button onClick={fetchData} className={styles.refreshButton}>
                Refresh Now
              </button>
            </div>
          </div>

          {statistics && (
            <div className={styles.statistics}>
              <div className={styles.statCard}>
                <h3>Total Reviews</h3>
                <p className={styles.statNumber}>{statistics.total}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Rating Distribution</h3>
                <div className={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className={styles.ratingBar}>
                      <span className={styles.ratingLabel}>
                        {rating}★: {statistics.ratingDistribution[rating] || 0}
                      </span>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${((statistics.ratingDistribution[rating] || 0) / statistics.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={styles.filters}>
            <button
              className={`${styles.filterButton} ${filterRating === null ? styles.active : ''}`}
              onClick={() => setFilterRating(null)}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                className={`${styles.filterButton} ${filterRating === rating ? styles.active : ''}`}
                onClick={() => setFilterRating(rating)}
              >
                {rating}★ ({reviews.filter((r) => r.rating === rating).length})
              </button>
            ))}
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <div className={styles.loading}>Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className={styles.emptyState}>No reviews found.</div>
          ) : (
            <div className={styles.reviewsList}>
              {filteredReviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewMeta}>
                      <span className={styles.reviewId}>#{review.id}</span>
                      <span className={styles.reviewRating}>
                        {review.rating}★
                      </span>
                      <span className={styles.reviewDate}>
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.reviewContent}>
                    <h4>Review:</h4>
                    <p>{review.review_text}</p>
                  </div>

                  {review.ai_summary && (
                    <div className={styles.aiSection}>
                      <h4>AI Summary:</h4>
                      <p>{review.ai_summary}</p>
                    </div>
                  )}

                  {review.ai_recommended_actions && (
                    <div className={styles.aiSection}>
                      <h4>Recommended Actions:</h4>
                      <div
                        className={styles.actionsList}
                        dangerouslySetInnerHTML={{
                          __html: review.ai_recommended_actions.replace(/\n/g, '<br />'),
                        }}
                      />
                    </div>
                  )}

                  {review.ai_response && (
                    <div className={styles.aiSection}>
                      <h4>AI Response (sent to user):</h4>
                      <p className={styles.userResponse}>{review.ai_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={styles.footer}>
            <a href="/" className={styles.userLink}>
              ← User Dashboard
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

