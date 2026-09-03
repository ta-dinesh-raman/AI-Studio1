import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!getAIClient(),
  });
});

// City Geocoding Search Endpoint (proxies Open-Meteo Geocoding)
app.get('/api/geocoding', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query || query.trim().length < 1) {
    return res.status(400).json({ error: 'Search query "q" is required' });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=10&language=en&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding service returned status ${response.status}`);
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error('Error fetching geocoding data:', err);
    return res.status(500).json({ error: 'Failed to search cities', message: err.message });
  }
});

// Weather and Forecast endpoint
app.get('/api/weather', async (req: Request, res: Response) => {
  const { lat, lon, timezone } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude (lat) and longitude (lon) are required' });
  }

  const tz = (timezone as string) || 'auto';

  try {
    // 1. Fetch comprehensive weather data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max&timezone=${encodeURIComponent(
      tz
    )}&forecast_days=10`;

    // 2. Fetch air quality data
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=${encodeURIComponent(
      tz
    )}`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl).catch(() => null),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather service returned ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();
    let aqiData = null;
    if (aqiRes && aqiRes.ok) {
      try {
        aqiData = await aqiRes.json();
      } catch (e) {
        // fallback gracefully if AQI parsing fails
      }
    }

    return res.json({
      weather: weatherData,
      airQuality: aqiData,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error fetching weather data:', err);
    return res.status(500).json({ error: 'Failed to fetch weather data', message: err.message });
  }
});

// Weather Intelligence Brief & Recommendations powered by Gemini
app.post('/api/ai-intelligence', async (req: Request, res: Response) => {
  const { city, country, currentWeather, dailyForecast, hourlyHighlights, airQuality } = req.body;

  if (!currentWeather) {
    return res.status(400).json({ error: 'currentWeather payload is required' });
  }

  const ai = getAIClient();

  // If Gemini is not configured, we provide intelligent fallback data
  if (!ai) {
    return res.json({
      source: 'algorithmic_engine',
      brief: generateAlgorithmicBrief(city, currentWeather),
      isAIGenerated: false,
      note: 'Rule-based intelligence engine active. For AI synthesized summaries, attach GEMINI_API_KEY.',
    });
  }

  try {
    const prompt = `You are a world-class meteorological intelligence assistant.
Analyze the following real-time weather and forecast data for ${city || 'the location'}${
      country ? `, ${country}` : ''
    }:

CURRENT CONDITIONS:
- Temperature: ${currentWeather.temperature}°C (Feels like: ${currentWeather.apparentTemperature}°C)
- Weather Condition: ${currentWeather.conditionName} (Code: ${currentWeather.weatherCode})
- Humidity: ${currentWeather.relativeHumidity}%
- Wind Speed: ${currentWeather.windSpeed} km/h (Gusts: ${currentWeather.windGusts || 'N/A'} km/h)
- UV Index: ${currentWeather.uvIndex}
- Cloud Cover: ${currentWeather.cloudCover}%
- Precipitation: ${currentWeather.precipitation} mm
- Day/Night: ${currentWeather.isDay ? 'Daytime' : 'Nighttime'}
${airQuality ? `- US AQI: ${airQuality.usAqi || 'N/A'}, PM2.5: ${airQuality.pm25 || 'N/A'}` : ''}

FORECAST CONTEXT:
${
  dailyForecast
    ? dailyForecast
        .slice(0, 3)
        .map(
          (d: any) =>
            `- ${d.date}: High ${d.tempMax}°C / Low ${d.tempMin}°C, Rain Chance: ${d.precipitationProbabilityMax}%, Condition: ${d.condition}`
        )
        .join('\n')
    : 'No extended forecast available'
}

Provide a comprehensive, crisp, structured weather intelligence analysis in strictly valid JSON format.
Do NOT enclose with markdown fences like \`\`\`json. Return pure JSON matching this exact structure:
{
  "executiveSummary": "A 2-3 sentence strategic verdict on how today feels, key weather transitions, and main watch-outs.",
  "clothingAdvice": {
    "summary": "Short headline (e.g., Light breathable layers with rain shell on hand)",
    "outerwear": "Specific jacket/coat recommendation",
    "tops": "Shirt/sweater recommendation",
    "bottoms": "Pants/shorts recommendation",
    "footwear": "Shoes or boots recommendation",
    "accessories": ["List of accessories like sunglasses, umbrella, thermal scarf, etc."]
  },
  "activities": [
    {
      "name": "Running & Jogging",
      "score": 85,
      "verdict": "Optimal / Good / Caution / Not Recommended",
      "bestWindow": "e.g., 07:00 - 09:30 before heat builds",
      "guidance": "Short actionable advice"
    },
    {
      "name": "Cycling & Commute",
      "score": 75,
      "verdict": "Good",
      "bestWindow": "e.g., Morning or late afternoon",
      "guidance": "Wind or road advice"
    },
    {
      "name": "Outdoor Dining & Social",
      "score": 90,
      "verdict": "Optimal",
      "bestWindow": "e.g., Lunch to late afternoon",
      "guidance": "Patio and shade advice"
    },
    {
      "name": "Hiking & Nature Walks",
      "score": 80,
      "verdict": "Good",
      "bestWindow": "e.g., Before 14:00",
      "guidance": "Trail dryness and hydration tips"
    },
    {
      "name": "Stargazing / Night Out",
      "score": 60,
      "verdict": "Caution",
      "bestWindow": "e.g., After 21:00",
      "guidance": "Cloud cover and evening temp drops"
    }
  ],
  "healthAdvisories": [
    {
      "category": "UV & Skin Protection",
      "level": "Low / Moderate / High / Very High",
      "advice": "Specific SPF or protective advice"
    },
    {
      "category": "Hydration & Energy",
      "level": "Normal / Elevated / High",
      "advice": "Water intake recommendation based on temp and humidity"
    },
    {
      "category": "Respiratory & Allergies",
      "level": "Low / Moderate / Sensitive",
      "advice": "Air quality and pollen context"
    },
    {
      "category": "Barometric & Joint Comfort",
      "level": "Stable / Fluctuating",
      "advice": "Pressure shift impact on migraine or joint sensitivity"
    }
  ],
  "travelAndCommute": {
    "roadTraction": "Dry / Damp / Slippery / Hazardous",
    "visibility": "Excellent / Moderate / Reduced / Poor",
    "driverAdvisory": "Brief commute advisory",
    "bestDepartureTime": "Suggested optimal window"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      // Clean possible stray markdown
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini JSON output, falling back to algorithmic:', parseErr);
      parsedData = generateAlgorithmicBrief(city, currentWeather);
    }

    return res.json({
      source: 'gemini-3.8-flash',
      brief: parsedData,
      isAIGenerated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error invoking Gemini for weather intelligence:', err);
    // Graceful fallback to algorithmic engine
    return res.json({
      source: 'algorithmic_engine_fallback',
      brief: generateAlgorithmicBrief(city, currentWeather),
      isAIGenerated: false,
      error: err.message,
    });
  }
});

// High-fidelity algorithmic intelligence generator when Gemini is not connected
function generateAlgorithmicBrief(city: string, current: any) {
  const temp = current.temperature;
  const isRain = current.precipitation > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(current.weatherCode);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(current.weatherCode);
  const isWindy = current.windSpeed > 25;
  const uv = current.uvIndex || 0;

  // Clothing logic
  let outerwear = 'Light windbreaker or light cardigan';
  let tops = 'Cotton t-shirt or breathable polo';
  let bottoms = 'Chinos or casual denim';
  let footwear = 'Breathable walking sneakers';
  const accessories: string[] = [];

  if (temp < 0) {
    outerwear = 'Heavy down parka with thermal lining';
    tops = 'Fleece or wool sweater with base thermal layer';
    bottoms = 'Insulated pants or windproof denim';
    footwear = 'Waterproof insulated winter boots';
    accessories.push('Thermal beanie', 'Insulated gloves', 'Wool scarf');
  } else if (temp < 10) {
    outerwear = 'Medium-weight insulated jacket or overcoat';
    tops = 'Long-sleeve henley or mid-weight knit sweater';
    bottoms = 'Regular jeans or heavy chinos';
    footwear = 'Closed leather shoes or sturdy sneakers';
    accessories.push('Light scarf or knit cap');
  } else if (temp < 18) {
    outerwear = 'Light bomber, denim jacket, or trench';
    tops = 'Long sleeve tee or lightweight sweater';
    bottoms = 'Comfortable trousers or denim';
    footwear = 'Casual lifestyle sneakers';
  } else if (temp > 28) {
    outerwear = 'No jacket required; ultra-light sun protection shirt optional';
    tops = 'Moisture-wicking linen shirt or cotton t-shirt';
    bottoms = 'Breathable shorts or linen trousers';
    footwear = 'Light ventilated sneakers or leather sandals';
  }

  if (isRain) {
    accessories.push('Compact windproof umbrella', 'Waterproof footwear spray');
  }
  if (uv >= 3) {
    accessories.push('UV400 Polarized Sunglasses', 'Broad-spectrum SPF 30+ sunscreen');
  }
  if (uv >= 7) {
    accessories.push('Wide-brim sun hat');
  }

  // Activities logic
  const runScore = isRain ? 35 : temp > 30 ? 45 : temp < 0 ? 40 : 88;
  const cycleScore = isWindy ? 50 : isRain ? 30 : 85;
  const diningScore = isRain ? 25 : temp < 14 ? 40 : temp > 33 ? 55 : 92;
  const hikeScore = isRain ? 30 : 82;
  const starScore = current.cloudCover > 60 ? 30 : 85;

  return {
    executiveSummary: `Conditions in ${city || 'your area'} are currently ${current.conditionName?.toLowerCase() || 'moderate'} at ${Math.round(
      temp
    )}°C with ${current.relativeHumidity}% humidity. ${
      isRain
        ? 'Precipitation is active; carry waterproof gear for outdoor transitions.'
        : isWindy
        ? 'Breezy winds will make it feel noticeably cooler than the thermometer reading.'
        : 'Overall favorable conditions for routine outdoor activities.'
    }`,
    clothingAdvice: {
      summary: `${temp < 10 ? 'Warm layered insulation' : temp > 24 ? 'Light breathable fabrics' : 'Comfortable balanced layers'}${
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
        score: runScore,
        verdict: runScore >= 80 ? 'Optimal' : runScore >= 60 ? 'Good' : 'Caution',
        bestWindow: current.isDay ? 'Early morning before peak warmth' : 'Early evening',
        guidance: isRain ? 'Wet surfaces; lower pace and choose grippy outsoles' : 'Comfortable ambient temperature for steady cardio.',
      },
      {
        name: 'Cycling & Commute',
        score: cycleScore,
        verdict: cycleScore >= 80 ? 'Optimal' : cycleScore >= 60 ? 'Good' : 'Caution',
        bestWindow: 'Mid-morning or post-rush afternoon',
        guidance: isWindy ? 'Expect crosswinds; maintain firm handlebar grip' : 'Smooth riding conditions on dry roadways.',
      },
      {
        name: 'Outdoor Dining & Social',
        score: diningScore,
        verdict: diningScore >= 80 ? 'Optimal' : diningScore >= 60 ? 'Good' : 'Unfavorable',
        bestWindow: '12:00 - 15:00 for lunch or patio coffee',
        guidance: isRain ? 'Opt for covered patio or indoor seating' : 'Pleasant ambient breeze for al fresco dining.',
      },
      {
        name: 'Hiking & Nature Walks',
        score: hikeScore,
        verdict: hikeScore >= 80 ? 'Optimal' : hikeScore >= 60 ? 'Good' : 'Caution',
        bestWindow: 'Midday daylight hours',
        guidance: isRain ? 'Trails will be muddy and slippery; take trekking poles' : 'Firm trail footing with good scenic visibility.',
      },
      {
        name: 'Stargazing / Night Walk',
        score: starScore,
        verdict: starScore >= 80 ? 'Optimal' : starScore >= 50 ? 'Fair' : 'Poor Visibility',
        bestWindow: '21:00 - 23:30',
        guidance: current.cloudCover > 50 ? 'Significant cloud canopy obscures celestial observation' : 'Clear night sky offers good stargazing potential.',
      },
    ],
    healthAdvisories: [
      {
        category: 'UV & Skin Protection',
        level: uv >= 8 ? 'Very High' : uv >= 6 ? 'High' : uv >= 3 ? 'Moderate' : 'Low',
        advice: uv >= 6 ? 'Intense UV exposure. Apply SPF 50 every 2 hours and seek shade.' : uv >= 3 ? 'Moderate UV index. Sunscreen recommended for prolonged exposure.' : 'Minimal risk. Normal protective measures suffice.',
      },
      {
        category: 'Hydration & Electrolytes',
        level: temp > 28 ? 'Elevated' : 'Normal',
        advice: temp > 28 ? 'High heat index causes rapid perspiration. Drink 500ml water every hour.' : 'Maintain baseline hydration of 2 liters throughout the day.',
      },
      {
        category: 'Respiratory & Allergies',
        level: 'Moderate',
        advice: 'Pollen and ambient particulates are within normal seasonal range.',
      },
      {
        category: 'Barometric Stability',
        level: current.pressureMsl < 1008 ? 'Fluctuating' : 'Stable',
        advice: current.pressureMsl < 1008 ? 'Lower atmospheric pressure may trigger sensitivity or mild tension headaches.' : 'Stable barometric pressure supports sustained focus and comfort.',
      },
    ],
    travelAndCommute: {
      roadTraction: isSnow ? 'Hazardous' : isRain ? 'Slippery' : 'Dry',
      visibility: current.cloudCover > 85 && isRain ? 'Moderate' : 'Excellent',
      driverAdvisory: isRain ? 'Extend braking distances and activate low-beam headlights.' : 'Normal driving conditions across metropolitan thoroughfares.',
      bestDepartureTime: 'Off-peak daylight hours for optimal visibility and traffic flow.',
    },
  };
}

// Vite middleware & static serving configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Weather Intelligence server running on port ${PORT}`);
  });
}

startServer();
