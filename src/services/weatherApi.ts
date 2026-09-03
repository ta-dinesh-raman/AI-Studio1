import {
  GeoLocation,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  AirQualityData,
  WeatherIntelligence,
  WeatherDataPayload,
} from '../types/weather';
import { getWeatherCondition, getAqiCategory, formatDayName } from '../utils/weatherUtils';

export async function searchCities(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length === 0) return [];
  try {
    const res = await fetch(`/api/geocoding?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) {
      // Direct client fallback to open-meteo if server route isn't available
      const direct = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`
      );
      if (!direct.ok) return [];
      const d = await direct.json();
      return (d.results || []).map(mapGeoLocation);
    }
    const data = await res.json();
    return (data.results || []).map(mapGeoLocation);
  } catch (err) {
    console.error('Failed to search cities:', err);
    return [];
  }
}

function mapGeoLocation(item: any): GeoLocation {
  return {
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    country_code: item.country_code,
    admin1: item.admin1,
    timezone: item.timezone,
    population: item.population,
  };
}

export async function fetchCompleteWeather(location: GeoLocation): Promise<WeatherDataPayload> {
  const { latitude, longitude, timezone } = location;
  const tz = timezone || 'auto';

  let rawWeather: any = null;
  let rawAqi: any = null;

  try {
    const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}&timezone=${encodeURIComponent(tz)}`);
    if (res.ok) {
      const data = await res.json();
      rawWeather = data.weather;
      rawAqi = data.airQuality;
    } else {
      throw new Error('API route failed, using direct client fetch');
    }
  } catch (err) {
    // Direct client fallback
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max&timezone=${encodeURIComponent(
      tz
    )}&forecast_days=10`;

    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=${encodeURIComponent(
      tz
    )}`;

    const [wRes, aRes] = await Promise.all([fetch(weatherUrl), fetch(aqiUrl).catch(() => null)]);
    rawWeather = await wRes.json();
    if (aRes && aRes.ok) {
      try {
        rawAqi = await aRes.json();
      } catch (e) {}
    }
  }

  // Parse Current Weather
  const cur = rawWeather.current;
  const isDay = cur.is_day === 1;
  const conditionInfo = getWeatherCondition(cur.weather_code, isDay);

  const current: CurrentWeather = {
    temperature: Math.round(cur.temperature_2m * 10) / 10,
    apparentTemperature: Math.round(cur.apparent_temperature * 10) / 10,
    relativeHumidity: cur.relative_humidity_2m,
    precipitation: cur.precipitation || 0,
    weatherCode: cur.weather_code,
    conditionName: conditionInfo.label,
    isDay,
    cloudCover: cur.cloud_cover,
    pressureMsl: Math.round(cur.pressure_msl),
    surfacePressure: cur.surface_pressure ? Math.round(cur.surface_pressure) : undefined,
    windSpeed: Math.round(cur.wind_speed_10m * 10) / 10,
    windDirection: cur.wind_direction_10m,
    windGusts: Math.round(cur.wind_gusts_10m * 10) / 10,
    uvIndex: Math.round((cur.uv_index || 0) * 10) / 10,
  };

  // Parse Hourly Forecast (next 48 hours)
  const hourlyRaw = rawWeather.hourly;
  const hourly: HourlyForecastItem[] = [];
  const nowIso = new Date().toISOString();
  // Find current hour index or start from index 0
  const startIndex = 0;
  const totalHours = Math.min(48, hourlyRaw.time.length);

  for (let i = startIndex; i < totalHours; i++) {
    const timeStr = hourlyRaw.time[i];
    const hourDate = new Date(timeStr);
    const hourDisplay = hourDate.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const code = hourlyRaw.weather_code[i];
    // approximate daytime if between 6am and 8pm or check sunrise
    const hourNum = hourDate.getHours();
    const itemIsDay = hourNum >= 6 && hourNum < 20;

    hourly.push({
      time: timeStr,
      timestamp: hourDate.getTime(),
      hourDisplay,
      temperature: Math.round(hourlyRaw.temperature_2m[i] * 10) / 10,
      apparentTemperature: Math.round(hourlyRaw.apparent_temperature[i] * 10) / 10,
      precipitationProbability: hourlyRaw.precipitation_probability[i] || 0,
      precipitation: Math.round((hourlyRaw.precipitation[i] || 0) * 10) / 10,
      weatherCode: code,
      conditionName: getWeatherCondition(code, itemIsDay).label,
      cloudCover: hourlyRaw.cloud_cover[i] || 0,
      windSpeed: Math.round(hourlyRaw.wind_speed_10m[i] * 10) / 10,
      windDirection: hourlyRaw.wind_direction_10m[i] || 0,
      windGusts: hourlyRaw.wind_gusts_10m ? Math.round(hourlyRaw.wind_gusts_10m[i] * 10) / 10 : 0,
      uvIndex: hourlyRaw.uv_index ? Math.round(hourlyRaw.uv_index[i] * 10) / 10 : 0,
      visibility: hourlyRaw.visibility ? Math.round(hourlyRaw.visibility[i] / 1000) : 10,
      isDay: itemIsDay,
    });
  }

  // Parse Daily Forecast
  const dailyRaw = rawWeather.daily;
  const daily: DailyForecastItem[] = [];
  for (let i = 0; i < (dailyRaw.time?.length || 0); i++) {
    const dateStr = dailyRaw.time[i];
    const code = dailyRaw.weather_code[i];
    const dateObj = new Date(dateStr + 'T00:00:00');

    daily.push({
      date: dateStr,
      dayName: formatDayName(dateStr),
      dateDisplay: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      weatherCode: code,
      conditionName: getWeatherCondition(code, true).label,
      tempMax: Math.round(dailyRaw.temperature_2m_max[i]),
      tempMin: Math.round(dailyRaw.temperature_2m_min[i]),
      apparentTempMax: Math.round(dailyRaw.apparent_temperature_max[i]),
      apparentTempMin: Math.round(dailyRaw.apparent_temperature_min[i]),
      sunrise: dailyRaw.sunrise[i],
      sunset: dailyRaw.sunset[i],
      uvIndexMax: Math.round(dailyRaw.uv_index_max[i] * 10) / 10,
      precipitationSum: Math.round(dailyRaw.precipitation_sum[i] * 10) / 10,
      precipitationProbabilityMax: dailyRaw.precipitation_probability_max[i] || 0,
      windSpeedMax: Math.round(dailyRaw.wind_speed_10m_max[i] * 10) / 10,
    });
  }

  // Parse Air Quality
  let airQuality: AirQualityData | null = null;
  if (rawAqi && rawAqi.current) {
    const aqiCur = rawAqi.current;
    const aqiInfo = getAqiCategory(aqiCur.us_aqi);
    airQuality = {
      usAqi: aqiCur.us_aqi,
      europeanAqi: aqiCur.european_aqi,
      pm25: aqiCur.pm2_5 ? Math.round(aqiCur.pm2_5 * 10) / 10 : undefined,
      pm10: aqiCur.pm10 ? Math.round(aqiCur.pm10 * 10) / 10 : undefined,
      co: aqiCur.carbon_monoxide ? Math.round(aqiCur.carbon_monoxide) : undefined,
      no2: aqiCur.nitrogen_dioxide ? Math.round(aqiCur.nitrogen_dioxide) : undefined,
      so2: aqiCur.sulphur_dioxide ? Math.round(aqiCur.sulphur_dioxide) : undefined,
      ozone: aqiCur.ozone ? Math.round(aqiCur.ozone) : undefined,
      aqiLevel: aqiInfo.level,
      description: aqiInfo.description,
    };
  }

  return {
    location,
    current,
    hourly,
    daily,
    airQuality,
    intelligence: null, // to be loaded asynchronously or on request
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function fetchWeatherIntelligence(
  payload: WeatherDataPayload
): Promise<WeatherIntelligence> {
  try {
    const res = await fetch('/api/ai-intelligence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city: payload.location.name,
        country: payload.location.country,
        currentWeather: payload.current,
        dailyForecast: payload.daily.slice(0, 4),
        airQuality: payload.airQuality,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        ...data.brief,
        isAIGenerated: data.isAIGenerated ?? false,
        source: data.source || 'gemini',
      };
    }
  } catch (err) {
    console.warn('Failed to fetch AI intelligence from server, generating client-side intelligence:', err);
  }

  // Client-side fallback intelligence generator
  return generateClientIntelligence(payload);
}

function generateClientIntelligence(payload: WeatherDataPayload): WeatherIntelligence {
  const { current, location } = payload;
  const temp = current.temperature;
  const isRain = current.precipitation > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(current.weatherCode);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(current.weatherCode);
  const isWindy = current.windSpeed > 24;
  const uv = current.uvIndex;

  let outerwear = 'Light jacket or casual blazer';
  let tops = 'Breathable cotton t-shirt';
  let bottoms = 'Chinos or casual denim';
  let footwear = 'Comfortable daily sneakers';
  const accessories: string[] = [];

  if (temp < 5) {
    outerwear = 'Thermal insulated winter parka';
    tops = 'Wool sweater or fleece pullover';
    bottoms = 'Insulated or heavyweight trousers';
    footwear = 'Waterproof warm boots';
    accessories.push('Knit beanie', 'Warm gloves', 'Scarf');
  } else if (temp < 15) {
    outerwear = 'Midweight jacket or trench';
    tops = 'Long sleeve knit or sweatshirt';
    bottoms = 'Denim jeans or tailored pants';
    footwear = 'Comfortable closed-toe shoes';
  } else if (temp > 27) {
    outerwear = 'No jacket required';
    tops = 'Lightweight linen shirt or tank';
    bottoms = 'Breathable shorts or linen pants';
    footwear = 'Ventilated sneakers or sandals';
  }

  if (isRain) {
    accessories.push('Windproof umbrella', 'Water-resistant footwear');
  }
  if (uv >= 3) {
    accessories.push('Polarized Sunglasses (UV400)', 'SPF 30+ sunscreen');
  }
  if (uv >= 8) {
    accessories.push('Protective wide-brim sun hat');
  }

  return {
    executiveSummary: `Atmospheric conditions in ${location.name} feature ${current.conditionName.toLowerCase()} at ${temp}°C (feels like ${current.apparentTemperature}°C). ${
      isRain
        ? 'Precipitation is in effect; plan outdoor transit accordingly.'
        : isWindy
        ? 'Breezy winds increase chill factor during shaded or evening hours.'
        : 'Stable, comfortable weather conditions for both indoor and outdoor activities.'
    }`,
    clothingAdvice: {
      summary: `${temp < 12 ? 'Warm structured layering' : temp > 24 ? 'Lightweight and ventilated' : 'Flexible transitional layers'}${
        isRain ? ' with rain defense' : ''
      }`,
      outerwear,
      tops,
      bottoms,
      footwear,
      accessories,
    },
    activities: [
      {
        name: 'Running & Jogging',
        score: isRain ? 40 : temp > 30 ? 50 : temp < 2 ? 45 : 90,
        verdict: isRain ? 'Caution' : temp > 30 ? 'Fair' : 'Optimal',
        bestWindow: current.isDay ? 'Morning hours (07:00 - 09:30)' : 'Evening (18:00 - 20:00)',
        guidance: isRain ? 'Slick pavement; maintain cautious cadence' : 'Crisp air and favorable temperature for aerobic training.',
      },
      {
        name: 'Cycling & Commuting',
        score: isWindy ? 55 : isRain ? 35 : 88,
        verdict: isRain ? 'Caution' : isWindy ? 'Fair' : 'Optimal',
        bestWindow: 'Mid-morning or late afternoon',
        guidance: isWindy ? 'Wind gusts will affect cross-street aerodynamics' : 'Clear roads and comfortable headwinds.',
      },
      {
        name: 'Outdoor Dining & Patios',
        score: isRain ? 25 : temp < 14 ? 50 : temp > 34 ? 60 : 95,
        verdict: isRain ? 'Unfavorable' : temp < 14 ? 'Fair' : 'Optimal',
        bestWindow: '12:30 - 15:00 for sunny terrace lunch',
        guidance: isRain ? 'Indoor or covered shelter strongly advised' : 'Pleasant ambient conditions for outdoor dining.',
      },
      {
        name: 'Hiking & Nature Trails',
        score: isRain ? 35 : 85,
        verdict: isRain ? 'Caution' : 'Optimal',
        bestWindow: 'Early afternoon daylight',
        guidance: isRain ? 'Trail mud and exposed rock slip hazards' : 'Excellent ground visibility and ambient comfort.',
      },
      {
        name: 'Stargazing & Evening Walks',
        score: current.cloudCover > 60 ? 30 : 85,
        verdict: current.cloudCover > 60 ? 'Unfavorable' : 'Optimal',
        bestWindow: '21:00 - 23:00',
        guidance: current.cloudCover > 60 ? 'Heavy cloud coverage conceals celestial visibility' : 'Clear skies offer distinct viewing of constellations.',
      },
    ],
    healthAdvisories: [
      {
        category: 'UV & Solar Exposure',
        level: uv >= 8 ? 'Very High' : uv >= 6 ? 'High' : uv >= 3 ? 'Moderate' : 'Low',
        advice: uv >= 6 ? 'Intense solar radiation. Apply SPF 50 and limit direct sun between 11:00 and 15:00.' : 'Sun safety recommended during prolonged exposure.',
      },
      {
        category: 'Hydration & Heat Index',
        level: temp > 28 ? 'Elevated' : 'Normal',
        advice: temp > 28 ? 'Accelerated fluid loss. Increase water and electrolyte intake.' : 'Standard 2L daily water intake.',
      },
      {
        category: 'Respiratory Comfort',
        level: 'Normal',
        advice: 'Good atmospheric ventilation supports unhindered outdoor breathing.',
      },
      {
        category: 'Barometric Stability',
        level: current.pressureMsl < 1010 ? 'Shifting' : 'Stable',
        advice: current.pressureMsl < 1010 ? 'Mild pressure dip may provoke sinus tension or mild fatigue.' : 'Steady atmospheric pressure favors balanced focus.',
      },
    ],
    travelAndCommute: {
      roadTraction: isSnow ? 'Snow/Ice Hazard' : isRain ? 'Wet / Reduced Friction' : 'Dry / Optimal',
      visibility: current.cloudCover > 90 && isRain ? 'Moderate' : 'Unrestricted',
      driverAdvisory: isRain ? 'Increase following space and activate wiper sensor.' : 'Normal commute conditions throughout arterial routes.',
      bestDepartureTime: 'Off-peak daylight hours for seamless travel.',
    },
    isAIGenerated: false,
    source: 'intelligence_engine',
  };
}
