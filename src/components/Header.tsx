import { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Loader2,
  Thermometer,
  Wind,
  Check,
  RefreshCw,
} from 'lucide-react';
import { GeoLocation, TemperatureUnit, SpeedUnit } from '../types/weather';
import { PRESET_CITIES } from '../utils/weatherUtils';
import { searchCities } from '../services/weatherApi';

interface HeaderProps {
  currentLocation: GeoLocation;
  onSelectCity: (city: GeoLocation) => void;
  tempUnit: TemperatureUnit;
  onToggleTempUnit: () => void;
  speedUnit: SpeedUnit;
  onToggleSpeedUnit: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
}

export function Header({
  currentLocation,
  onSelectCity,
  tempUnit,
  onToggleTempUnit,
  speedUnit,
  onToggleSpeedUnit,
  onRefresh,
  isLoading,
  onUseCurrentLocation,
  isLocating,
}: HeaderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const cities = await searchCities(query);
      setResults(cities);
      setIsSearching(false);
      setIsOpen(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: GeoLocation) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          {/* Logo & App Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none text-slate-900 tracking-tight">
                  Weather<span className="text-blue-600">Intel</span>
                </h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
                  Intelligence & Forecasting
                </p>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                id="header-mobile-unit-toggle"
                onClick={onToggleTempUnit}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-100 text-slate-700"
              >
                °{tempUnit}
              </button>
              <button
                id="header-mobile-refresh"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-700"
                title="Refresh weather data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search Bar & Auto-suggest */}
          <div className="relative flex-1 max-w-xl" ref={dropdownRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                id="city-search-input"
                type="text"
                placeholder="Search any global city, capital, or region..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value.length >= 2) setIsOpen(true);
                }}
                onFocus={() => {
                  if (results.length > 0) setIsOpen(true);
                }}
                className="w-full pl-11 pr-24 py-2 text-sm bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-full text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none shadow-2xs"
              />

              <div className="absolute right-2.5 flex items-center gap-1">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin mr-1.5" />
                ) : null}
                <button
                  id="geolocation-search-btn"
                  onClick={onUseCurrentLocation}
                  disabled={isLocating}
                  title="Detect my current location"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-200/70 rounded-full transition-colors"
                >
                  <MapPin className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-bounce' : ''}`} />
                  <span className="hidden sm:inline">GPS</span>
                </button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in-50 duration-150">
                {results.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-100">
                    {results.map((city) => (
                      <button
                        key={`${city.id}-${city.latitude}-${city.longitude}`}
                        id={`city-option-${city.id}`}
                        onClick={() => handleSelect(city)}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50/60 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {city.name}
                              {city.admin1 && (
                                <span className="text-xs text-slate-400 font-normal ml-1.5">
                                  {city.admin1}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {city.country}
                              {city.timezone && ` • ${city.timezone}`}
                            </div>
                          </div>
                        </div>
                        {currentLocation.id === city.id && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : query.trim().length >= 2 && !isSearching ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    No cities found matching "{query}". Try a different spelling.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Desktop Controls (Units & Refresh) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Temperature Unit Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                id="header-unit-c"
                onClick={() => tempUnit !== 'C' && onToggleTempUnit()}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  tempUnit === 'C'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                °C
              </button>
              <button
                id="header-unit-f"
                onClick={() => tempUnit !== 'F' && onToggleTempUnit()}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  tempUnit === 'F'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                °F
              </button>
            </div>

            {/* Speed Unit Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                id="header-speed-kmh"
                onClick={() => speedUnit !== 'kmh' && onToggleSpeedUnit()}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  speedUnit === 'kmh'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                km/h
              </button>
              <button
                id="header-speed-mph"
                onClick={() => speedUnit !== 'mph' && onToggleSpeedUnit()}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  speedUnit === 'mph'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                mph
              </button>
            </div>

            {/* Refresh Button */}
            <button
              id="header-refresh-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-2xs"
              title="Refresh weather data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Station Telemetry Badge */}
            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">Live Telemetry</p>
                <p className="text-[10px] text-slate-500 font-medium">Station Online</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-200">
                WI
              </div>
            </div>
          </div>
        </div>

        {/* Popular City Presets Bar */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-1">
            Global Presets:
          </span>
          {PRESET_CITIES.map((city) => {
            const isActive = currentLocation.id === city.id || currentLocation.name === city.name;
            return (
              <button
                key={`preset-${city.id}`}
                id={`preset-city-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCity(city)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
