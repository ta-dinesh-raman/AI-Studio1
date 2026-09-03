import { Wind, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { AirQualityData } from '../types/weather';

interface AirQualityCardProps {
  airQuality: AirQualityData | null;
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  if (!airQuality || (!airQuality.usAqi && !airQuality.europeanAqi)) {
    return null;
  }

  const { usAqi, pm25, pm10, ozone, no2, so2, co, aqiLevel, description } = airQuality;

  const getAqiBarColor = (val: number = 0) => {
    if (val <= 50) return 'bg-emerald-500';
    if (val <= 100) return 'bg-amber-500';
    if (val <= 150) return 'bg-orange-500';
    if (val <= 200) return 'bg-rose-500';
    return 'bg-purple-500';
  };

  return (
    <div id="air-quality-section" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shadow-sm shadow-blue-100">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Air Quality & Environmental Index
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Atmospheric particulate and gas concentrations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 font-medium">US AQI:</span>
          <span className="text-xl font-bold text-slate-900">
            {usAqi || '--'}
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {aqiLevel}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${getAqiBarColor(usAqi || 30)} transition-all duration-500`}
            style={{ width: `${Math.min(100, ((usAqi || 30) / 250) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-600 font-medium">
          {description}
        </p>
      </div>

      {/* Pollutant Micro-grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PM2.5</span>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {pm25 !== undefined ? `${pm25} µg/m³` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Fine inhalable</span>
        </div>

        <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PM10</span>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {pm10 !== undefined ? `${pm10} µg/m³` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Coarse dust</span>
        </div>

        <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ozone (O₃)</span>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {ozone !== undefined ? `${ozone} µg/m³` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Ground level</span>
        </div>

        <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nitrogen (NO₂)</span>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {no2 !== undefined ? `${no2} µg/m³` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Vehicle exhaust</span>
        </div>

        <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sulphur (SO₂)</span>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {so2 !== undefined ? `${so2} µg/m³` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Industrial gas</span>
        </div>

        <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carbon (CO)</span>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {co !== undefined ? `${co} µg/m³` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Combustion</span>
        </div>
      </div>
    </div>
  );
}
