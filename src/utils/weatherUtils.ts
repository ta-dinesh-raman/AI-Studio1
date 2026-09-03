import { TemperatureUnit, SpeedUnit, GeoLocation } from '../types/weather';

export const PRESET_CITIES: GeoLocation[] = [
  { id: 5128581, name: 'New York', country: 'United States', country_code: 'US', admin1: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { id: 2643743, name: 'London', country: 'United Kingdom', country_code: 'GB', admin1: 'England', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 1850147, name: 'Tokyo', country: 'Japan', country_code: 'JP', admin1: 'Tokyo', latitude: 35.6895, longitude: 139.6917, timezone: 'Asia/Tokyo' },
  { id: 2988507, name: 'Paris', country: 'France', country_code: 'FR', admin1: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { id: 5391959, name: 'San Francisco', country: 'United States', country_code: 'US', admin1: 'California', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
  { id: 1880252, name: 'Singapore', country: 'Singapore', country_code: 'SG', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { id: 2147714, name: 'Sydney', country: 'Australia', country_code: 'AU', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
];

export interface WeatherConditionInfo {
  label: string;
  iconName: string;
  color: string;
  themeGradient: string;
}

export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        iconName: isDay ? 'Sun' : 'Moon',
        color: isDay ? 'text-amber-500' : 'text-indigo-300',
        themeGradient: isDay ? 'from-amber-500/10 to-blue-500/5' : 'from-indigo-950/40 to-slate-900/60',
      };
    case 1:
      return {
        label: isDay ? 'Mainly Clear' : 'Mostly Clear',
        iconName: isDay ? 'SunMedium' : 'MoonStar',
        color: isDay ? 'text-amber-400' : 'text-indigo-300',
        themeGradient: isDay ? 'from-amber-400/10 to-sky-500/5' : 'from-indigo-900/40 to-slate-900/60',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        color: isDay ? 'text-sky-500' : 'text-slate-400',
        themeGradient: 'from-sky-500/10 to-slate-500/5',
      };
    case 3:
      return {
        label: 'Overcast',
        iconName: 'Cloud',
        color: 'text-slate-500',
        themeGradient: 'from-slate-500/10 to-gray-600/5',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy & Misty',
        iconName: 'CloudFog',
        color: 'text-teal-500',
        themeGradient: 'from-teal-500/10 to-slate-600/5',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Light Drizzle',
        iconName: 'CloudDrizzle',
        color: 'text-sky-400',
        themeGradient: 'from-sky-500/10 to-cyan-600/5',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        iconName: 'CloudSnow',
        color: 'text-cyan-400',
        themeGradient: 'from-cyan-500/10 to-blue-600/5',
      };
    case 61:
      return {
        label: 'Slight Rain',
        iconName: 'CloudRain',
        color: 'text-blue-400',
        themeGradient: 'from-blue-500/10 to-sky-600/5',
      };
    case 63:
      return {
        label: 'Moderate Rain',
        iconName: 'CloudRain',
        color: 'text-blue-500',
        themeGradient: 'from-blue-600/15 to-slate-800/10',
      };
    case 65:
      return {
        label: 'Heavy Rain',
        iconName: 'CloudRainWind',
        color: 'text-blue-600',
        themeGradient: 'from-blue-700/20 to-slate-900/20',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        iconName: 'CloudHail',
        color: 'text-cyan-500',
        themeGradient: 'from-cyan-600/15 to-blue-800/10',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: 'Snowfall',
        iconName: 'Snowflake',
        color: 'text-sky-300',
        themeGradient: 'from-sky-300/15 to-slate-700/10',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        iconName: 'CloudRain',
        color: 'text-blue-500',
        themeGradient: 'from-blue-500/15 to-indigo-600/10',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        iconName: 'CloudSnow',
        color: 'text-indigo-300',
        themeGradient: 'from-indigo-400/15 to-sky-800/10',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
        color: 'text-amber-500',
        themeGradient: 'from-amber-600/20 to-purple-900/20',
      };
    case 96:
    case 99:
      return {
        label: 'Thunderstorm & Hail',
        iconName: 'CloudHail',
        color: 'text-amber-600',
        themeGradient: 'from-amber-700/20 to-slate-900/30',
      };
    default:
      return {
        label: 'Variable Clouds',
        iconName: 'CloudSun',
        color: 'text-slate-400',
        themeGradient: 'from-slate-500/10 to-slate-700/5',
      };
  }
}

export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  if (isNaN(celsius)) return '--';
  const val = unit === 'C' ? celsius : (celsius * 9) / 5 + 32;
  return `${Math.round(val)}°${unit}`;
}

export function convertTempValue(celsius: number, unit: TemperatureUnit): number {
  if (isNaN(celsius)) return 0;
  return unit === 'C' ? Math.round(celsius * 10) / 10 : Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

export function formatSpeed(kmh: number, unit: SpeedUnit): string {
  if (isNaN(kmh)) return '--';
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function convertSpeedValue(kmh: number, unit: SpeedUnit): number {
  if (isNaN(kmh)) return 0;
  return unit === 'mph' ? Math.round(kmh * 0.621371 * 10) / 10 : Math.round(kmh * 10) / 10;
}

export function degToCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export function getUvCategory(uv: number): { label: string; color: string; badgeBg: string } {
  if (uv < 3) return { label: 'Low', color: 'text-emerald-500', badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
  if (uv < 6) return { label: 'Moderate', color: 'text-amber-500', badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
  if (uv < 8) return { label: 'High', color: 'text-orange-500', badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
  if (uv < 11) return { label: 'Very High', color: 'text-rose-500', badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
  return { label: 'Extreme', color: 'text-purple-500', badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
}

export function getAqiCategory(aqi?: number): {
  level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  description: string;
  color: string;
  badgeBg: string;
} {
  if (!aqi || aqi <= 50) {
    return {
      level: 'Good',
      description: 'Air quality is satisfactory and poses little to no health risk.',
      color: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    };
  }
  if (aqi <= 100) {
    return {
      level: 'Moderate',
      description: 'Air quality is acceptable; unusually sensitive individuals should take precautions.',
      color: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    };
  }
  if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      description: 'Sensitive groups may experience health effects. General public is less affected.',
      color: 'text-orange-500',
      badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    };
  }
  if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      description: 'Everyone may begin to experience health effects; sensitive groups may feel serious effects.',
      color: 'text-rose-500',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };
  }
  if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      description: 'Health alert: risk of health effects is increased for everyone.',
      color: 'text-purple-500',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    };
  }
  return {
    level: 'Hazardous',
    description: 'Health warning of emergency conditions: everyone is more likely to be affected.',
    color: 'text-red-600',
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };
}

export function formatTimeOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return isoString;
  }
}

export function formatDayName(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return 'Today';

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString([], { weekday: 'short' });
  } catch {
    return dateString;
  }
}
