LiveableCity Agent
An agentic AI platform that autonomously monitors, scores, and generates improvement plans for Singapore's urban districts — measuring both urban liveability and environmental outcomes through a coordinated multi-agent pipeline.

Built for Hack for Cities 2026 — SMU x IBM Hackathon.

![Dashboard](docs/images/Main%20Dashboard.png)

Table of Contents
Problem Statement
Solution Overview
Features
Architecture
Tech Stack
Data Sources
Supabase Schema
Getting Started
Environment Variables
Project Structure
Workflow Explanation
License
Problem Statement
How can Agentic AI be used to improve efficiency in collectively improving urban liveability and environmental outcomes at a district or nationwide level?

Urban planning in Singapore today relies on fragmented dashboards, periodic reports, and manual cross-referencing of datasets. A planner assessing a district must individually consult PSI readings, transport maps, park locations, dengue alerts, and rainfall data — then synthesise these into recommendations through their own expertise. This process is slow, inconsistent across planners, and reactive: problems are addressed after they manifest rather than predicted and prevented.

Existing smart city platforms provide data visualisation but lack agency. They display metrics without interpreting them, show scores without generating plans, and present findings without questioning their own conclusions.

Solution Overview
LiveableCity Agent deploys five autonomous AI agents that work as a coordinated pipeline:

Monitor real-time data from Singapore government APIs
Analyse districts across liveability and environmental dimensions
Recommend targeted improvements via Gemini AI
Critique those recommendations through adversarial debate
Visualise the proposed improvements with AI image generation
The system maintains persistent memory across sessions, learns from past outcomes, and generates predictive alerts — shifting urban planning from reactive dashboard monitoring to proactive, AI-driven decision support.

Features
📊 Dual Scoring System
Every district receives two independent scores (0–100):

Dimension	Pillars	Weights
Liveability	Transport Access, Green Space, Air Quality, Amenities, Safety	25%, 20%, 20%, 20%, 15%
Environmental	Air Quality Impact, Green Coverage, Vector Safety, Climate Resilience	35%, 30%, 20%, 15%
Both scores are visible across the entire platform — map tooltips, side panel, leaderboard, and analytics.

![Dual ScoreRings](docs/images/Sidepanel%20with%20dual%20ScoreRings.png)

🤖 Multi-Agent AI Pipeline
Five specialised agents execute in sequence:

Agent	Role	Technology
Monitor Agent	Detects district selection, triggers pipeline	Event-driven
Analyst Agent	Fetches live data, computes dual scores	data.gov.sg APIs + GeoJSON
Recommender Agent	Generates prioritised improvement plans	Google Gemini (gemini-2.0-flash)
Critic Agent	Reviews recommendations, challenges assumptions	Google Gemini (separate call)
Vision Agent	Analyses urban photos + generates improved versions	GPT-4o + Gemini Image Gen
The pipeline is visualised in real-time with animated status indicators for each agent stage.

![Agent Pipeline](docs/images/AgentPipeline.png)

🧠 Agent Memory & Learning
The system remembers past recommendations and their outcomes, building institutional knowledge over time.

How it works:

After each recommendation cycle, the system saves the district, recommendation content, and score snapshot to persistent storage
On subsequent analyses of the same district, past memories are injected into the Gemini prompt as context
The getContextForPrompt() method formats the 5 most recent memories with outcome data (score deltas)
The AI adapts: avoids repeating failed suggestions, doubles down on what worked
Storage: Supabase (primary) with automatic localStorage fallback if Supabase is unavailable.

![Memory Panel](docs/images/Memory%20Panel.png)

⚔️ Multi-Agent Deliberation
Recommendations are not accepted at face value. The Critic Agent autonomously reviews each plan:


Recommender Agent  →  Generates improvement plan
        ↓
Critic Agent       →  Challenges weak points, flags missing considerations
        ↓
Recommender Agent  →  Defends or adjusts recommendations (rebuttal)
        ↓
Consensus          →  Final plan with agreement status (agree/partial/disagree)
This three-call deliberation pattern (Recommender → Critic → Rebuttal) produces self-reviewed, consensus-tested plans rather than unchallenged AI output.

![Deliberation Panel](docs/images/Deliberation%20Panel.png)

🏙️ Urban Vision AI
Upload any street-level or aerial photo and get:

AI Analysis — Scores across 5 categories: greenery, infrastructure, cleanliness, accessibility, safety
Issues & Suggestions — Specific problems identified and actionable improvements proposed
Before/After Visualisation (Gemini Image Gen) — A generated image showing what the area could look like after improvements

![Urban Vision](docs/images/Urban%20Vision%20Page.png)

📈 Analytics Dashboard
City-wide breakdown with a dimension toggle between Liveability and Environmental:

Donut Chart — Weighted pillar breakdown
Metric Bars — City-wide averages per pillar
Deficit Analysis — Weighted gap to perfect score, showing where investment moves the needle most
District Heatmap — All districts ranked and colour-coded
Switching between dimensions recalculates the entire page.

![Analytics Environmental](docs/images/Analytics%20Page%20with%20Environmental%20Toggle.png)

🔮 Predictive Insights
AI-generated forecasts classified by severity:

Severity	Meaning
🔴 Critical	Immediate attention required
🟡 Warning	Emerging risk to monitor
🔵 Info	Trend or observation
Each insight includes a confidence score (0–100%) and is tagged by category (greenery, transport, safety, infrastructure). Insights are generated via an n8n automation workflow that periodically processes data and stores results in Supabase.

![Predictive Insights](docs/images/Predictive%20Insights.png)

🗺️ Interactive District Map
Leaflet-based Singapore map with GeoJSON planning area boundaries
Dual score tooltips on hover: Liveability: 72 | Environment: 65
Colour-coded districts by score (green → amber → red)
Layer controls to toggle amenity overlays (parks, hawkers, dengue clusters, MRT stations, etc.)
Click-to-analyse any district to trigger the full agent pipeline

![Map Layer Controls](docs/images/Layer%20Toggle.png)

Architecture
System Architecture

┌──────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                   │
├──────────────┬──────────────┬──────────────┬─────────────────────┤
│  Dashboard   │  Analytics   │ Urban Vision │ Predictive Insights │
│   Page       │    Page      │    Page      │      Page           │
├──────────────┴──────────────┴──────────────┴─────────────────────┤
│                     Agent Pipeline (5 Agents)                    │
│  Monitor → Analyst → Recommender → Critic → Vision              │
├──────────────────────────────────────────────────────────────────┤
│                      Service Layer                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ agentService  │ │scoringService│ │    agentMemory           │ │
│  │ (orchestrator)│ │(dual scores) │ │ (Supabase + localStorage)│ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                       Data Layer                                 │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐ │
│  │data.gov.sg │ │ GeoJSON  │ │ OneMap   │ │ Supabase          │ │
│  │ PSI,       │ │ Parks,   │ │ Pop.     │ │ agent_memory      │ │
│  │ Rainfall   │ │ Hawkers, │ │ Data     │ │ predictive_       │ │
│  │            │ │ Dengue.. │ │          │ │ insights          │ │
│  └────────────┘ └──────────┘ └──────────┘ └───────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                        AI Models                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │ Google Gemini         │  │ OpenAI GPT-4o                   │ │
│  │ • gemini-2.0-flash    │  │ • Urban image analysis          │ │
│  │   (recommendations,   │  │                                  │ │
│  │    critique, rebuttal)│  │                                  │ │
│  │ • gemini-2.0-flash-   │  │                                  │ │
│  │   exp-image-generation│  │                                  │ │
│  └──────────────────────┘  └──────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
Data Pipeline

Live APIs (data.gov.sg)          Static Datasets (GeoJSON)
  │ PSI readings                   │ Parks, Hawkers, Supermarkets
  │ Rainfall station data          │ Dengue/Zika clusters
  ↓                                │ Gyms, Childcare, Cycling paths
  ┌────────────────────────────────┘
  ↓
scoringService.js
  │ Haversine distance calculations
  │ PSI → score conversion
  │ Rainfall → climate score conversion
  │ Amenity proximity counting (2km/3km radius)
  ↓
  ┌─────────────────────┬──────────────────────┐
  │ LIVEABILITY SCORE   │ ENVIRONMENTAL SCORE  │
  │ Transport    (0.25) │ Air Quality    (0.35)│
  │ Air Quality  (0.20) │ Green Coverage (0.30)│
  │ Green Space  (0.20) │ Vector Safety  (0.20)│
  │ Amenities    (0.20) │ Climate        (0.15)│
  │ Safety       (0.15) │                      │
  └─────────────────────┴──────────────────────┘
  ↓
agentService.js (Orchestrator)
  │ Injects memory context
  │ Calls Gemini for recommendations
  │ Runs Critic → Rebuttal deliberation
  │ Saves to agent memory
  ↓
  Dashboard (dual scores, breakdown, agent panel)
Scoring Methodology
PSI to Air Quality Score:

PSI Range	Score Range	Category
0–50	95–85	Good
51–100	85–65	Moderate
101–150	65–45	Unhealthy
151–200	45–30	Very Unhealthy
200+	30–10	Hazardous
Rainfall to Climate Resilience Score:

Rainfall (mm/hr)	Score	Interpretation
0	60	Dry / heat stress
1–5	90	Ideal conditions
5–20	75	Good
20–50	55	Heavy rain
50+	40	Flood concern
Transport Score: base 40 + (MRT stations × 8), capped at 95

Green Space Score: base 40 + (parks within 3km × 6), capped at 95

Amenities Score: base 35 + (hawkers × 5) + (supermarkets × 3) + (childcare × 2) + (gyms × 2), capped at 95

Safety Score: base 85 − (dengue clusters within 1km × 10), floor at 40

Tech Stack
Category	Technology
Frontend	React 19, Vite 7, Tailwind CSS 4
Mapping	Leaflet + React-Leaflet
AI (Recommendations)	Google Gemini (gemini-2.0-flash)
AI (Image Analysis)	OpenAI GPT-4o
AI (Image Generation)	Gemini (gemini-2.0-flash-exp-image-generation)
Database	Supabase (PostgreSQL)
Automation	n8n workflow engine
Icons	Lucide React
File Upload	react-dropzone
Routing	React Router v7
Data Sources
Source	Data	Used For	Update Frequency
data.gov.sg	PSI readings	Air Quality score	Real-time (cached 10 min)
data.gov.sg	Rainfall station readings	Climate Resilience score	Real-time (cached 10 min)
GeoJSON (bundled)	Parks & Nature Reserves	Green Space / Green Coverage score	Static
GeoJSON (bundled)	Dengue Clusters	Safety / Vector Safety score	Static
GeoJSON (bundled)	Zika Clusters	Safety score	Static
GeoJSON (bundled)	Hawker Centres	Amenities score	Static
GeoJSON (bundled)	Supermarkets	Amenities score	Static
GeoJSON (bundled)	Childcare Services	Amenities score	Static
GeoJSON (bundled)	Gyms	Amenities score	Static
GeoJSON (bundled)	Cycling Paths	Infrastructure overlay	Static
Static data	MRT Stations per district	Transport score	Static (2024)
OneMap API	Population demographics	District context	On-demand
Supabase Schema
Two tables are used. Create them in your Supabase SQL Editor:

agent_memory
Stores past recommendations, observations, and outcomes for the learning loop.


CREATE TABLE IF NOT EXISTS agent_memory (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district      TEXT NOT NULL,
  type          TEXT NOT NULL,        -- 'recommendation' | 'anomaly' | 'insight'
  content       JSONB NOT NULL,       -- { title, description, category, improvements[], scores_snapshot }
  outcome       JSONB,                -- { score_before, score_after, delta, evaluated_at }
  created_at    TIMESTAMPTZ DEFAULT now(),
  resolved_at   TIMESTAMPTZ
);

CREATE INDEX idx_agent_memory_district ON agent_memory (district);
CREATE INDEX idx_agent_memory_created ON agent_memory (created_at DESC);

ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON agent_memory
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON agent_memory
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON agent_memory
  FOR UPDATE USING (true);
content JSONB structure example:


{
  "title": "Improve Green Space in Bedok",
  "description": "Add 3 pocket parks along New Upper Changi Road corridor",
  "category": "greenSpace",
  "improvements": [
    { "area": "Green Space", "action": "Add pocket parks", "impact": "+8 points" }
  ],
  "scores_snapshot": { "overall": 68, "greenSpace": 52 }
}
outcome JSONB structure example:


{
  "score_before": 68,
  "score_after": 74,
  "delta": 6,
  "evaluated_at": "2026-01-29T10:30:00Z"
}
predictive_insights
Stores AI-generated predictive alerts from the n8n workflow.


CREATE TABLE IF NOT EXISTS predictive_insights (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district        TEXT NOT NULL,
  category        TEXT NOT NULL,            -- 'greenery' | 'transport' | 'safety' | 'infrastructure'
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  severity        TEXT DEFAULT 'info',      -- 'info' | 'warning' | 'critical'
  confidence      FLOAT DEFAULT 0.0,       -- 0.0 to 1.0
  predicted_impact TEXT,                    -- human-readable impact summary
  data_sources    TEXT[],                   -- array of source names
  metadata        JSONB DEFAULT '{}'::JSONB,-- flexible extra data from n8n
  created_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ              -- optional TTL for auto-expiry
);

CREATE INDEX idx_predictive_insights_created ON predictive_insights (created_at DESC);
CREATE INDEX idx_predictive_insights_district ON predictive_insights (district);

ALTER TABLE predictive_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON predictive_insights
  FOR SELECT USING (true);

CREATE POLICY "Allow service role insert" ON predictive_insights
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

Project Structure

src/
├── components/
│   ├── Agent/                    # AI agent UI components
│   │   ├── AgentPipeline.jsx     # 5-stage pipeline visualisation
│   │   ├── AgentPanel.jsx        # Main agent output panel
│   │   ├── DeliberationPanel.jsx # Recommender vs Critic debate thread
│   │   ├── MemoryPanel.jsx       # Past recommendations + outcomes
│   │   ├── ImprovementPlan.jsx   # Generated improvements display
│   │   └── ...
│   ├── Dashboard/                # District detail components
│   │   ├── DistrictOverview.jsx  # Dual ScoreRings display
│   │   ├── ScoreBreakdown.jsx    # Liveability/Environmental tab toggle
│   │   ├── MetricCard.jsx        # Individual metric display
│   │   ├── OverviewStats.jsx     # Leaderboard with dimension toggle
│   │   ├── SidePanel.jsx         # Main side panel container
│   │   └── ScoreRing.jsx         # Animated circular score display
│   ├── Map/                      # Leaflet map components
│   │   ├── SingaporeMap.jsx      # Main map container
│   │   ├── DistrictLayer.jsx     # GeoJSON district polygons + tooltips
│   │   ├── AmenityLayers.jsx     # Park, hawker, dengue overlays
│   │   └── LayerControlPanel.jsx # Toggle amenity layers
│   ├── Analytics/                # Analytics page charts
│   ├── StreetView/               # Street-level analysis
│   ├── Tour/                     # Guided onboarding tour
│   └── ui/                       # Reusable UI primitives
├── services/
│   ├── agentService.js           # Agent pipeline orchestrator
│   ├── scoringService.js         # Dual score computation engine
│   ├── agentMemory.js            # Persistent memory (Supabase + localStorage)
│   ├── datagovService.js         # data.gov.sg API client
│   ├── oneMapService.js          # OneMap API client
│   ├── visionService.js          # GPT-4o analysis + Gemini image gen
│   └── amenitiesService.js       # GeoJSON amenity data loader
├── hooks/
│   ├── useAgentStream.js         # Agent pipeline state management
│   ├── usePredictiveInsights.js  # Supabase polling for predictions
│   ├── useDistrictData.js        # District selection state
│   └── ...
├── pages/
│   ├── DashboardPage.jsx         # Main dashboard (map + side panel + agents)
│   ├── AnalyticsPage.jsx         # City-wide analytics with dimension toggle
│   ├── PredictiveInsightsPage.jsx# AI-generated forecasts
│   ├── UrbanVisionPage.jsx       # Photo analysis + AI image generation
│   ├── DistrictsPage.jsx         # District listing
│   └── AlertsPage.jsx            # Active alerts
├── contexts/
│   └── AgentContext.jsx          # Global agent state provider
├── data/
│   ├── singapore-planning-areas.json  # District boundary GeoJSON
│   └── *.geojson                      # Amenity datasets
└── utils/
    ├── colorUtils.js             # Score-to-colour mapping
    ├── scoreUtils.js             # Score formatting helpers
    └── liveabilityCalculator.js  # Score computation utilities
Workflow Explanation
1. District Analysis Flow

User clicks district on map
        ↓
useAgentStream.js triggers pipeline
        ↓
Step 1: Monitor Agent (detect selection)
        ↓
Step 2: Analyst Agent
  → scoringService.computeDistrictScore()
  → Fetches PSI (data.gov.sg), rainfall (data.gov.sg)
  → Loads GeoJSON (parks, hawkers, dengue, etc.)
  → Computes Liveability Score (5 pillars, weighted)
  → Computes Environmental Score (4 pillars, weighted)
        ↓
Step 3: Recommender Agent
  → agentMemory.getContextForPrompt(district)  ← injects past memory
  → Gemini API call with scores + memory context
  → Returns { improvements[], projectedScore, summary }
        ↓
Step 4: Critic Agent
  → Gemini API call with Recommender's output
  → Returns { agreements[], disagreements[], suggestions[] }
        ↓
  → Recommender rebuttal (3rd Gemini call)
  → Returns { adjustments[], finalPosition }
        ↓
Step 5: Save to Agent Memory
  → agentMemory.save({ district, type: 'recommendation', content })
        ↓
Results displayed in SidePanel:
  • Dual ScoreRings (DistrictOverview)
  • Liveability/Environmental tab (ScoreBreakdown)
  • Improvement Plan cards
  • Deliberation thread (DeliberationPanel)
  • Past memories (MemoryPanel)
2. Predictive Insights Flow

n8n Workflow (scheduled)
  → Processes data.gov.sg + historical patterns
  → Generates severity-classified insights
  → Inserts into Supabase: predictive_insights table
        ↓
Frontend (usePredictiveInsights hook)
  → Polls Supabase every 30 minutes
  → Groups insights by district
  → Displays with severity colour coding + confidence bars
3. Urban Vision Flow

User uploads photo
        ↓
GPT-4o analyses image
  → Scores: greenery, infrastructure, cleanliness, accessibility, safety
  → Identifies issues
  → Generates suggestions
  → Creates detailed image improvement prompt
        ↓
User clicks "Generate Improved Version"
        ↓
Gemini Image Generation (gemini-2.0-flash-exp-image-generation)
  → Generates improved urban scene from the prompt
        ↓
Side-by-side display: Original vs AI Improved

<p align="center"> Built with ❤️ for Hack for Cities 2026 — SMU x IBM Hackathon </p>
