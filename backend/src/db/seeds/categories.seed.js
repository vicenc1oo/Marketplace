const { query, pool } = require('../../config/db');

// Categories for listings.

const categories = [
    { id: 'electronics', name: 'Electronics', icon: 'device' },
    { id: 'home', name: 'Home & Garden', icon: 'home' },
    { id: 'fashion', name: 'Fashion', icon: 'tag' },
    { id: 'bikes', name: 'Bikes', icon: 'bike' },
    { id: 'books', name: 'Books & Media', icon: 'book' },
    { id: 'furniture', name: 'Furniture', icon: 'sofa' },
    { id: 'sports', name: 'Sports', icon: 'ball' },
    { id: 'kids', name: 'Kids', icon: 'toy' },
];

async function seedCategoriesTable() {
    for (const category of categories) {
        await query(
            `
			INSERT INTO categories (id, name, icon)
			VALUES ($1, $2, $3)
			ON CONFLICT (id) DO UPDATE SET
			  name = EXCLUDED.name,
			  icon = EXCLUDED.icon
			`,
            [category.id, category.name, category.icon],
        );
    }

    console.log('Categories seed completed.');
}

seedCategoriesTable()
    .catch((error) => {
        console.error('Categories seed failed:', error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());