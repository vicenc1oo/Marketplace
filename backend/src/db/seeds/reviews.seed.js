const { query, pool } = require('../../config/db');

const reviews = [
  {
    id: 'r1',
    reviewedUserId: 'u1',
    authorId: 'u2',
    listingId: 'l1',
    rating: 5,
    text: 'Smooth transaction, item exactly as described.',
  },
  {
    id: 'r2',
    reviewedUserId: 'u1',
    authorId: 'u3',
    listingId: 'l3',
    rating: 4,
    text: 'Friendly and quick to reply. Would buy again.',
  },
];

async function seedReviewsTable() {
  for (const review of reviews) {
    await query(
        `INSERT INTO reviews (
          id, reviewed_user_id, author_id, listing_id, rating, text
        ) VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
          reviewed_user_id = EXCLUDED.reviewed_user_id,
                                 author_id = EXCLUDED.author_id,
                                 listing_id = EXCLUDED.listing_id,
                                 rating = EXCLUDED.rating,
                                 text = EXCLUDED.text`,
        [
          review.id, review.reviewedUserId, review.authorId,
          review.listingId, review.rating, review.text,
        ],
    );
  }
  console.log('Reviews seed completed.');
}

seedReviewsTable()
    .catch((error) => {
      console.error('Reviews seed failed:', error);
      process.exitCode = 1;
    })
    .finally(() => pool.end());