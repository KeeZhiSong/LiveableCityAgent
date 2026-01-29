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

┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                    │
├───────────────┬─────────────┬────────────┬──────────────────┤
│  Dashboard    │  Analytics  │   Urban    │   Predictive     │
│  Page         │  Page       │   Vision   │   Insights       │
├───────────────┴─────────────┴────────────┴──────────────────┤
│                  Agent Pipeline (5 Agents)                    │
│   Monitor → Analyst → Recommender → Critic → Vision         │
├──────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│                                                              │
│   agentService.js     scoringService.js     agentMemory.js   │
│   (orchestrator)      (dual scores)     (Supabase/localStorage)│
├──────────────────────────────────────────────────────────────┤
│                       Data Layer                             │
│                                                              │
│   data.gov.sg    GeoJSON Files    OneMap API    Supabase     │
│   (PSI,          (Parks, Hawkers, (Population)  (agent_memory│
│    Rainfall)      Dengue, etc.)                  predictive_ │
│                                                  insights)   │
├──────────────────────────────────────────────────────────────┤
│                       AI Models                              │
│                                                              │
│   Google Gemini                    OpenAI GPT-4o             │
│   • gemini-2.0-flash               • Urban image analysis    │
│     (recommendations,                                        │
│      critique, rebuttal)                                     │
│   • gemini-2.0-flash-                                        │
│     exp-image-generation                                     │
└──────────────────────────────────────────────────────────────┘
Data Pipeline

Live APIs (data.gov.sg)            Static Datasets (GeoJSON)
  │ PSI readings                     │ Parks, Hawkers, Supermarkets
  │ Rainfall station data            │ Dengue/Zika clusters
  ↓                                  │ Gyms, Childcare, Cycling paths
  ┌──────────────────────────────────┘
  ↓
scoringService.js
  │ Haversine distance calculations
  │ PSI → score conversion
  │ Rainfall → climate score conversion
  │ Amenity proximity counting (2km/3km radius)
  ↓
  ┌───────────────────────┬────────────────────────┐
  │  LIVEABILITY SCORE    │  ENVIRONMENTAL SCORE   │
  │  Transport     (0.25) │  Air Quality     (0.35)│
  │  Air Quality   (0.20) │  Green Coverage  (0.30)│
  │  Green Space   (0.20) │  Vector Safety   (0.20)│
  │  Amenities     (0.20) │  Climate         (0.15)│
  │  Safety        (0.15) │                        │
  └───────────────────────┴────────────────────────┘
  ↓
agentService.js (Orchestrator)
  │ Injects memory context
  │ Calls Gemini for recommendations
  │ Runs Critic → Rebuttal deliberation
  │ Saves to agent memory
  ↓
  Dashboard (dual scores, breakdown, agent panel)

<p align="center"> Built with ❤️ for Hack for Cities 2026 — SMU x IBM Hackathon </p>
