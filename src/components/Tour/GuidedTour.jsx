import { useState, useEffect, useCallback, useRef } from 'react';
import { Leaf, ArrowRight, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'liveable_city_tour_completed';

const STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to LiveableCity Agent!',
    content: 'Let me give you a quick tour of the platform. We monitor Singapore\'s urban liveability across 28 districts using real-time data and AI analysis.',
  },
  {
    id: 'map',
    target: 'map',
    title: 'Interactive Liveability Map',
    content: 'This map shows Singapore\'s planning districts, color-coded by liveability score. Click any district to trigger an AI-powered analysis.',
    position: 'right',
  },
  {
    id: 'sidebar',
    target: 'sidebar',
    title: 'Navigation',
    content: 'Use the sidebar to switch between the Dashboard, Urban Vision (image analysis), Districts overview, Analytics, Alerts, and Predictive Insights.',
    position: 'right',
  },
  {
    id: 'side-panel',
    target: 'side-panel',
    title: 'District Details & AI Agent',
    content: 'When you select a district, detailed scores appear here along with an AI agent pipeline that analyzes data, generates recommendations, and visualizes improvements.',
    position: 'left',
  },
  {
    id: 'recommendations',
    target: 'recommendations',
    title: 'Proactive Recommendations',
    content: 'The agent monitors all districts and proactively suggests areas that need attention. Click here to view its latest recommendations.',
    position: 'bottom',
  },
];

export default function GuidedTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setActive(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateSpotlight = useCallback(() => {
    const current = STEPS[step];
    if (!current?.target) {
      setSpotlightRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const pad = 8;
      setSpotlightRect({
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      });
    } else {
      setSpotlightRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!active) return;
    updateSpotlight();
    const handle = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateSpotlight);
    };
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, step, updateSpotlight]);

  const finish = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const goToStep = useCallback((newStep) => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setTimeout(() => setTransitioning(false), 50);
    }, 200);
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      goToStep(step + 1);
    } else {
      finish();
    }
  }, [step, finish, goToStep]);

  const prev = useCallback(() => {
    if (step > 0) goToStep(step - 1);
  }, [step, goToStep]);

  if (!active) return null;

  const current = STEPS[step];
  const isWelcome = !current.target;

  // Tooltip positioning
  let tooltipStyle = {};
  if (spotlightRect && !isWelcome) {
    const pos = current.position || 'bottom';
    const gap = 16;
    if (pos === 'right') {
      tooltipStyle = {
        top: Math.max(16, spotlightRect.top + spotlightRect.height / 2 - 80),
        left: spotlightRect.left + spotlightRect.width + gap,
      };
    } else if (pos === 'left') {
      tooltipStyle = {
        top: Math.max(16, spotlightRect.top + spotlightRect.height / 2 - 80),
        right: window.innerWidth - spotlightRect.left + gap,
      };
    } else if (pos === 'bottom') {
      tooltipStyle = {
        top: spotlightRect.top + spotlightRect.height + gap,
        left: Math.max(16, spotlightRect.left),
      };
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={finish}>
        {spotlightRect && !isWelcome ? (
          <div
            className="absolute rounded-xl"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              transition: 'top 0.4s ease, left 0.4s ease, width 0.4s ease, height 0.4s ease',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/70" />
        )}
      </div>

      {/* Tooltip / Welcome card */}
      <div
        className={`fixed z-[9999] transition-opacity duration-200 ${
          transitioning ? 'opacity-0' : 'opacity-100'
        } ${
          isWelcome ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={!isWelcome ? tooltipStyle : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-white rounded-2xl shadow-2xl p-5 ${
          isWelcome ? 'max-w-md text-center' : 'max-w-xs'
        }`}>
          {/* Welcome icon */}
          {isWelcome && (
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-emerald-500' : i < step ? 'w-2 bg-emerald-300' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
            <span className="ml-auto text-[10px] text-gray-400 font-medium">
              {step + 1} of {STEPS.length}
            </span>
          </div>

          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {current.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            {current.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={finish}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                {step < STEPS.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-3 h-3" />
                  </>
                ) : (
                  "Let's go!"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
