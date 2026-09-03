import { useState } from 'react';
import {
  Calendar,
  Clock,
  Droplets,
  Wind,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudHail,
  CloudDrizzle,
  CloudFog,
  Snowflake,
  SunMedium,
  MoonStar,
  ChevronRight,
} from 'lucide-react';
import {
  HourlyForecastItem,
  DailyForecastItem,
  TemperatureUnit,
  SpeedUnit,
} from '../types/weather';
import { formatTemp, formatSpeed, formatTimeOnly } from '../utils/weatherUtils';

interface ForecastSectionProps {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
}

export function ForecastSection({
  hourly,
  daily,
  tempUnit,
  speedUnit,
}: ForecastSectionProps) {
  const [activeView, setActiveView] = useState<'both' | 'daily' | 'hourly'>('both');

  const renderSmallIcon = (code: number, isDay: boolean = true) => {
    const cls = 'w-5 h-5 shrink-0';
    switch (code) {
      case 0:
        return isDay ? <Sun className={`${cls} text-amber-500`} /> : <Moon className={`${cls} text-indigo-300`} />;
      case 1:
        return isDay ? <SunMedium className={`${cls} text-amber-400`} /> : <MoonStar className={`${cls} text-indigo-300`} />;
      case 2:
        return isDay ? <CloudSun className={`${cls} text-sky-500`} /> : <CloudMoon className={`${cls} text-slate-400`} />;
      case 3:
        return <Cloud className={`${cls} text-slate-400`} />;
      case 45:
      case 48:
        return <CloudFog className={`${cls} text-teal-400`} />;
      case 51:
      case 53:
      case 55:
        return <CloudDrizzle className={`${cls} text-sky-400`} />;
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return <CloudRain className={`${cls} text-blue-500`} />;
      case 66:
      case 67:
        return <CloudHail className={`${cls} text-cyan-400`} />;
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return <Snowflake className={`${cls} text-sky-300`} />;
      case 95:
      case 96:
      case 99:
        return <CloudLightning className={`${cls} text-amber-500`} />;
      default:
        return <CloudSun className={`${cls} text-sky-400`} />;
    }
  };

  // Find min and max across all daily forecasts to calculate temperature range bars
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const globalMin = Math.min(...(allMins.length ? allMins : [0]));
  const globalMax = Math.max(...(allMaxs.length ? allMaxs : [30]));
  const totalRange = Math.max(1, globalMax - globalMin);

  return (
    <div id="forecast-section" className="space-y-4">
      {/* 24-Hour Hourly Scrollable Carousel */}
      {(activeView === 'both' || activeView === 'hourly') && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shadow-sm shadow-blue-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Hourly Forecast (24 Hours)
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Continuous sequence outlook
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">Scroll horizontally →</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
            {hourly.slice(0, 24).map((item, idx) => {
              const isNow = idx === 0;
              return (
                <div
                  key={`hourly-${item.time}-${idx}`}
                  id={`hourly-item-${idx}`}
                  className={`flex flex-col items-center justify-between p-3.5 rounded-2xl min-w-[90px] border transition-all shrink-0 ${
                    isNow
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200/80 bg-slate-50/60 hover:border-blue-300 hover:bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-600">
                    {isNow ? 'Now' : item.hourDisplay}
                  </span>

                  <div className="my-2.5">
                    {renderSmallIcon(item.weatherCode, item.isDay)}
                  </div>

                  <span className="text-sm font-bold text-slate-900">
                    {formatTemp(item.temperature, tempUnit)}
                  </span>

                  {/* Precipitation chance indicator */}
                  <div className="mt-1.5 flex items-center gap-0.5">
                    {item.precipitationProbability > 0 ? (
                      <span className="flex items-center text-[11px] font-semibold text-blue-600">
                        <Droplets className="w-3 h-3 mr-0.5" />
                        {item.precipitationProbability}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatSpeed(item.windSpeed, speedUnit)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7-10 Day Extended Daily Forecast */}
      {(activeView === 'both' || activeView === 'daily') && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shadow-sm shadow-blue-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  10-Day Extended Forecast
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Long-range climate trends & variations
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">High / Low continuum</span>
          </div>

          <div className="divide-y divide-slate-100">
            {daily.map((day, idx) => {
              // Calculate width and offset for temperature range bar
              const leftPercent = Math.max(0, ((day.tempMin - globalMin) / totalRange) * 100);
              const barWidth = Math.max(8, ((day.tempMax - day.tempMin) / totalRange) * 100);

              return (
                <div
                  key={`daily-${day.date}`}
                  id={`daily-forecast-row-${idx}`}
                  className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-colors"
                >
                  {/* Left: Day & Condition */}
                  <div className="flex items-center gap-3 sm:w-48 shrink-0">
                    <div className="w-16">
                      <div className="text-sm font-bold text-slate-900">
                        {day.dayName}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {day.dateDisplay}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderSmallIcon(day.weatherCode, true)}
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[110px] hidden sm:inline">
                        {day.conditionName}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Rain Chance & Wind */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 sm:w-36">
                    {day.precipitationProbabilityMax > 15 ? (
                      <span className="flex items-center text-blue-600 font-semibold">
                        <Droplets className="w-3.5 h-3.5 mr-1" />
                        {day.precipitationProbabilityMax}% rain
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Dry & clear</span>
                    )}

                    <span className="hidden md:inline text-slate-400 font-medium">
                      {formatSpeed(day.windSpeedMax, speedUnit)}
                    </span>
                  </div>

                  {/* Right: Min / Max Temp & Range Bar */}
                  <div className="flex items-center gap-3 flex-1 max-w-xs justify-end">
                    <span className="text-xs font-semibold text-slate-500 w-10 text-right">
                      {formatTemp(day.tempMin, tempUnit)}
                    </span>

                    {/* Visual temperature continuum bar */}
                    <div className="flex-1 h-2 bg-slate-100 rounded-full relative overflow-hidden hidden xs:block">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 to-amber-500"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${barWidth}%`,
                        }}
                      />
                    </div>

                    <span className="text-xs font-bold text-slate-900 w-10 text-left">
                      {formatTemp(day.tempMax, tempUnit)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
