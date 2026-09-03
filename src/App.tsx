import { useState, useEffect, useCallback } from 'react';
import {
  CloudSun,
  Loader2,
  AlertCircle,
  Sparkles,
  BarChart3,
  Calendar,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import {
  GeoLocation,
  WeatherDataPayload,
  TemperatureUnit,
  SpeedUnit,
  WeatherIntelligence,
} from './types/weather';
import { PRESET_CITIES } from './utils/weatherUtils';
import { fetchCompleteWeather, fetchWeatherIntelligence } from './services/weatherApi';
import { Header } from './components/Header';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { WeatherCharts } from './components/WeatherCharts';
import { ForecastSection } from './components/ForecastSection';
import { IntelligenceRecommendations } from './components/IntelligenceRecommendations';
import { AirQualityCard } from './components/AirQualityCard';

export default function App() {
  const [location, setLocation] = useState<GeoLocation>(PRESET_CITIES[0]); // Default to New York
  const [weatherData, setWeatherData] = useState<WeatherDataPayload | null>(null);
  const [intelligence, setIntelligence] = useState<WeatherIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>('C');
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('kmh');
  const [activeTab, setActiveTab] = useState<'all' | 'charts' | 'forecast' | 'recommendations'>('all');

  // Load weather data for a given location
  const loadWeather = useCallback(async (targetLocation: GeoLocation) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCompleteWeather(targetLocation);
      setWeatherData(data);
      setIsLoading(false);

      // Load intelligence recommendations in parallel
      setIsLoadingIntelligence(true);
      fetchWeatherIntelligence(data)
        .then((intel) => {
          setIntelligence(intel);
          setIsLoadingIntelligence(false);
        })
        .catch((err) => {
          console.warn('Intelligence fetch error:', err);
          setIsLoadingIntelligence(false);
        });
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      setError(err.message || 'Unable to retrieve weather data for this location. Please try again.');
      setIsLoading(false);
      setIsLoadingIntelligence(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(location);
  }, [location, loadWeather]);

  const handleSelectCity = (newCity: GeoLocation) => {
    setLocation(newCity);
  };

  const handleRefresh = () => {
    loadWeather(location);
  };

  const handleRefreshIntelligence = async () => {
    if (!weatherData) return;
    setIsLoadingIntelligence(true);
    try {
      const intel = await fetchWeatherIntelligence(weatherData);
      setIntelligence(intel);
    } catch (e) {
      console.error('Failed to refresh intelligence:', e);
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Attempt reverse geocoding via Open-Meteo or fallback naming
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${latitude.toFixed(2)},${longitude.toFixed(2)}&count=1&language=en&format=json`
          ).catch(() => null);

          let detectedName = 'Current Location';
          let detectedCountry = '';
          let detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

          if (res && res.ok) {
            const data = await res.json();
            if (data.results && data.results[0]) {
              detectedName = data.results[0].name;
              detectedCountry = data.results[0].country;
              detectedTz = data.results[0].timezone || detectedTz;
            }
          }

          const customLocation: GeoLocation = {
            id: Date.now(),
            name: detectedName,
            country: detectedCountry,
            latitude,
            longitude,
            timezone: detectedTz,
          };

          setLocation(customLocation);
        } catch (err) {
          const fallbackLoc: GeoLocation = {
            id: Date.now(),
            name: 'Current Location',
            latitude,
            longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          setLocation(fallbackLoc);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setIsLocating(false);
        setError('Location access was denied or timed out. Please choose a city from the list or search.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors selection:bg-blue-500/20">
      {/* Header */}
      <Header
        currentLocation={location}
        onSelectCity={handleSelectCity}
        tempUnit={tempUnit}
        onToggleTempUnit={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
        speedUnit={speedUnit}
        onToggleSpeedUnit={() => setSpeedUnit((u) => (u === 'kmh' ? 'mph' : 'kmh'))}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold underline hover:no-underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && !weatherData && (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-500">
              Gathering atmospheric data for {location.name}...
            </p>
          </div>
        )}

        {/* Weather Dashboard Content */}
        {weatherData && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* 1. Hero Current Weather Card */}
            <CurrentWeatherCard
              current={weatherData.current}
              dailyToday={weatherData.daily[0]}
              location={weatherData.location}
              tempUnit={tempUnit}
              speedUnit={speedUnit}
              lastUpdated={weatherData.lastUpdated}
            />

            {/* View Selector Tabs */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  id="tab-all-views"
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  Complete Dashboard
                </button>

                <button
                  id="tab-charts"
                  onClick={() => setActiveTab('charts')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'charts'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Interactive Charts</span>
                </button>

                <button
                  id="tab-forecast"
                  onClick={() => setActiveTab('forecast')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'forecast'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Forecast & Hourly</span>
                </button>

                <button
                  id="tab-recommendations"
                  onClick={() => setActiveTab('recommendations')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'recommendations'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Intelligence & Recommendations</span>
                </button>
              </div>

              {isLoadingIntelligence && (
                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-blue-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing intelligence...</span>
                </div>
              )}
            </div>

            {/* Tab: All or Recommendations */}
            {(activeTab === 'all' || activeTab === 'recommendations') && (
              <IntelligenceRecommendations
                intelligence={intelligence}
                isLoading={isLoadingIntelligence}
                onRefreshIntelligence={handleRefreshIntelligence}
                cityName={location.name}
              />
            )}

            {/* Tab: All or Charts */}
            {(activeTab === 'all' || activeTab === 'charts') && (
              <WeatherCharts
                hourly={weatherData.hourly}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
              />
            )}

            {/* Tab: All or Forecast */}
            {(activeTab === 'all' || activeTab === 'forecast') && (
              <ForecastSection
                hourly={weatherData.hourly}
                daily={weatherData.daily}
                tempUnit={tempUnit}
                speedUnit={speedUnit}
              />
            )}

            {/* Air Quality & Atmosphere Section */}
            {(activeTab === 'all' || activeTab === 'forecast') && (
              <AirQualityCard airQuality={weatherData.airQuality} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-500">
            Weather Intelligence Dashboard • Global Open-Meteo & Gemini AI Analytics
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            Real-time meteorological observations and predictive modeling
          </span>
        </div>
      </footer>
    </div>
  );
}
