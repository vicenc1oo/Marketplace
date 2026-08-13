#!/usr/bin/env bash

set -e

echo "Creating ft_marketplace project structure..."

create_file_if_missing() {
  local file="$1"

  if [ ! -f "$file" ]; then
    mkdir -p "$(dirname "$file")"
    touch "$file"
    echo "Created file: $file"
  else
    echo "Skipped existing file: $file"
  fi
}

append_gitignore_once() {
  local line="$1"

  if ! grep -qxF "$line" .gitignore 2>/dev/null; then
    echo "$line" >> .gitignore
  fi
}

# Root files
create_file_if_missing "docker-compose.yml"
create_file_if_missing ".env"
create_file_if_missing ".env.example"
create_file_if_missing ".gitignore"
create_file_if_missing "README.md"

# Frontend folders
mkdir -p frontend/public

mkdir -p frontend/src/assets/images
mkdir -p frontend/src/assets/icons
mkdir -p frontend/src/assets/fonts

mkdir -p frontend/src/components/Button
mkdir -p frontend/src/components/Modal
mkdir -p frontend/src/components/Navbar
mkdir -p frontend/src/components/ListingCard
mkdir -p frontend/src/components/SearchBar
mkdir -p frontend/src/components/Avatar
mkdir -p frontend/src/components/NotificationBell

mkdir -p frontend/src/hooks
mkdir -p frontend/src/context
mkdir -p frontend/src/services

mkdir -p frontend/src/pages/Home
mkdir -p frontend/src/pages/Auth
mkdir -p frontend/src/pages/Profile
mkdir -p frontend/src/pages/Marketplace
mkdir -p frontend/src/pages/ListingDetails
mkdir -p frontend/src/pages/CreateListing
mkdir -p frontend/src/pages/Chat
mkdir -p frontend/src/pages/Bidding
mkdir -p frontend/src/pages/Wallet
mkdir -p frontend/src/pages/Promotions
mkdir -p frontend/src/pages/Dashboard
mkdir -p frontend/src/pages/PrivacyPolicy
mkdir -p frontend/src/pages/TermsOfService

mkdir -p frontend/src/utils

# Frontend files
create_file_if_missing "frontend/Dockerfile"
create_file_if_missing "frontend/package.json"
create_file_if_missing "frontend/src/main.jsx"
create_file_if_missing "frontend/src/App.jsx"

create_file_if_missing "frontend/src/hooks/useAuth.js"
create_file_if_missing "frontend/src/hooks/useSocket.js"
create_file_if_missing "frontend/src/hooks/useNotifications.js"

create_file_if_missing "frontend/src/context/AuthContext.jsx"
create_file_if_missing "frontend/src/context/SocketContext.jsx"
create_file_if_missing "frontend/src/context/CurrencyContext.jsx"

create_file_if_missing "frontend/src/services/api.js"
create_file_if_missing "frontend/src/services/auth.service.js"
create_file_if_missing "frontend/src/services/user.service.js"
create_file_if_missing "frontend/src/services/listing.service.js"
create_file_if_missing "frontend/src/services/upload.service.js"
create_file_if_missing "frontend/src/services/chat.service.js"
create_file_if_missing "frontend/src/services/bidding.service.js"
create_file_if_missing "frontend/src/services/currency.service.js"
create_file_if_missing "frontend/src/services/promotion.service.js"
create_file_if_missing "frontend/src/services/notification.service.js"
create_file_if_missing "frontend/src/services/analytics.service.js"

create_file_if_missing "frontend/src/utils/formatDate.js"
create_file_if_missing "frontend/src/utils/formatPrice.js"
create_file_if_missing "frontend/src/utils/validators.js"

# Backend folders
mkdir -p backend/data
mkdir -p backend/uploads/avatars
mkdir -p backend/uploads/listings

mkdir -p backend/src/config
mkdir -p backend/src/db/migrations
mkdir -p backend/src/db/seeds
mkdir -p backend/src/middleware
mkdir -p backend/src/utils

mkdir -p backend/src/features/auth
mkdir -p backend/src/features/user
mkdir -p backend/src/features/listings
mkdir -p backend/src/features/upload
mkdir -p backend/src/features/chat
mkdir -p backend/src/features/currency
mkdir -p backend/src/features/bidding
mkdir -p backend/src/features/promotions
mkdir -p backend/src/features/search
mkdir -p backend/src/features/notifications
mkdir -p backend/src/features/ai-agent
mkdir -p backend/src/features/analytics

# Backend root files
create_file_if_missing "backend/Dockerfile"
create_file_if_missing "backend/package.json"
create_file_if_missing "backend/.env"

# Gitkeep files for empty folders
create_file_if_missing "backend/data/.gitkeep"
create_file_if_missing "backend/uploads/avatars/.gitkeep"
create_file_if_missing "backend/uploads/listings/.gitkeep"

# Backend main files
create_file_if_missing "backend/src/index.js"
create_file_if_missing "backend/src/app.js"
create_file_if_missing "backend/src/socket.js"

# Backend config files
create_file_if_missing "backend/src/config/db.js"
create_file_if_missing "backend/src/config/env.js"
create_file_if_missing "backend/src/config/socket.js"

# Database migrations
create_file_if_missing "backend/src/db/migrations/001_users.sql"
create_file_if_missing "backend/src/db/migrations/002_auth.sql"
create_file_if_missing "backend/src/db/migrations/003_listings.sql"
create_file_if_missing "backend/src/db/migrations/004_listing_images.sql"
create_file_if_missing "backend/src/db/migrations/005_chat.sql"
create_file_if_missing "backend/src/db/migrations/006_currency.sql"
create_file_if_missing "backend/src/db/migrations/007_bidding.sql"
create_file_if_missing "backend/src/db/migrations/008_promotions.sql"
create_file_if_missing "backend/src/db/migrations/009_notifications.sql"
create_file_if_missing "backend/src/db/migrations/010_analytics.sql"

# Database seeds
create_file_if_missing "backend/src/db/seeds/users.seed.js"
create_file_if_missing "backend/src/db/seeds/listings.seed.js"
create_file_if_missing "backend/src/db/seeds/categories.seed.js"

# Middleware
create_file_if_missing "backend/src/middleware/auth.middleware.js"
create_file_if_missing "backend/src/middleware/twofa.middleware.js"
create_file_if_missing "backend/src/middleware/rateLimit.middleware.js"
create_file_if_missing "backend/src/middleware/errorHandler.js"
create_file_if_missing "backend/src/middleware/logger.js"

# Auth feature
create_file_if_missing "backend/src/features/auth/auth.routes.js"
create_file_if_missing "backend/src/features/auth/auth.controller.js"
create_file_if_missing "backend/src/features/auth/auth.service.js"
create_file_if_missing "backend/src/features/auth/twofa.service.js"

# User feature
create_file_if_missing "backend/src/features/user/user.routes.js"
create_file_if_missing "backend/src/features/user/user.controller.js"
create_file_if_missing "backend/src/features/user/user.service.js"
create_file_if_missing "backend/src/features/user/user.model.js"

# Listings feature
create_file_if_missing "backend/src/features/listings/listing.routes.js"
create_file_if_missing "backend/src/features/listings/listing.controller.js"
create_file_if_missing "backend/src/features/listings/listing.service.js"
create_file_if_missing "backend/src/features/listings/listing.model.js"

# Upload feature
create_file_if_missing "backend/src/features/upload/upload.routes.js"
create_file_if_missing "backend/src/features/upload/upload.controller.js"
create_file_if_missing "backend/src/features/upload/upload.service.js"

# Chat feature
create_file_if_missing "backend/src/features/chat/chat.routes.js"
create_file_if_missing "backend/src/features/chat/chat.controller.js"
create_file_if_missing "backend/src/features/chat/chat.service.js"
create_file_if_missing "backend/src/features/chat/chat.socket.js"

# Currency feature
create_file_if_missing "backend/src/features/currency/currency.routes.js"
create_file_if_missing "backend/src/features/currency/currency.controller.js"
create_file_if_missing "backend/src/features/currency/currency.service.js"
create_file_if_missing "backend/src/features/currency/wallet.model.js"

# Bidding feature
create_file_if_missing "backend/src/features/bidding/bidding.routes.js"
create_file_if_missing "backend/src/features/bidding/bidding.controller.js"
create_file_if_missing "backend/src/features/bidding/bidding.service.js"
create_file_if_missing "backend/src/features/bidding/counteroffer.service.js"
create_file_if_missing "backend/src/features/bidding/bidding.socket.js"

# Promotions feature
create_file_if_missing "backend/src/features/promotions/promotion.routes.js"
create_file_if_missing "backend/src/features/promotions/promotion.controller.js"
create_file_if_missing "backend/src/features/promotions/promotion.service.js"

# Search feature
create_file_if_missing "backend/src/features/search/search.routes.js"
create_file_if_missing "backend/src/features/search/search.controller.js"
create_file_if_missing "backend/src/features/search/search.service.js"

# Notifications feature
create_file_if_missing "backend/src/features/notifications/notification.routes.js"
create_file_if_missing "backend/src/features/notifications/notification.controller.js"
create_file_if_missing "backend/src/features/notifications/notification.service.js"
create_file_if_missing "backend/src/features/notifications/notification.socket.js"

# AI Agent feature
create_file_if_missing "backend/src/features/ai-agent/agent.routes.js"
create_file_if_missing "backend/src/features/ai-agent/agent.controller.js"
create_file_if_missing "backend/src/features/ai-agent/agent.service.js"

# Analytics feature
create_file_if_missing "backend/src/features/analytics/analytics.routes.js"
create_file_if_missing "backend/src/features/analytics/analytics.controller.js"
create_file_if_missing "backend/src/features/analytics/analytics.service.js"

# Utils
create_file_if_missing "backend/src/utils/jwt.utils.js"
create_file_if_missing "backend/src/utils/response.utils.js"
create_file_if_missing "backend/src/utils/hash.utils.js"
create_file_if_missing "backend/src/utils/file.utils.js"
create_file_if_missing "backend/src/utils/constants.js"

# Gitignore rules
append_gitignore_once ""
append_gitignore_once "# Dependencies"
append_gitignore_once "node_modules/"

append_gitignore_once ""
append_gitignore_once "# Environment files"
append_gitignore_once ".env"
append_gitignore_once "backend/.env"
append_gitignore_once "frontend/.env"

append_gitignore_once ""
append_gitignore_once "# Frontend build"
append_gitignore_once "frontend/dist/"

append_gitignore_once ""
append_gitignore_once "# SQLite database"
append_gitignore_once "backend/data/*"
append_gitignore_once "!backend/data/.gitkeep"

append_gitignore_once ""
append_gitignore_once "# Uploaded files"
append_gitignore_once "backend/uploads/*"
append_gitignore_once "!backend/uploads/avatars/"
append_gitignore_once "!backend/uploads/listings/"
append_gitignore_once "!backend/uploads/avatars/.gitkeep"
append_gitignore_once "!backend/uploads/listings/.gitkeep"

echo ""
echo "Project structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Check the structure with: tree -a -I 'node_modules'"
echo "2. Commit the base structure:"
echo "   git add ."
echo "   git commit -m \"chore: add initial project structure\""