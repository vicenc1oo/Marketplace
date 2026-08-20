// Mock dataset: the only place sample data lives (services delegate here in mock mode).
// Quarantined so it's easy to delete once the real API is wired up.
import { placeholderImage, placeholderAvatar } from '../../utils/placeholder.js';

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursFromNow = (n) => new Date(Date.now() + n * 3600000).toISOString();

export const users = [
  {
    id: 'u1',
    name: 'You',
    username: 'you',
    email: 'you@example.com',
    avatarUrl: placeholderAvatar('You'),
    bio: 'Selling things I no longer need. Fast replies and easy collection in Lisbon.',
    location: 'Lisbon',
    rating: 4.9,
    reviewsCount: 31,
    online: true,
    memberSince: '2025-11-14',
  },
  {
    id: 'u2',
    name: 'João Martins',
    username: 'joaom',
    email: 'joao@example.com',
    avatarUrl: placeholderAvatar('Joao Martins'),
    bio: 'Tech enthusiast and occasional seller. Everything is tested before listing.',
    location: 'Lisbon',
    rating: 4.8,
    reviewsCount: 42,
    online: false,
    memberSince: '2024-03-21',
  },
  {
    id: 'u3',
    name: 'Inês Costa',
    username: 'inesc',
    email: 'ines@example.com',
    avatarUrl: placeholderAvatar('Ines Costa'),
    bio: 'Decluttering my home and selling clothes, furniture and sports gear.',
    location: 'Cascais',
    rating: 4.7,
    reviewsCount: 18,
    online: true,
    memberSince: '2025-01-08',
  },
];

const make = (id, sellerId, title, price, category, condition, location, daysOld, extra = {}) => ({
  id,
  title,
  description:
      extra.description ||
      `${title}. Used but in ${condition.replace('_', ' ')} condition. Collection preferred, can post at buyer's cost. Message me if you have any questions.`,
  price,
  currency: 'EUR',
  category,
  condition,
  location,
  sellerId,
  images: [
    placeholderImage(id + 'a', title),
    placeholderImage(id + 'b', category),
    placeholderImage(id + 'c', condition),
  ],
  type: extra.type || 'fixed',
  status: extra.status || 'active',
  favoritesCount: extra.favoritesCount ?? 0,
  viewsCount: extra.viewsCount ?? 0,
  createdAt: daysAgo(daysOld),
  ...(extra.type === 'auction'
      ? {
        endsAt: extra.endsAt,
        startingBid: extra.startingBid,
        currentBid: extra.currentBid,
        bidsCount: extra.bidsCount ?? 0,
      }
      : {}),
});

export const listings = [
  make('l1', 'u2', 'Sony WH-1000XM5 Wireless Headphones', 230, 'electronics', 'like_new', 'Lisbon', 1, {
    favoritesCount: 18,
    viewsCount: 245,
    description:
        'Sony WH-1000XM5 wireless noise-cancelling headphones in excellent condition. Includes original case, charging cable and box. Barely used.',
  }),
  make('l2', 'u3', 'Nike Air Max 270, Size 39', 70, 'fashion', 'good', 'Cascais', 2, {
    favoritesCount: 12,
    viewsCount: 168,
  }),
  make('l3', 'u2', 'MacBook Air M2, 8GB RAM, 256GB', 720, 'electronics', 'like_new', 'Lisbon', 3, {
    favoritesCount: 35,
    viewsCount: 620,
    description:
        'MacBook Air with M2 chip, 8GB RAM and 256GB SSD. Battery health is excellent. Includes original charger and protective sleeve.',
  }),
  make('l4', 'u3', 'Mountain Bike 29”', 340, 'bikes', 'good', 'Cascais', 1, {
    type: 'auction',
    startingBid: 220,
    currentBid: 285,
    bidsCount: 7,
    endsAt: hoursFromNow(30),
    favoritesCount: 21,
    viewsCount: 390,
  }),
  make('l5', 'u2', 'IKEA MALM 6-Drawer Chest', 85, 'furniture', 'good', 'Lisbon', 4, {
    favoritesCount: 8,
    viewsCount: 124,
  }),
  make('l6', 'u3', 'Decathlon 2-Person Hiking Tent', 45, 'sports', 'like_new', 'Cascais', 5, {
    favoritesCount: 6,
    viewsCount: 91,
  }),
  make('l7', 'u2', 'Nintendo Switch + 3 Games', 210, 'electronics', 'good', 'Lisbon', 3, {
    favoritesCount: 26,
    viewsCount: 330,
    description:
        'Nintendo Switch in good condition with dock, Joy-Cons, charger and three games. Everything works correctly and has been tested.',
  }),
  make('l8', 'u3', 'DeLonghi Dedica Espresso Machine', 110, 'home', 'good', 'Cascais', 2, {
    type: 'auction',
    startingBid: 65,
    currentBid: 88,
    bidsCount: 5,
    endsAt: hoursFromNow(18),
    favoritesCount: 15,
    viewsCount: 275,
  }),
  make('l9', 'u2', 'Harry Potter Book Collection', 50, 'books', 'good', 'Lisbon', 7, {
    favoritesCount: 9,
    viewsCount: 103,
  }),
  make('l10', 'u3', 'Standing Desk with Wooden Top', 180, 'furniture', 'like_new', 'Cascais', 1, {
    favoritesCount: 24,
    viewsCount: 360,
  }),
  make('l11', 'u1', 'Samsung 32” 4K Smart Monitor', 190, 'electronics', 'like_new', 'Lisbon', 6, {
    status: 'active',
    favoritesCount: 16,
    viewsCount: 225,
    description:
        'Samsung 32-inch 4K monitor with excellent image quality. Perfect for work, gaming or media. Includes original stand and power cable.',
  }),
  make('l12', 'u1', 'Fender Acoustic Guitar', 150, 'home', 'good', 'Lisbon', 9, {
    type: 'auction',
    startingBid: 90,
    currentBid: 125,
    bidsCount: 6,
    endsAt: hoursFromNow(42),
    favoritesCount: 19,
    viewsCount: 240,
  }),
  make('l13', 'u1', 'Modern Wooden Bookshelf', 55, 'furniture', 'good', 'Lisbon', 20, {
    status: 'sold',
    favoritesCount: 7,
    viewsCount: 145,
  }),
  make('l14', 'u2', 'Adidas Running Shoes, Size 42', 55, 'fashion', 'like_new', 'Lisbon', 2, {
    favoritesCount: 11,
    viewsCount: 140,
  }),
  make('l15', 'u3', 'LEGO Technic Car Set', 65, 'kids', 'like_new', 'Cascais', 4, {
    favoritesCount: 14,
    viewsCount: 190,
  }),
  make('l16', 'u2', 'Bose Portable Bluetooth Speaker', 95, 'electronics', 'good', 'Lisbon', 8, {
    favoritesCount: 17,
    viewsCount: 205,
  }),
];

export const bids = [
  { id: 'b1', listingId: 'l4', bidderId: 'u1', amount: 235, createdAt: daysAgo(0.5) },
  { id: 'b2', listingId: 'l4', bidderId: 'u2', amount: 260, createdAt: daysAgo(0.4) },
  { id: 'b3', listingId: 'l4', bidderId: 'u1', amount: 285, createdAt: daysAgo(0.2) },
  { id: 'b4', listingId: 'l8', bidderId: 'u1', amount: 75, createdAt: daysAgo(0.4) },
  { id: 'b5', listingId: 'l8', bidderId: 'u2', amount: 88, createdAt: daysAgo(0.1) },
  { id: 'b6', listingId: 'l12', bidderId: 'u3', amount: 105, createdAt: daysAgo(0.7) },
  { id: 'b7', listingId: 'l12', bidderId: 'u2', amount: 125, createdAt: daysAgo(0.2) },
];

export const conversations = [
  {
    id: 'c1',
    participantIds: ['u1', 'u2'],
    listingId: 'l3',
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hi! Is the MacBook still available?', createdAt: daysAgo(0.8), read: true },
      { id: 'm2', senderId: 'u2', text: 'Yes, it is. It is in very good condition.', createdAt: daysAgo(0.7), read: true },
      { id: 'm3', senderId: 'u1', text: 'Would you accept 680€?', createdAt: daysAgo(0.2), read: false },
    ],
  },
  {
    id: 'c2',
    participantIds: ['u1', 'u3'],
    listingId: 'l2',
    messages: [
      { id: 'm4', senderId: 'u3', text: 'Are the Nike shoes still available?', createdAt: daysAgo(1.5), read: true },
      { id: 'm5', senderId: 'u1', text: 'Yes, they are available.', createdAt: daysAgo(1.4), read: true },
      { id: 'm6', senderId: 'u3', text: 'Could I pick them up tomorrow?', createdAt: daysAgo(1.1), read: true },
    ],
  },
  {
    id: 'c3',
    participantIds: ['u1', 'u2'],
    listingId: 'l7',
    messages: [
      { id: 'm7', senderId: 'u2', text: 'Would you consider selling the Switch without the games?', createdAt: daysAgo(2), read: true },
      { id: 'm8', senderId: 'u1', text: 'Yes, I could do 170€ without the games.', createdAt: daysAgo(1.8), read: true },
    ],
  },
];

export const notifications = [
  { id: 'n1', type: 'bid', text: 'You were outbid on “Mountain Bike 29””.', read: false, createdAt: daysAgo(0.05), link: '/marketplace/l4' },
  { id: 'n2', type: 'message', text: 'New message from João Martins.', read: false, createdAt: daysAgo(0.2), link: '/chat/c1' },
  { id: 'n3', type: 'favorite', text: 'Someone saved your “Samsung 32” 4K Smart Monitor”.', read: true, createdAt: daysAgo(1), link: '/marketplace/l11' },
  { id: 'n4', type: 'system', text: 'Your listing “Modern Wooden Bookshelf” was marked as sold.', read: true, createdAt: daysAgo(2), link: '/dashboard' },
];

export const wallet = {
  balance: 450,
  transactions: [
    { id: 't1', type: 'credit', amount: 600, description: 'Welcome bonus', createdAt: daysAgo(45) },
    { id: 't2', type: 'debit', amount: 90, description: 'Boosted “Samsung 32” 4K Smart Monitor”', createdAt: daysAgo(7) },
    { id: 't3', type: 'debit', amount: 60, description: 'Spotlight “Fender Acoustic Guitar”', createdAt: daysAgo(3) },
  ],
};

export const promotionPackages = [
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

/** The signed-in user for the mock session. */
export const CURRENT_USER_ID = 'u1';