import supabase from '../lib/supabase';

const MEMORY_STORAGE_KEY = 'liveable_city_agent_memory';
const MAX_LOCAL_ENTRIES = 50;

/**
 * Agent Memory Service
 *
 * Stores observations, past recommendations, and their outcomes.
 * Uses Supabase when available, falls back to localStorage.
 *
 * Schema (Supabase table: agent_memory):
 *   id            uuid primary key default gen_random_uuid()
 *   district      text not null
 *   type          text not null  -- 'recommendation' | 'anomaly' | 'insight'
 *   content       jsonb not null -- { title, description, category, improvements[], scores_snapshot }
 *   outcome       jsonb          -- { score_before, score_after, delta, evaluated_at }
 *   created_at    timestamptz default now()
 *   resolved_at   timestamptz
 */

// ── localStorage helpers ──

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(entries) {
  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_LOCAL_ENTRIES)));
}

// ── Public API ──

export const agentMemory = {
  /**
   * Record a memory entry (recommendation, anomaly, or insight)
   */
  async save({ district, type, content }) {
    const entry = {
      id: crypto.randomUUID(),
      district,
      type,
      content,
      outcome: null,
      created_at: new Date().toISOString(),
      resolved_at: null,
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('agent_memory').insert(entry);
        if (error) throw error;
        console.log('[AgentMemory] Saved to Supabase:', entry.id);
        return entry;
      } catch (err) {
        console.warn('[AgentMemory] Supabase save failed, using localStorage:', err.message);
      }
    }

    // localStorage fallback
    const entries = readLocal();
    entries.unshift(entry);
    writeLocal(entries);
    console.log('[AgentMemory] Saved to localStorage:', entry.id);
    return entry;
  },

  /**
   * Retrieve past memories for a district (most recent first)
   */
  async getForDistrict(district, limit = 10) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('agent_memory')
          .select('*')
          .eq('district', district)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('[AgentMemory] Supabase fetch failed, using localStorage:', err.message);
      }
    }

    return readLocal()
      .filter((e) => e.district === district)
      .slice(0, limit);
  },

  /**
   * Retrieve all recent memories across all districts
   */
  async getRecent(limit = 20) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('agent_memory')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('[AgentMemory] Supabase fetch failed, using localStorage:', err.message);
      }
    }

    return readLocal().slice(0, limit);
  },

  /**
   * Update a memory entry with its outcome (score changes)
   */
  async recordOutcome(memoryId, outcome) {
    const outcomeData = {
      ...outcome,
      evaluated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { error } = await supabase
          .from('agent_memory')
          .update({ outcome: outcomeData, resolved_at: new Date().toISOString() })
          .eq('id', memoryId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('[AgentMemory] Supabase update failed, using localStorage:', err.message);
      }
    }

    // localStorage fallback
    const entries = readLocal();
    const idx = entries.findIndex((e) => e.id === memoryId);
    if (idx !== -1) {
      entries[idx].outcome = outcomeData;
      entries[idx].resolved_at = new Date().toISOString();
      writeLocal(entries);
    }
    return true;
  },

  /**
   * Build a text summary of past memories for a district, suitable for injecting into a Gemini prompt.
   */
  async getContextForPrompt(district) {
    const memories = await this.getForDistrict(district, 5);
    if (memories.length === 0) return '';

    const lines = memories.map((m) => {
      const date = new Date(m.created_at).toLocaleDateString();
      const base = `[${date}] ${m.type}: ${m.content?.title || m.content?.description || JSON.stringify(m.content)}`;
      if (m.outcome) {
        const delta = m.outcome.delta ?? (m.outcome.score_after - m.outcome.score_before);
        return `${base} → Outcome: score ${delta >= 0 ? '+' : ''}${delta} (${m.outcome.score_before} → ${m.outcome.score_after})`;
      }
      return `${base} → Outcome: pending`;
    });

    return `\n\nAgent Memory for ${district} (${memories.length} past entries):\n${lines.join('\n')}`;
  },
};

export default agentMemory;
