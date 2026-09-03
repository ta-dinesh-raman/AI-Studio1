export type TemperatureUnit = 'C' | 'F';
export type SpeedUnit = 'kmh' | 'mph';

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
  population?: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  dewPoint?: number;
  precipitation: number;
  weatherCode: number;
  conditionName: string;
  isDay: boolean;
  cloudCover: number;
  pressureMsl: number;
  surfacePressure?: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  visibility?: number;
}

export interface HourlyForecastItem {
  time: string;
  timestamp: number;
  hourDisplay: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  conditionName: string;
  cloudCover: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  visibility: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  dateDisplay: string;
  weatherCode: number;
  conditionName: string;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
}

export interface AirQualityData {
  usAqi?: number;
  europeanAqi?: number;
  pm25?: number;
  pm10?: number;
  co?: number;
  no2?: number;
  so2?: number;
  ozone?: number;
  aqiLevel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  description: string;
}

export interface ClothingAdvice {
  summary: string;
  outerwear: string;
  tops: string;
  bottoms: string;
  footwear: string;
  accessories: string[];
}

export interface ActivityIndex {
  name: string;
  score: number;
  verdict: 'Optimal' | 'Good' | 'Fair' | 'Caution' | 'Unfavorable' | 'Not Recommended';
  bestWindow: string;
  guidance: string;
}

export interface HealthAdvisory {
  category: string;
  level: string;
  advice: string;
}

export interface TravelAdvisory {
  roadTraction: string;
  visibility: string;
  driverAdvisory: string;
  bestDepartureTime: string;
}

export interface WeatherIntelligence {
  executiveSummary: string;
  clothingAdvice: ClothingAdvice;
  activities: ActivityIndex[];
  healthAdvisories: HealthAdvisory[];
  travelAndCommute: TravelAdvisory;
  isAIGenerated: boolean;
  source: string;
}

export interface WeatherDataPayload {
  location: GeoLocation;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData | null;
  intelligence: WeatherIntelligence | null;
  lastUpdated: string;
}
