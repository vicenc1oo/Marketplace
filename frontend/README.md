# Marketplace — Frontend

React + Vite frontend for the marketplace (buy/sell, chat,
auctions, and credit-based promotions).


## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` builds for production, `npm run preview` serves the build.

## Mock mode

The backend is built by teammates. Until it's ready, the app runs on an in-memory
mock layer (`src/services/mock/`), which is **on by default**. Any email/password
logs you in. Set `VITE_USE_MOCKS=false` (see `.env.example`) to use the real API.

## Structure

- `components/` — reusable UI
- `context/` — Theme, Auth, Socket, Currency, Toast
- `hooks/` — useAuth, useListings, useTheme, …
- `pages/` — one folder per route
- `services/` — API client + one service per domain (+ `mock/`)
- `styles/` — design tokens + global styles
- `utils/` — formatters, validators, helpers

All network calls go through `src/services/`; components never call `fetch`
directly. Each service's header comment lists the backend endpoints it expects.

## Connecting the backend

The frontend is wired to talk to a real backend — just flip it off mock mode and
point it at your servers. Three steps:

1. **Set the env vars** in `frontend/.env` (copy from `.env.example`):

   ```bash
   VITE_API_URL=https://<host>/api   # REST base URL
   VITE_WS_URL=https://<host>        # socket.io server
   VITE_USE_MOCKS=false              # turn the mock layer OFF
   ```

2. **Match the REST endpoints.** With mocks off, each service in `src/services/`
   calls the real API. The exact routes, methods, and payloads it expects are
   documented in the header comment of every `*.service.js` file. What needs a
   backend, per service:

   - `auth` — register / login (returns `{ token, user }`), current user, password reset
   - `user` — profile read/update, a user's listings and reviews
   - `listing` — browse/filter, CRUD, favourites, categories, featured/recent
   - `upload` — image upload (multipart) returning a hosted URL
   - `chat` — conversations and messages
   - `bidding` — auctions, bids, "my bids"
   - `currency` / `promotion` — credit wallet and listing boosts
   - `notification` / `analytics` — notifications and dashboard counts

   Auth: the API client sends `Authorization: Bearer <token>` automatically and
   expects JSON, with errors as `{ message }` (or `{ error }`).

3. **Wire the real-time (socket.io)** at `VITE_WS_URL`. The client connects with
   `{ auth: { token } }` and listens for these events (see `SocketContext` /
   `useNotifications` / `Chat`): `message`, `typing`, `notification`.

### Still stubbed (need a backend endpoint)

- **"Contact seller"** on a listing currently just shows a toast — it needs a
  create/lookup-conversation endpoint before it can send a real first message.
- **Real-time** chat/bid/notification pushes only fire once the socket server is
  live; the subscriptions are already in place.
