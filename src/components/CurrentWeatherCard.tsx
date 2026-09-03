import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
  CloudHail,
  CloudDrizzle,
  CloudFog,
  Snowflake,
  SunMedium,
  MoonStar,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  ShieldAlert,
  Compass,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  CurrentWeather,
  DailyForecastItem,
  GeoLocation,
  TemperatureUnit,
  SpeedUnit,
} from '../types/weather';
import {
  formatTemp,
  formatSpeed,
  degToCompass,
  getUvCategory,
  formatTimeOnly,
} from '../utils/weatherUtils';

interface CurrentWeatherCardProps {
  current: CurrentWeather;
  dailyToday?: DailyForecastItem;
  location: GeoLocation;
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  lastUpdated: string;
}

export function CurrentWeatherCard({
  current,
  dailyToday,
  location,
  tempUnit,
  speedUnit,
  lastUpdated,
}: CurrentWeatherCardProps) {
  const uvInfo = getUvCategory(current.uvIndex);
  const windDir = degToCompass(current.windDirection);

  const renderWeatherIcon = (code: number, isDay: boolean, className: string = 'w-16 h-16') => {
    switch (code) {
      case 0:
        return isDay ? <Sun className={`${className} text-amber-500`} /> : <Moon className={`${className} text-indigo-300`} />;
      case 1:
        return isDay ? <SunMedium className={`${className} text-amber-400`} /> : <MoonStar className={`${className} text-indigo-300`} />;
      case 2:
        return isDay ? <CloudSun className={`${className} text-sky-500`} /> : <CloudMoon className={`${className} text-slate-400`} />;
      case 3:
        return <Cloud className={`${className} text-slate-400`} />;
      case 45:
      case 48:
        return <CloudFog className={`${className} text-teal-400`} />;
      case 51:
      case 53:
      case 55:
        return <CloudDrizzle className={`${className} text-sky-400`} />;
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return <CloudRain className={`${className} text-blue-500`} />;
      case 66:
      case 67:
        return <CloudHail className={`${className} text-cyan-400`} />;
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return <Snowflake className={`${className} text-sky-300`} />;
      case 95:
      case 96:
      case 99:
        return <CloudLightning className={`${className} text-amber-500`} />;
      default:
        return <CloudSun className={`${className} text-sky-400`} />;
    }
  };

  // Daylight progress calculation
  let daylightPercentage = 50;
  if (dailyToday?.sunrise && dailyToday?.sunset) {
    try {
      const now = new Date().getTime();
      const rise = new Date(dailyToday.sunrise).getTime();
      const set = new Date(dailyToday.sunset).getTime();
      if (now <= rise) {
        daylightPercentage = 0;
      } else if (now >= set) {
        daylightPercentage = 100;
      } else {
        daylightPercentage = Math.round(((now - rise) / (set - rise)) * 100);
      }
    } catch {
      daylightPercentage = 50;
    }
  }

  return (
    <div id="current-weather-section" className="space-y-4">
      {/* Primary Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Professional Polish top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Column: Location & Big Temp */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                Live Observations
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Updated {lastUpdated}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {location.name}
                {location.country && (
                  <span className="text-base sm:text-lg font-normal text-slate-500 ml-2">
                    {location.admin1 ? `${location.admin1}, ` : ''}
                    {location.country}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Lat: {location.latitude.toFixed(2)}° • Lon: {location.longitude.toFixed(2)}°
                {location.timezone && ` • ${location.timezone}`}
              </p>
            </div>

            {/* Huge Temp and Condition */}
            <div className="flex items-baseline gap-5 pt-1">
              <div className="text-6xl sm:text-7xl font-bold tracking-tighter text-slate-900">
                {formatTemp(current.temperature, tempUnit)}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-700">
                  Feels like {formatTemp(current.apparentTemperature, tempUnit)}
                </div>
                {dailyToday && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center text-emerald-600 font-semibold">
                      <ArrowUp className="w-3 h-3 mr-0.5" />
                      {formatTemp(dailyToday.tempMax, tempUnit)}
                    </span>
                    <span className="flex items-center text-blue-600 font-semibold">
                      <ArrowDown className="w-3 h-3 mr-0.5" />
                      {formatTemp(dailyToday.tempMin, tempUnit)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Condition Banner */}
          <div className="flex items-center gap-5 sm:gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 self-start lg:self-auto min-w-[260px] shadow-2xs">
            <div className="shrink-0 animate-in fade-in zoom-in-95 duration-200">
              {renderWeatherIcon(current.weatherCode, current.isDay, 'w-14 h-14 sm:w-16 sm:h-16')}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Current Conditions
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900">
                {current.conditionName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">
                {current.precipitation > 0
                  ? `${current.precipitation} mm active rain`
                  : current.cloudCover > 60
                  ? `${current.cloudCover}% dense cloud cover`
                  : current.cloudCover > 20
                  ? `${current.cloudCover}% scattered clouds`
                  : 'Clear atmospheric clarity'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Microclimate Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Humidity */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Humidity</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {current.relativeHumidity}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {current.relativeHumidity < 35
              ? 'Dry ambient air'
              : current.relativeHumidity > 70
              ? 'High moisture'
              : 'Comfortable'}
          </div>
        </div>

        {/* Wind & Gusts */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Wind</span>
            <Wind className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 truncate">
            {formatSpeed(current.windSpeed, speedUnit)}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 font-medium">
            <Compass className="w-3 h-3 text-slate-400" />
            <span>
              {windDir} ({current.windDirection}°)
            </span>
          </div>
        </div>

        {/* UV Index */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">UV Index</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {current.uvIndex}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${uvInfo.badgeBg}`}>
              {uvInfo.label}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${
                current.uvIndex < 3
                  ? 'bg-emerald-500'
                  : current.uvIndex < 6
                  ? 'bg-amber-500'
                  : current.uvIndex < 8
                  ? 'bg-orange-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (current.uvIndex / 11) * 100)}%` }}
            />
          </div>
        </div>

        {/* Pressure */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Barometer</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {current.pressureMsl} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {current.pressureMsl > 1020
              ? 'High pressure'
              : current.pressureMsl < 1005
              ? 'Low trough'
              : 'Stable'}
          </div>
        </div>

        {/* Cloud Cover & Visibility */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Cloud Cover</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {current.cloudCover}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {current.cloudCover < 20
              ? 'Clear sky'
              : current.cloudCover < 70
              ? 'Scattered clouds'
              : 'Overcast'}
          </div>
        </div>

        {/* Sunrise & Sunset */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Daylight</span>
            <Sunrise className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between pt-0.5">
            <span>Rise: {dailyToday?.sunrise ? formatTimeOnly(dailyToday.sunrise) : '--:--'}</span>
          </div>
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Set: {dailyToday?.sunset ? formatTimeOnly(dailyToday.sunset) : '--:--'}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${daylightPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
