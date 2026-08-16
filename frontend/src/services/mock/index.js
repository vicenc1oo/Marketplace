// Mock service implementations: API-shaped responses with a small delay.
// State is mutated in-memory so actions feel live; a refresh resets to seed data.
import * as db from './db.js';

const clone = (value) => (typeof structuredClone === 'function'
  ? structuredClone(value)
  : JSON.parse(JSON.stringify(value)));

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

const findUser = (id) => db.users.find((u) => u.id === id);
const publicUser = (id) => {
  const u = findUser(id);
  return u ? clone(u) : null;
};

/** Attach the resolved seller object so cards/details don't need a second call. */
const withSeller = (listing) => ({ ...clone(listing), seller: publicUser(listing.sellerId) });

/* ----------------------------------- auth ---------------------------------- */
export async function login({ email }) {
  await delay();
  const user = db.users.find((u) => u.email === email) || findUser(db.CURRENT_USER_ID);
  return { token: `mock.${user.id}.token`, user: clone(user) };
}

export async function register({ name, email }) {
  await delay();
  const user = { ...clone(findUser(db.CURRENT_USER_ID)), name: name || 'You', email };
  return { token: `mock.${user.id}.token`, user };
}

export async function me() {
  await delay(150);
  return clone(findUser(db.CURRENT_USER_ID));
}

export async function forgotPassword() {
  await delay();
  return { ok: true };
}

/* ----------------------------------- users --------------------------------- */
export async function getUser(id) {
  await delay();
  const user = publicUser(id);
  if (!user) throw new Error('User not found');
  return user;
}

export async function updateProfile(patch) {
  await delay();
  const me = findUser(db.CURRENT_USER_ID);
  Object.assign(me, patch);
  return clone(me);
}

export async function getUserListings(userId) {
  await delay();
  return db.listings.filter((l) => l.sellerId === userId).map(withSeller);
}

export async function getReviews(userId) {
  await delay();
  // Lightweight derived reviews so a profile never looks empty.
  return db.users
    .filter((u) => u.id !== userId)
    .slice(0, 2)
    .map((author, i) => ({
      id: `r_${userId}_${i}`,
      authorId: author.id,
      author: clone(author),
      rating: 5 - i,
      text: i === 0 ? 'Smooth transaction, item exactly as described.' : 'Friendly and quick to reply. Would buy again.',
      createdAt: new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString(),
    }));
}

/* --------------------------------- listings -------------------------------- */
export async function getCategories() {
  await delay(120);
  return clone(db.categories);
}

export async function listListings(params = {}) {
  await delay();
  const { category, location, minPrice, maxPrice, condition, type, q, sort = 'recent', page = 1, limit = 12 } = params;
  let items = db.listings.filter((l) => l.status === 'active');

  if (category) items = items.filter((l) => l.category === category);
  if (location) items = items.filter((l) => l.location.toLowerCase() === String(location).toLowerCase());
  if (condition) items = items.filter((l) => l.condition === condition);
  if (type) items = items.filter((l) => l.type === type);
  if (minPrice != null && minPrice !== '') items = items.filter((l) => (l.currentBid ?? l.price) >= Number(minPrice));
  if (maxPrice != null && maxPrice !== '') items = items.filter((l) => (l.currentBid ?? l.price) <= Number(maxPrice));
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(
      (l) => l.title.toLowerCase().includes(needle) || l.description.toLowerCase().includes(needle),
    );
  }

  items.sort((a, b) => {
    const pa = a.currentBid ?? a.price;
    const pb = b.currentBid ?? b.price;
    switch (sort) {
      case 'price_asc': return pa - pb;
      case 'price_desc': return pb - pa;
      case 'popular': return b.favoritesCount - a.favoritesCount;
      default: return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit).map(withSeller);
  return { items: paged, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getListing(id) {
  await delay();
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) throw new Error('Listing not found');
  return withSeller(listing);
}

export async function getFeatured() {
  await delay();
  return [...db.listings]
    .filter((l) => l.status === 'active')
    .sort((a, b) => b.favoritesCount - a.favoritesCount)
    .slice(0, 4)
    .map(withSeller);
}

export async function getRecent() {
  await delay();
  return [...db.listings]
    .filter((l) => l.status === 'active')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
    .map(withSeller);
}

export async function createListing(data) {
  await delay(500);
  const listing = {
    id: uid('l'),
    sellerId: db.CURRENT_USER_ID,
    status: 'active',
    favoritesCount: 0,
    viewsCount: 0,
    currency: 'EUR',
    createdAt: new Date().toISOString(),
    images: data.images?.length ? data.images : [],
    ...data,
  };
  db.listings.unshift(listing);
  return withSeller(listing);
}

export async function updateListing(id, patch) {
  await delay(400);
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) throw new Error('Listing not found');
  Object.assign(listing, patch);
  return withSeller(listing);
}

export async function deleteListing(id) {
  await delay();
  const i = db.listings.findIndex((l) => l.id === id);
  if (i !== -1) db.listings.splice(i, 1);
  return { ok: true };
}

const favorites = new Set();
export async function toggleFavorite(id) {
  await delay(150);
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) throw new Error('Listing not found');
  const saved = favorites.has(id);
  if (saved) {
    favorites.delete(id);
    listing.favoritesCount = Math.max(0, listing.favoritesCount - 1);
  } else {
    favorites.add(id);
    listing.favoritesCount += 1;
  }
  return { saved: !saved, favoritesCount: listing.favoritesCount };
}
export async function getFavorites() {
  await delay();
  return db.listings.filter((l) => favorites.has(l.id)).map(withSeller);
}

/* ---------------------------------- upload --------------------------------- */
export async function uploadImage(file) {
  await delay(400);
  // In mock mode we just turn the file into a local object URL for preview.
  return { url: URL.createObjectURL(file), name: file.name };
}

/* ----------------------------------- chat ---------------------------------- */
export async function getConversations() {
  await delay();
  return db.conversations.map((c) => {
    const last = c.messages[c.messages.length - 1];
    const otherId = c.participantIds.find((id) => id !== db.CURRENT_USER_ID);
    return {
      id: c.id,
      listing: c.listingId ? withSeller(db.listings.find((l) => l.id === c.listingId)) : null,
      other: publicUser(otherId),
      lastMessage: last ? clone(last) : null,
      unread: c.messages.filter((m) => m.senderId !== db.CURRENT_USER_ID && !m.read).length,
    };
  });
}

export async function getConversation(id) {
  await delay();
  const c = db.conversations.find((x) => x.id === id);
  if (!c) throw new Error('Conversation not found');
  const otherId = c.participantIds.find((pid) => pid !== db.CURRENT_USER_ID);
  c.messages.forEach((m) => { if (m.senderId !== db.CURRENT_USER_ID) m.read = true; });
  return {
    id: c.id,
    listing: c.listingId ? withSeller(db.listings.find((l) => l.id === c.listingId)) : null,
    other: publicUser(otherId),
    messages: clone(c.messages),
  };
}

export async function sendMessage(conversationId, text) {
  await delay(120);
  const c = db.conversations.find((x) => x.id === conversationId);
  if (!c) throw new Error('Conversation not found');
  const message = { id: uid('m'), senderId: db.CURRENT_USER_ID, text, createdAt: new Date().toISOString(), read: true };
  c.messages.push(message);
  return clone(message);
}

/* ---------------------------------- bidding -------------------------------- */
export async function getActiveAuctions() {
  await delay();
  return db.listings
    .filter((l) => l.type === 'auction' && l.status === 'active')
    .map(withSeller);
}

export async function getBids(listingId) {
  await delay();
  return db.bids
    .filter((b) => b.listingId === listingId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((b) => ({ ...clone(b), bidder: publicUser(b.bidderId) }));
}

export async function placeBid(listingId, amount) {
  await delay(300);
  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing || listing.type !== 'auction') throw new Error('Auction not found');
  const min = (listing.currentBid ?? listing.startingBid) + 1;
  if (Number(amount) < min) {
    const err = new Error(`Your bid must be at least €${min}.`);
    err.status = 400;
    throw err;
  }
  const bid = { id: uid('b'), listingId, bidderId: db.CURRENT_USER_ID, amount: Number(amount), createdAt: new Date().toISOString() };
  db.bids.push(bid);
  listing.currentBid = Number(amount);
  listing.bidsCount = (listing.bidsCount ?? 0) + 1;
  return { ...clone(bid), bidder: publicUser(bid.bidderId) };
}

export async function getMyBids() {
  await delay();
  const mine = db.bids.filter((b) => b.bidderId === db.CURRENT_USER_ID);
  const byListing = {};
  for (const b of mine) {
    if (!byListing[b.listingId] || b.amount > byListing[b.listingId].amount) byListing[b.listingId] = b;
  }
  return Object.values(byListing).map((b) => {
    const listing = withSeller(db.listings.find((l) => l.id === b.listingId));
    const winning = (listing.currentBid ?? 0) === b.amount;
    return { ...clone(b), listing, winning };
  });
}

/* --------------------------------- currency -------------------------------- */
export async function getWallet() {
  await delay();
  return clone(db.wallet);
}

/* -------------------------------- promotions ------------------------------- */
export async function getPromotionPackages() {
  await delay(150);
  return clone(db.promotionPackages);
}

export async function promoteListing(listingId, packageId) {
  await delay(400);
  const pkg = db.promotionPackages.find((p) => p.id === packageId);
  if (!pkg) throw new Error('Package not found');
  if (db.wallet.balance < pkg.credits) {
    const err = new Error('Not enough credits.');
    err.status = 400;
    throw err;
  }
  db.wallet.balance -= pkg.credits;
  db.wallet.transactions.unshift({
    id: uid('t'),
    type: 'debit',
    amount: pkg.credits,
    description: `${pkg.name}`,
    createdAt: new Date().toISOString(),
  });
  return { ok: true, balance: db.wallet.balance };
}

/* ------------------------------ notifications ------------------------------ */
export async function getNotifications() {
  await delay(200);
  return clone(db.notifications);
}

export async function markNotificationRead(id) {
  await delay(80);
  const n = db.notifications.find((x) => x.id === id);
  if (n) n.read = true;
  return { ok: true };
}

export async function markAllNotificationsRead() {
  await delay(120);
  db.notifications.forEach((n) => { n.read = true; });
  return { ok: true };
}

/* --------------------------------- analytics ------------------------------- */
export async function getDashboardStats() {
  await delay();
  const mine = db.listings.filter((l) => l.sellerId === db.CURRENT_USER_ID);
  return {
    activeListings: mine.filter((l) => l.status === 'active').length,
    soldItems: mine.filter((l) => l.status === 'sold').length,
    activeBids: db.bids.filter((b) => b.bidderId === db.CURRENT_USER_ID).length,
    unreadMessages: db.conversations.reduce(
      (sum, c) => sum + c.messages.filter((m) => m.senderId !== db.CURRENT_USER_ID && !m.read).length,
      0,
    ),
    savedListings: favorites.size,
    totalViews: mine.reduce((sum, l) => sum + l.viewsCount, 0),
  };
}
