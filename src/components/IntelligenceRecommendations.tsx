import { useState } from 'react';
import {
  Sparkles,
  Shirt,
  Footprints,
  Compass,
  HeartPulse,
  Car,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Umbrella,
  Sun,
  Flame,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { WeatherIntelligence } from '../types/weather';

interface IntelligenceRecommendationsProps {
  intelligence: WeatherIntelligence | null;
  isLoading: boolean;
  onRefreshIntelligence: () => void;
  cityName: string;
}

export function IntelligenceRecommendations({
  intelligence,
  isLoading,
  onRefreshIntelligence,
  cityName,
}: IntelligenceRecommendationsProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'clothing' | 'activities' | 'health' | 'travel'>('all');

  if (!intelligence) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-500">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
          Synthesizing Weather Intelligence
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Analyzing real-time atmospheric metrics to generate personalized activity, wardrobe, and commute guidance for {cityName}...
        </p>
      </div>
    );
  }

  const {
    executiveSummary,
    clothingAdvice,
    activities,
    healthAdvisories,
    travelAndCommute,
    isAIGenerated,
    source,
  } = intelligence;

  return (
    <div id="weather-recommendations-section" className="space-y-4">
      {/* Executive Briefing Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/40 p-6 sm:p-7 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Weather Intelligence Briefing
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isAIGenerated
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {isAIGenerated ? 'Gemini AI Intelligence' : 'Algorithmic Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Actionable recommendations tailored for {cityName}
              </p>
            </div>
          </div>

          {/* Refresh intelligence button */}
          <button
            id="refresh-intelligence-btn"
            onClick={onRefreshIntelligence}
            disabled={isLoading}
            className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:border-blue-200 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        </div>

        <p className="text-sm text-slate-700 font-normal leading-relaxed mt-4">
          {executiveSummary}
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          id="recs-filter-all"
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Overview (All)
        </button>

        <button
          id="recs-filter-clothing"
          onClick={() => setActiveCategory('clothing')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeCategory === 'clothing'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Clothing & Gear</span>
        </button>

        <button
          id="recs-filter-activities"
          onClick={() => setActiveCategory('activities')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeCategory === 'activities'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>Activities Index</span>
        </button>

        <button
          id="recs-filter-health"
          onClick={() => setActiveCategory('health')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeCategory === 'health'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Health Advisories</span>
        </button>

        <button
          id="recs-filter-travel"
          onClick={() => setActiveCategory('travel')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeCategory === 'travel'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Travel & Commute</span>
        </button>
      </div>

      {/* Wardrobe & Gear Guide */}
      {(activeCategory === 'all' || activeCategory === 'clothing') && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shadow-sm shadow-amber-100">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Smart Wardrobe & Gear Recommendations
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Thermal comfort and weather defense
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
              {clothingAdvice.summary}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Outerwear
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {clothingAdvice.outerwear}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Tops & Layers
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {clothingAdvice.tops}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Bottoms
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {clothingAdvice.bottoms}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Footwear
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {clothingAdvice.footwear}
              </div>
            </div>
          </div>

          {/* Essential Accessories */}
          {clothingAdvice.accessories && clothingAdvice.accessories.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recommended Accessories & Protection:
              </div>
              <div className="flex flex-wrap gap-2">
                {clothingAdvice.accessories.map((acc, i) => (
                  <span
                    key={`acc-${i}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Suitability Index */}
      {(activeCategory === 'all' || activeCategory === 'activities') && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Outdoor Activities & Sports Index
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Suitability score (0-100) and optimal time windows
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activities.map((act, idx) => {
              const scoreColor =
                act.score >= 80
                  ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                  : act.score >= 60
                  ? 'text-blue-700 border-blue-300 bg-blue-50'
                  : act.score >= 40
                  ? 'text-amber-700 border-amber-300 bg-amber-50'
                  : 'text-rose-700 border-rose-300 bg-rose-50';

              return (
                <div
                  key={`activity-${idx}`}
                  id={`activity-card-${idx}`}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2.5 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {act.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${scoreColor}`}>
                        {act.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span className="text-slate-400 font-normal">Verdict:</span>
                    <span>{act.verdict}</span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-700">
                      Best: {act.bestWindow}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60">
                    {act.guidance}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Health & Environmental Advisories */}
      {(activeCategory === 'all' || activeCategory === 'health') && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shadow-sm shadow-rose-100">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Health & Environmental Advisories
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Solar, hydration, respiratory, and barometric sensitivity
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {healthAdvisories.map((advisory, idx) => (
              <div
                key={`health-adv-${idx}`}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {advisory.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {advisory.level}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {advisory.advice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Travel & Commute Intelligence */}
      {(activeCategory === 'all' || activeCategory === 'travel') && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shadow-sm shadow-blue-100">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Travel & Commute Intelligence
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Road traction, atmospheric visibility, and optimal transit windows
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Road Traction
              </span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {travelAndCommute.roadTraction}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Tire grip and pavement friction index
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Atmospheric Visibility
              </span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {travelAndCommute.visibility}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Fog, mist, and precipitation scatter
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Optimal Departure Window
              </span>
              <div className="text-sm font-bold text-blue-600 mt-1">
                {travelAndCommute.bestDepartureTime}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Minimize weather and traffic friction
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/80 text-xs text-slate-700 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 mr-1">
                Commuter Advisory:
              </span>
              {travelAndCommute.driverAdvisory}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
