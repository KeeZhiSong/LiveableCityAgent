import { Leaf, Github, Globe, Users, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Leaf className="w-8 h-8 text-leaf" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-leaf to-teal bg-clip-text text-transparent">
              LiveableCity Agent
            </h1>
          </div>
          <p className="text-text-secondary text-sm">
            An autonomous AI agent for urban liveability monitoring
          </p>
        </div>

        <div className="grid gap-4">
          <div className="p-5 rounded-xl bg-forest/50 border border-forest-light/50">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="text-leaf" size={18} />
              <h2 className="font-semibold text-text-primary">What It Does</h2>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              LiveableCity Agent autonomously monitors Singapore's urban liveability metrics —
              including air quality (PSI), weather, dengue clusters, and traffic conditions.
              It correlates data across districts, identifies risks, and proactively generates
              recommendations to improve city living conditions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-forest/50 border border-forest-light/50">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="text-teal" size={18} />
              <h2 className="font-semibold text-text-primary">Tech Stack</h2>
            </div>
            <ul className="text-text-secondary text-sm space-y-1">
              <li>• React + Tailwind CSS (Frontend)</li>
              <li>• Supabase (Database & Real-time)</li>
              <li>• n8n (Agentic Workflow Automation)</li>
              <li>• OpenAI GPT-4o / Google Gemini 2.0 (AI Analysis)</li>
              <li>• Singapore Government Open APIs (Data Sources)</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-forest/50 border border-forest-light/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-amber-400" size={18} />
              <h2 className="font-semibold text-text-primary">Built For</h2>
            </div>
            <p className="text-text-secondary text-sm">
              Hack for Cities 2026 — SMU x IBM Hackathon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
