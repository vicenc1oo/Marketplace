const { query, pool } = require('../../config/db');

const listings = [
    {
        id: 'l1',
        sellerId: 'u1',
        title: 'Standing desk',
        description: 'Adjustable standing desk in good condition.',
        price: 180,
        categoryId: 'furniture',
        condition: 'good',
        location: 'Lisbon',
    },
    {
        id: 'l2',
        sellerId: 'u2',
        title: 'Road bike',
        description: 'Light road bike, recently serviced.',
        price: 250,
        categoryId: 'bikes',
        condition: 'good',
        location: 'Porto',
        type: 'auction',
        startingBid: 250,
        endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
    {
        id: 'l3',
        sellerId: 'u3',
        title: '4K monitor',
        description: '27 inch 4K monitor with HDMI and USB-C.',
        price: 230,
        categoryId: 'electronics',
        condition: 'like_new',
        location: 'Lisbon',
    },
];

async function seedListingsTable() {
    for (const listing of listings) {
        await query(
            `
                INSERT INTO listings (
                    id,
                    seller_id,
                    title,
                    description,
                    price,
                    category_id,
                    condition,
                    location,
                    type,
                    starting_bid,
                    current_bid,
                    bids_count,
                    ends_at,
                    status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, 0, $11, 'active')
                    ON CONFLICT (id) DO UPDATE SET
                    seller_id = EXCLUDED.seller_id,
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    price = EXCLUDED.price,
                    category_id = EXCLUDED.category_id,
                    condition = EXCLUDED.condition,
                    location = EXCLUDED.location,
                    type = EXCLUDED.type,
                    starting_bid = EXCLUDED.starting_bid,
                    current_bid = EXCLUDED.current_bid,
                    bids_count = EXCLUDED.bids_count,
                   ends_at = EXCLUDED.ends_at,
                   status = EXCLUDED.status,
                   updated_at = NOW()
            `,
            [
                listing.id,
                listing.sellerId,
                listing.title,
                listing.description,
                listing.price,
                listing.categoryId,
                listing.condition,
                listing.location,
                listing.type || 'fixed',
                listing.startingBid || null,
                listing.endsAt || null,
            ],
        );

        await query(
            `
            INSERT INTO listing_images (id, listing_id, image_url, position)
            VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO UPDATE SET
                image_url = EXCLUDED.image_url,
                position = EXCLUDED.position
            `,
            [
                `${listing.id}_image_1`,
                listing.id,
                `https://picsum.photos/seed/${listing.id}/800/600`,
                0,
            ],
        );
    }

    console.log('Listings seed completed.');
}

seedListingsTable()
    .catch((error) => {
        console.error('Listings seed failed:', error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());