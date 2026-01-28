# LiveableCity Agent

An AI-powered urban liveability and environmental outcomes analysis platform for Singapore, built for the **Hack for Cities 2026 — SMU x IBM Hackathon**.

## Features

### Dual Scoring System
- **Urban Liveability Score** (0-100): Transport, Green Space, Air Quality, Amenities, Safety
- **Environmental Outcomes Score** (0-100): Air Quality, Green Coverage, Vector Safety, Climate

### Multi-Agent AI System
- **Monitor Agent**: Detects district selection and triggers analysis
- **Analyst Agent**: Scores districts from live data (data.gov.sg, GeoJSON, MRT data)
- **Recommender Agent**: Generates improvement plans via Gemini AI
- **Critic Agent**: Reviews and debates recommendations (multi-agent deliberation)
- **Vision Agent**: Generates future visualization of improvements

### Key Capabilities
- Agent Memory & Learning Loop (Supabase + localStorage persistence)
- Multi-agent debate/consensus system
- Interactive Singapore district map with dual score tooltips
- Analytics dashboard with liveability/environmental dimension toggle
- Street-level walkability analysis
- Predictive insights and alerts

## Tech Stack
- React + Vite
- Leaflet for mapping
- Google Gemini AI
- Supabase (optional persistence)
- data.gov.sg APIs

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env` file with:
```
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=your_supabase_url (optional)
VITE_SUPABASE_ANON_KEY=your_supabase_key (optional)
```

## License
MIT
