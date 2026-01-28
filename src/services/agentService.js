import { mockDistrictScores, mockAgentInsights, mockImprovements, mockDistrictDetails } from '../data/mockData';
import { oneMapService } from './oneMapService';
import { scoringService } from './scoringService';
import { agentMemory } from './agentMemory';
import supabase from '../lib/supabase';
import { GoogleGenAI } from '@google/genai';

// Lazy-init Gemini client
let _gemini = null;
function getGemini() {
  if (!_gemini) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error('VITE_GEMINI_API_KEY is not set');
    _gemini = new GoogleGenAI({ apiKey: key });
  }
  return _gemini;
}

async function geminiJSON(prompt) {
  const resp = await getGemini().models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(resp.text);
}

// Use Vite proxy in development to avoid CORS issues (kept for non-agent endpoints)
const N8N_BASE_URL = import.meta.env.DEV
  ? '/api/n8n'
  : (import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://threeecho.app.n8n.cloud/webhook');
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'; // Changed: default to real data
const USE_REAL_SCORING = import.meta.env.VITE_USE_REAL_SCORING !== 'false'; // New: enable real scoring
const USE_ONEMAP = import.meta.env.VITE_ONEMAP_API_KEY ? true : false;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Cache for OneMap data to avoid repeated API calls
const oneMapCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedOrFetch = async (key, fetchFn) => {
  const cached = oneMapCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchFn();
  oneMapCache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Generate insights based on real data
const generateInsights = (districtName, scores, populationData) => {
  const insights = [];

  // Analyze scores
  const metrics = [
    { key: 'airQuality', label: 'air quality', good: 75 },
    { key: 'transport', label: 'transport connectivity', good: 75 },
    { key: 'greenSpace', label: 'green space coverage', good: 70 },
    { key: 'amenities', label: 'amenities access', good: 70 },
    { key: 'safety', label: 'safety metrics', good: 75 },
  ];

  // Find strengths
  const strengths = metrics.filter(m => (scores[m.key] || 0) >= m.good);
  const weaknesses = metrics.filter(m => (scores[m.key] || 0) < 60);

  if (strengths.length > 0) {
    const strengthList = strengths.map(s => s.label).join(' and ');
    insights.push(`${districtName} demonstrates strong ${strengthList} with above-average scores.`);
  }

  if (weaknesses.length > 0) {
    const weakList = weaknesses.map(w => w.label).join(' and ');
    insights.push(`Areas for improvement include ${weakList}, which score below the national average.`);
  }

  // Population insight
  if (populationData?.totalPopulation) {
    const pop = populationData.totalPopulation;
    if (pop > 200000) {
      insights.push(`With a population of ${pop.toLocaleString()}, this is one of Singapore's larger residential areas.`);
    } else if (pop > 100000) {
      insights.push(`The district serves a population of approximately ${pop.toLocaleString()} residents.`);
    }
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push(`${districtName} shows balanced liveability metrics across all categories.`);
  }

  return insights;
};

export const agentService = {
  async getAllDistrictScores() {
    // Try real scoring first (fastest, uses cached data)
    if (USE_REAL_SCORING) {
      try {
        console.log('[AgentService] Fetching real district scores...');
        const result = await scoringService.computeAllDistrictScores();
        console.log(`[AgentService] Got real scores for ${Object.keys(result.districts).length} districts in ${result.computeTime}ms`);
        return result;
      } catch (error) {
        console.warn('[AgentService] Real scoring failed, falling back:', error);
      }
    }

    // Fallback to mock data
    if (USE_MOCK) {
      await delay(500);
      return {
        districts: mockDistrictScores,
        lastUpdated: new Date().toISOString()
      };
    }

    // Try n8n endpoint as last resort
    try {
      const response = await fetch(`${N8N_BASE_URL}/district-scores`);
      if (!response.ok) throw new Error('Failed to fetch district scores');
      return response.json();
    } catch (error) {
      console.warn('[AgentService] n8n fetch failed, using mock:', error);
      return {
        districts: mockDistrictScores,
        lastUpdated: new Date().toISOString()
      };
    }
  },

  async assessDistrict(districtName) {
    // Try to get real scores first
    let scores;
    let scoreDetails = null;

    let envScores = null;

    if (USE_REAL_SCORING) {
      try {
        const realScore = await scoringService.computeDistrictScore(districtName);
        scores = {
          overall: realScore.overall,
          airQuality: realScore.airQuality,
          transport: realScore.transport,
          greenSpace: realScore.greenSpace,
          amenities: realScore.amenities,
          safety: realScore.safety,
        };
        scoreDetails = realScore.details;
        envScores = {
          envScore: realScore.envScore,
          envAirQuality: realScore.envAirQuality,
          envGreenCoverage: realScore.envGreenCoverage,
          envVectorSafety: realScore.envVectorSafety,
          envClimate: realScore.envClimate,
          envDetails: realScore.envDetails,
        };
        console.log(`[AgentService] Using real scores for ${districtName}:`, scores);
      } catch (error) {
        console.warn(`[AgentService] Real scoring failed for ${districtName}:`, error);
      }
    }

    // Fallback to mock if real scoring failed
    if (!scores) {
      scores = mockDistrictScores[districtName] || {
        overall: 65,
        airQuality: 65,
        transport: 65,
        greenSpace: 65,
        amenities: 65,
        safety: 65
      };
    }

    // Try to fetch real data from OneMap
    let populationData = null;
    let realPopulation = null;

    if (USE_ONEMAP) {
      try {
        // Convert district name to uppercase for OneMap API
        const oneMapName = districtName.toUpperCase();
        populationData = await getCachedOrFetch(
          `population-${oneMapName}`,
          () => oneMapService.getDistrictAnalytics(oneMapName)
        );

        if (populationData?.totalPopulation) {
          realPopulation = populationData.totalPopulation;
        }
      } catch (error) {
        console.warn(`Could not fetch OneMap data for ${districtName}:`, error);
      }
    }

    // Use mock details as fallback
    const mockDetails = mockDistrictDetails[districtName];
    const population = realPopulation || mockDetails?.population || Math.floor(Math.random() * 150000) + 50000;

    // Generate dynamic insights
    const insights = generateInsights(districtName, scores, populationData);

    // Build score breakdown with trends and real data details
    const breakdown = {
      airQuality: {
        score: scores.airQuality,
        trend: scores.airQuality >= 75 ? "up" : scores.airQuality >= 60 ? "stable" : "down",
        details: scoreDetails?.airQuality?.psi
          ? `PSI ${scoreDetails.airQuality.psi} (${scoreDetails.airQuality.region} region)`
          : scores.airQuality >= 80 ? "PSI levels consistently good" :
            scores.airQuality >= 60 ? "PSI levels within acceptable range" :
            "Air quality needs monitoring",
        source: scoreDetails?.airQuality?.source || 'estimated',
      },
      transport: {
        score: scores.transport,
        trend: scores.transport >= 75 ? "up" : "stable",
        details: scoreDetails?.transport?.mrtStations !== undefined
          ? `${scoreDetails.transport.mrtStations} MRT station${scoreDetails.transport.mrtStations !== 1 ? 's' : ''} nearby`
          : scores.transport >= 80 ? "Excellent MRT/bus connectivity" :
            scores.transport >= 60 ? "Good public transport access" :
            "Limited transport options",
        source: 'mrt_data',
      },
      greenSpace: {
        score: scores.greenSpace,
        trend: scores.greenSpace >= 75 ? "up" : "stable",
        details: scoreDetails?.greenSpace?.parksNearby !== undefined
          ? `${scoreDetails.greenSpace.parksNearby} park${scoreDetails.greenSpace.parksNearby !== 1 ? 's' : ''} within 3km`
          : scores.greenSpace >= 80 ? "Abundant parks and nature areas" :
            scores.greenSpace >= 60 ? "Adequate green space coverage" :
            "Limited green spaces",
        source: 'parks_geojson',
      },
      amenities: {
        score: scores.amenities,
        trend: "stable",
        details: scoreDetails?.amenities
          ? `${scoreDetails.amenities.hawkers} hawkers, ${scoreDetails.amenities.supermarkets} supermarkets within 2km`
          : scores.amenities >= 80 ? "Excellent access to facilities" :
            scores.amenities >= 60 ? "Good hawker and retail access" :
            "Basic amenities available",
        source: 'amenities_geojson',
      },
      safety: {
        score: scores.safety,
        trend: scores.safety >= 75 ? "stable" : "down",
        details: scoreDetails?.safety?.dengueClusters !== undefined
          ? scoreDetails.safety.dengueClusters === 0
            ? "No active dengue clusters"
            : `${scoreDetails.safety.dengueClusters} dengue cluster${scoreDetails.safety.dengueClusters !== 1 ? 's' : ''} within 1km`
          : scores.safety >= 80 ? "Very low incident rates" :
            scores.safety >= 60 ? "Average safety metrics" :
            "Safety improvements needed",
        source: 'dengue_geojson',
      }
    };

    // Build environmental breakdown
    const envBreakdown = envScores ? {
      airQuality: {
        score: envScores.envAirQuality,
        trend: envScores.envAirQuality >= 75 ? 'up' : envScores.envAirQuality >= 60 ? 'stable' : 'down',
        details: scoreDetails?.airQuality?.psi
          ? `PSI ${scoreDetails.airQuality.psi} — environmental impact`
          : 'Air quality environmental assessment',
      },
      greenCoverage: {
        score: envScores.envGreenCoverage,
        trend: envScores.envGreenCoverage >= 75 ? 'up' : 'stable',
        details: scoreDetails?.greenSpace?.parksNearby !== undefined
          ? `${scoreDetails.greenSpace.parksNearby} park${scoreDetails.greenSpace.parksNearby !== 1 ? 's' : ''} — ecosystem coverage`
          : 'Green coverage assessment',
      },
      vectorSafety: {
        score: envScores.envVectorSafety,
        trend: envScores.envVectorSafety >= 75 ? 'stable' : 'down',
        details: scoreDetails?.safety?.dengueClusters !== undefined
          ? scoreDetails.safety.dengueClusters === 0
            ? 'No active vector-borne disease clusters'
            : `${scoreDetails.safety.dengueClusters} dengue cluster${scoreDetails.safety.dengueClusters !== 1 ? 's' : ''} — vector risk`
          : 'Vector-borne disease risk assessment',
      },
      climate: {
        score: envScores.envClimate,
        trend: envScores.envClimate >= 75 ? 'up' : 'stable',
        details: envScores.envDetails?.climate?.rainfall !== undefined
          ? `${envScores.envDetails.climate.rainfall}mm/hr rainfall at ${envScores.envDetails.climate.station || 'nearest station'}`
          : 'Climate conditions assessment',
      },
    } : null;

    return {
      district: districtName,
      scores: {
        overall: scores.overall,
        breakdown
      },
      envScores: envScores ? {
        overall: envScores.envScore,
        breakdown: envBreakdown,
      } : null,
      population,
      area: mockDetails?.area || `${(Math.random() * 20 + 8).toFixed(1)} km²`,
      insights,
      oneMapData: populationData,
      dataSource: scoreDetails ? 'real' : 'mock',
      sources: scoreDetails ? [
        'data.gov.sg (PSI, Rainfall)',
        'GeoJSON (Parks, Amenities, Dengue)',
        'Static (MRT stations)',
      ] : ['Mock data'],
      timestamp: new Date().toISOString()
    };
  },

  async getImprovementPlan(districtName, currentScores) {
    const breakdown = currentScores?.breakdown || {};
    const scoresText = Object.entries(breakdown)
      .map(([k, v]) => `${k}: ${v.score}/100 (${v.details || ''})`)
      .join('\n');

    // Fetch agent memory for this district
    let memoryContext = '';
    try {
      memoryContext = await agentMemory.getContextForPrompt(districtName);
    } catch (err) {
      console.warn('[AgentService] Failed to fetch memory context:', err);
    }

    let result;
    try {
      console.log(`[AgentService] Generating Gemini improvement plan for ${districtName}...`);
      result = await geminiJSON(`You are an autonomous urban liveability agent for Singapore. Analyze this district and produce an actionable improvement plan.

District: ${districtName}
Overall score: ${currentScores?.overall || 'unknown'}/100
Score breakdown:
${scoresText}
${memoryContext}
${memoryContext ? '\nUse the memory above to avoid repeating past recommendations that did not work, and to build on ones that did.\n' : ''}
Return a JSON object with this exact schema:
{
  "district": "${districtName}",
  "reasoning": "<2-3 sentences explaining your analysis process and why you prioritized certain areas>",
  "improvements": [
    {
      "id": "imp-<category>",
      "title": "<short actionable title>",
      "description": "<1-2 sentences, specific to ${districtName}>",
      "category": "<airQuality|transport|greenSpace|amenities|safety>",
      "impact": "<high|medium|low>",
      "estimatedScoreChange": { "<category>": <number>, "overall": <number> }
    }
  ],
  "summary": "<1 sentence summary of the plan>"
}

Rules:
- Return 2-4 improvements, prioritizing the lowest-scoring categories
- Be specific to Singapore urban planning (HDB, MRT, hawker centres, park connectors, etc.)
- Estimated score changes should be realistic (2-15 points per category)
- The reasoning field should sound like an autonomous agent explaining its thought process`);
    } catch (err) {
      console.warn('[AgentService] Gemini plan failed, falling back to heuristic:', err);
      const improvements = [];
      if ((breakdown.transport?.score || 70) < 75) {
        improvements.push({ id: 'imp-transport', title: 'Enhance public transport connectivity', description: `Add new bus routes and improve MRT feeder services in ${districtName}.`, category: 'transport', impact: 'high', estimatedScoreChange: { transport: 10, overall: 3 } });
      }
      if ((breakdown.greenSpace?.score || 70) < 75) {
        improvements.push({ id: 'imp-green', title: 'Develop pocket parks and green corridors', description: 'Convert underutilized spaces into community gardens and mini parks.', category: 'greenSpace', impact: 'medium', estimatedScoreChange: { greenSpace: 8, overall: 2 } });
      }
      if ((breakdown.amenities?.score || 70) < 75) {
        improvements.push({ id: 'imp-amenities', title: 'Expand community facilities', description: 'Build additional hawker centres and community spaces.', category: 'amenities', impact: 'high', estimatedScoreChange: { amenities: 12, overall: 3 } });
      }
      if (improvements.length === 0) improvements.push(...mockImprovements);
      result = {
        district: districtName,
        improvements: improvements.slice(0, 3),
        summary: `Focusing on the weakest areas would yield the highest liveability gains for ${districtName}.`
      };
    }

    // ── Critic Agent: review the recommendation ──
    let deliberation = null;
    try {
      console.log(`[AgentService] Running Critic Agent for ${districtName}...`);
      const criticPrompt = `You are a skeptical urban planning critic reviewing an AI agent's improvement plan for ${districtName}, Singapore.

The Recommender Agent proposed:
${JSON.stringify(result.improvements, null, 2)}

Its reasoning: "${result.reasoning || result.summary}"

Current scores:
${scoresText}

Review this plan critically. Return a JSON object:
{
  "critique": "<2-3 sentences pointing out weaknesses, blind spots, or alternative priorities the recommender missed>",
  "agreement_level": "<agree|partial|disagree>",
  "alternative_focus": "<optional: a category or approach the recommender should have prioritized instead, or null>",
  "refined_summary": "<1 sentence improved summary incorporating your feedback>"
}

Be constructive but honest. If the plan is solid, say so. If there are gaps, point them out.`;

      const criticResult = await geminiJSON(criticPrompt);

      // ── Recommender rebuttal ──
      console.log(`[AgentService] Recommender rebuttal for ${districtName}...`);
      const rebuttalPrompt = `You are the Recommender Agent. A Critic Agent reviewed your improvement plan for ${districtName} and said:

Critique: "${criticResult.critique}"
Agreement level: ${criticResult.agreement_level}
Alternative focus: ${criticResult.alternative_focus || 'none'}

Your original plan: ${JSON.stringify(result.improvements?.map(i => i.title))}
Your reasoning: "${result.reasoning || result.summary}"

Respond with a JSON object:
{
  "response": "<2-3 sentences. Acknowledge valid points, defend your choices where justified, and note any adjustments you'd make.>",
  "adjustments": "<brief description of what you'd change based on the critique, or 'none' if you stand by the original plan>"
}`;

      const rebuttalResult = await geminiJSON(rebuttalPrompt);

      deliberation = [
        { agent: 'recommender', text: result.reasoning || result.summary },
        { agent: 'critic', text: criticResult.critique, agreement: criticResult.agreement_level, alternativeFocus: criticResult.alternative_focus },
        { agent: 'recommender', text: rebuttalResult.response, adjustments: rebuttalResult.adjustments },
      ];

      // Use refined summary if critic disagreed
      if (criticResult.agreement_level !== 'agree' && criticResult.refined_summary) {
        result.summary = criticResult.refined_summary;
      }
    } catch (err) {
      console.warn('[AgentService] Critic agent failed, continuing without deliberation:', err);
    }

    result.deliberation = deliberation;

    // ── Save to Agent Memory ──
    try {
      await agentMemory.save({
        district: districtName,
        type: 'recommendation',
        content: {
          title: result.summary,
          improvements: result.improvements?.map(i => i.title) || [],
          scores_snapshot: currentScores?.overall || null,
          category: result.improvements?.[0]?.category || 'general',
        },
      });
    } catch (err) {
      console.warn('[AgentService] Failed to save memory:', err);
    }

    return result;
  },

  async simulateImpact(districtName, improvements) {
    const improvementDescs = improvements
      .map(id => typeof id === 'string' ? id : id.title || id)
      .join(', ');

    const prompt = `Generate a realistic urban visualization of ${districtName}, Singapore after these liveability improvements have been implemented: ${improvementDescs}.

Show a vibrant, improved Singaporean neighbourhood with:
- Modern HDB blocks and well-maintained buildings
- Lush greenery, pocket parks, and tree-lined streets
- Clean pedestrian walkways and cycling paths
- Active community spaces with residents
- Clear blue sky, good air quality atmosphere

Style: Photorealistic urban photography, daytime, warm lighting, aerial or street-level perspective of a thriving Singapore district.`;

    try {
      console.log(`[AgentService] Generating impact vision image for ${districtName}...`);
      const response = await getGemini().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      });

      let imageUrl = null;
      let analysis = '';

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          analysis = part.text;
        }
      }

      return {
        district: districtName,
        imageUrl,
        analysis: analysis || `Here's a vision of ${districtName} after implementing the proposed improvements.`,
        improvements,
      };
    } catch (err) {
      console.warn('[AgentService] Gemini image generation failed:', err);
      return {
        district: districtName,
        imageUrl: null,
        analysis: `Vision generation failed. The proposed improvements for ${districtName} include: ${improvementDescs}.`,
        improvements,
      };
    }
  },

  async getActivityFeed(limit = 20) {
    if (USE_MOCK) {
      await delay(300);
      return mockAgentInsights.slice(0, limit);
    }

    try {
      const response = await fetch(`${N8N_BASE_URL}/activity-feed?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch activity');
      return response.json();
    } catch (error) {
      // Fallback to mock data if endpoint doesn't exist
      console.warn('[AgentService] Activity feed not available, using mock:', error.message);
      return mockAgentInsights.slice(0, limit);
    }
  },

  // ============ AUTONOMOUS AGENT ENDPOINTS (Supabase) ============

  /**
   * Get latest alerts from Supabase
   * Returns: { success, alerts[], totalAlerts, lastUpdate }
   */
  async getLatestAlerts() {
    console.log('[AgentService] Fetching alerts from Supabase...');
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data: alerts, error } = await supabase
        .from('agent_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      console.log('[AgentService] Alerts from Supabase:', alerts?.length || 0);
      return {
        success: true,
        alerts: alerts || [],
        totalAlerts: alerts?.length || 0,
        lastUpdate: alerts?.[0]?.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('[AgentService] Failed to fetch alerts:', error);
      return { success: false, alerts: [], error: error.message };
    }
  },

  /**
   * Get agent status from Supabase
   * Returns: { status, agent, version, lastRun, lastStatus, runCount, alertsActive, districtsMonitored, interval }
   */
  async getAgentStatus() {
    console.log('[AgentService] Fetching agent status from Supabase...');
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('agent_status')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;

      console.log('[AgentService] Status from Supabase:', data);
      return {
        status: data?.status || 'offline',
        agent: data?.agent_name || 'LiveableCity Monitor',
        version: data?.version || '1.0.0',
        lastRun: data?.last_run,
        lastStatus: data?.last_status,
        runCount: data?.run_count || 0,
        alertsActive: data?.alerts_active || 0,
        districtsMonitored: data?.districts_monitored || 0,
        interval: data?.interval || '15 minutes',
      };
    } catch (error) {
      console.error('[AgentService] Failed to fetch agent status:', error);
      return { status: 'offline', error: error.message };
    }
  },

  /**
   * Get current AI recommendations from Supabase
   * Returns: { success, greeting, insights[], recommendations[], timestamp }
   */
  async getRecommendations() {
    console.log('[AgentService] Fetching recommendations from Supabase...');
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('agent_recommendations')
        .select('*')
        .eq('is_current', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      if (!data) {
        return {
          success: true,
          greeting: null,
          insights: [],
          recommendations: [],
          timestamp: null,
        };
      }

      // Helper to parse double-stringified JSON (n8n sometimes stringifies JSONB data)
      const parseIfString = (val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      };

      console.log('[AgentService] Recommendations from Supabase:', data);
      return {
        success: true,
        greeting: data.greeting,
        insights: parseIfString(data.insights) || [],
        recommendations: parseIfString(data.recommendations) || [],
        agentReasoning: data.agent_reasoning,
        dataSources: parseIfString(data.data_sources) || [],
        timestamp: data.created_at,
      };
    } catch (error) {
      console.error('[AgentService] Failed to fetch recommendations:', error);
      return { success: false, recommendations: [], insights: [], error: error.message };
    }
  },

  /**
   * Acknowledge/resolve an alert in Supabase
   */
  async updateAlertStatus(alertId, status) {
    console.log('[AgentService] Updating alert status:', alertId, status);
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const updateData = { status };
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('agent_alerts')
        .update(updateData)
        .eq('id', alertId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[AgentService] Failed to update alert:', error);
      return { success: false, error: error.message };
    }
  },
};
