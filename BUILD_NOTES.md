# Build Notes & Approach

## Architecture Decisions

### 1. Tech Stack Choice
- **Vite**: Fast dev server, optimized builds
- **React + TypeScript**: Type safety, component-based architecture
- **Tailwind CSS**: Rapid UI development, consistent design system
- **Supabase**: Free auth, easy setup, works well with Vite

### 2. API Design
- **YouTube Data API**: Direct client-side calls (no backend needed for basic features)
- **Groq API**: Free tier AI, OpenAI-compatible format, fast responses

### 3. State Management
- React Context for auth state
- Local component state for UI state (sidebar, filters, etc.)
- No external state library needed (simple enough without Redux/Zustand)

### 4. Component Structure
- `App.tsx`: Main router, layout, state orchestration
- `components/`: Dumb UI components (presentational)
- `api/`: Data fetching logic
- `context/`: Global state (auth)
- `lib/`: Utilities (Supabase client)

## Key Features Implemented

### Sidebar
- Collapsible with smooth transitions
- Tab renaming: "Compare" → "Overview", "Competitors" → "Compare"
- Shows current channel info

### Compare Page
- Enter any YouTube channel URL to compare
- Can compare with your own linked channel
- Side-by-side stats: subscribers, views, avg views/video

### My Stats Page
- Shows your linked YouTube channel analytics
- Same UI as Dashboard (filters, sorting, video list)
- Uses channel ID from Supabase profile

### Settings Page
- Profile management
- YouTube API quota info (10,000 units/day)
- Linked channel status
- Account limits display

### AI Features
- **Insights**: Content pillars, retention graph, growth opportunities
- **Competitors**: Simulated competitor analysis
- **Reports**: Markdown reports for different report types

## Lessons Learned

1. **Environment Variables**: Vite requires `VITE_` prefix for client-side access
2. **API Keys**: Never expose on client - use serverless functions for production
3. **TypeScript**: Keep interfaces in central location (`api/youtube.ts`)
4. **Tailwind**: Use consistent color palette via CSS variables

## Future Improvements

1. **Serverless Functions**: Move API calls to Vercel API routes for key security
2. **Caching**: Add Redis or in-memory caching for YouTube API responses
3. **Rate Limiting**: Track quota usage, show warnings
4. **More AI Models**: Support Claude, GPT alternatives
5. **PWA**: Add service worker for offline capability

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## Known Limitations

- YouTube API quota: 10,000 units/day (can request increase)
- Groq: 60 requests/minute on free tier
- No real-time updates (polling or manual refresh needed)
- Competitors are simulated (not real data)
