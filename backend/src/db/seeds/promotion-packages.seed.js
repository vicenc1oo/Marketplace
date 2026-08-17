const { query, pool } = require('../../config/db');

const promotionPackages = [
    {
        id: 'p_bump',
        name: 'Bump to top',
        credits: 30,
        durationDays: 1,
        description: 'Move your listing back to the top of search results for a day.',
    },
    {
        id: 'p_spotlight',
        name: 'Spotlight (3 days)',
        credits: 60,
        durationDays: 3,
        description: 'Highlighted card and a spot in the featured row for three days.',
    },
    {
        id: 'p_featured',
        name: 'Featured (7 days)',
        credits: 120,
        durationDays: 7,
        description: 'Top placement plus a featured badge for a full week.',
    },
];

async function seedPromotionPackagesTable() {
    for (const promotionPackage of promotionPackages) {
        await query(
            `
			INSERT INTO promotion_packages (id, name, credits, duration_days, description)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id) DO UPDATE SET
			  name = EXCLUDED.name,
			  credits = EXCLUDED.credits,
			  duration_days = EXCLUDED.duration_days,
			  description = EXCLUDED.description
			`,
            [
                promotionPackage.id,
                promotionPackage.name,
                promotionPackage.credits,
                promotionPackage.durationDays,
                promotionPackage.description,
            ],
        );
    }

    console.log('Promotion packages seed completed.');
}

seedPromotionPackagesTable()
    .catch((error) => {
        console.error('Promotion packages seed failed:', error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());