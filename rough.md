# Watchlist Feature Implementation Plan

## Backend Tasks

### 1. Database & API

- [x] Create Watchlist model in schema.prisma
- [ ] Generate and apply migrations
- [ ] Create API endpoints:
  - POST /api/watchlist/toggle - Toggle auction in watchlist
  - GET /api/watchlist - Get user's watchlist
  - DELETE /api/watchlist/{auctionId} - Remove from watchlist

### 2. Backend Implementation

- [ ] Create WatchlistService:
  ```typescript
  - toggleWatchlist(userId: string, auctionId: string)
  - getUserWatchlist(userId: string)
  - isAuctionInWatchlist(userId: string, auctionId: string)
  ```
- [ ] Add proper error handling and validation
- [ ] Add authentication middleware

## Frontend Tasks

### 1. UI Components

- [ ] Create WatchlistButton component
  - Star icon that toggles between filled/outlined
  - Tooltip showing "Add to/Remove from Watchlist"
- [ ] Add WatchlistButton to AuctionCard component
- [ ] Create WatchlistPage component

### 2. State Management

- [ ] Add watchlist actions and reducers
- [ ] Implement optimistic updates for better UX
- [ ] Add loading states

### 3. API Integration

- [ ] Create watchlist API service
- [ ] Implement error handling
- [ ] Add success/error notifications

## Testing Tasks

- [ ] Unit tests for WatchlistService
- [ ] API endpoint tests
- [ ] Component tests for WatchlistButton
- [ ] Integration tests

## UI/UX Considerations

- Button states: default, hover, active
- Loading indicators
- Success/error notifications
- Responsive design
- Accessibility (ARIA labels, keyboard navigation)

## Implementation Order

1. Database schema and migrations
2. Backend API endpoints
3. Frontend components
4. Integration and testing
5. UI polish and optimization

# make schema

# remove seed

# api end points

# frontend

# tests
