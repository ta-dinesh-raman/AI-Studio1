import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Thermometer, CloudRain, Wind, Sun, BarChart3 } from 'lucide-react';
import { HourlyForecastItem, TemperatureUnit, SpeedUnit } from '../types/weather';
import { convertTempValue, convertSpeedValue } from '../utils/weatherUtils';

interface WeatherChartsProps {
  hourly: HourlyForecastItem[];
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
}

type ChartTab = 'temperature' | 'precipitation' | 'wind' | 'uv_humidity';

export function WeatherCharts({ hourly, tempUnit, speedUnit }: WeatherChartsProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('temperature');
  const [timeRange, setTimeRange] = useState<24 | 48>(24);

  // Format data for recharts
  const chartData = useMemo(() => {
    const subset = hourly.slice(0, timeRange);
    return subset.map((item) => ({
      time: item.hourDisplay,
      isoTime: item.time,
      condition: item.conditionName,
      temp: convertTempValue(item.temperature, tempUnit),
      feelsLike: convertTempValue(item.apparentTemperature, tempUnit),
      precipitationProbability: item.precipitationProbability,
      precipitation: item.precipitation,
      windSpeed: convertSpeedValue(item.windSpeed, speedUnit),
      windGusts: convertSpeedValue(item.windGusts, speedUnit),
      uvIndex: item.uvIndex,
      humidity: item.cloudCover, // cloud cover or humidity
      cloudCover: item.cloudCover,
    }));
  }, [hourly, timeRange, tempUnit, speedUnit]);

  return (
    <div id="weather-charts-section" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-5 relative overflow-hidden">
      {/* Header with Tab Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shadow-sm shadow-blue-100">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Hourly Weather Analytics
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Interactive atmospheric progression & telemetry
            </p>
          </div>
        </div>

        {/* Tab Buttons & Time Range */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              id="chart-tab-temp"
              onClick={() => setActiveTab('temperature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'temperature'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Temp</span>
            </button>

            <button
              id="chart-tab-precip"
              onClick={() => setActiveTab('precipitation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'precipitation'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Rain</span>
            </button>

            <button
              id="chart-tab-wind"
              onClick={() => setActiveTab('wind')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'wind'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Wind</span>
            </button>

            <button
              id="chart-tab-uv"
              onClick={() => setActiveTab('uv_humidity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'uv_humidity'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Solar & Sky</span>
            </button>
          </div>

          {/* 24h vs 48h toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              id="chart-range-24h"
              onClick={() => setTimeRange(24)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 24
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              24h
            </button>
            <button
              id="chart-range-48h"
              onClick={() => setTimeRange(48)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 48
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              48h
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temperature' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="feelsLikeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={timeRange === 48 ? 3 : 2}
              />
              <YAxis
                unit={`°${tempUnit}`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '1rem',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(val: any, name: any) => [
                  `${val}°${tempUnit}`,
                  name === 'temp' ? 'Temperature' : 'Feels Like',
                ]}
                labelFormatter={(label, payload) => {
                  const cond = payload?.[0]?.payload?.condition;
                  return cond ? `${label} • ${cond}` : label;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(val) => (val === 'temp' ? `Actual Temp (°${tempUnit})` : `Perceived Feels Like (°${tempUnit})`)}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
                name="temp"
              />
              <Area
                type="monotone"
                dataKey="feelsLike"
                stroke="#64748b"
                strokeWidth={1.75}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#feelsLikeGradient)"
                name="feelsLike"
              />
            </AreaChart>
          ) : activeTab === 'precipitation' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={timeRange === 48 ? 3 : 2}
              />
              <YAxis
                unit="%"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '1rem',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(val: any, name: any) => [
                  `${val}%`,
                  name === 'precipitationProbability' ? 'Precipitation Chance' : name,
                ]}
                labelFormatter={(label, payload) => {
                  const cond = payload?.[0]?.payload?.condition;
                  const mm = payload?.[0]?.payload?.precipitation;
                  return `${label} • ${cond} (${mm} mm rain)`;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={() => 'Rain / Precipitation Probability (%)'}
              />
              <Bar
                dataKey="precipitationProbability"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                name="precipitationProbability"
              />
            </BarChart>
          ) : activeTab === 'wind' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={timeRange === 48 ? 3 : 2}
              />
              <YAxis
                unit={` ${speedUnit}`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '1rem',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(val: any, name: any) => [
                  `${val} ${speedUnit}`,
                  name === 'windSpeed' ? 'Sustained Wind' : 'Peak Gusts',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(val) => (val === 'windSpeed' ? `Sustained Velocity (${speedUnit})` : `Peak Gusts (${speedUnit})`)}
              />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                name="windSpeed"
              />
              <Line
                type="monotone"
                dataKey="windGusts"
                stroke="#f59e0b"
                strokeWidth={1.75}
                strokeDasharray="4 4"
                dot={false}
                name="windGusts"
              />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={timeRange === 48 ? 3 : 2}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 12]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '1rem',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(val: any, name: any) => [
                  name === 'uvIndex' ? `${val} (Index)` : `${val}%`,
                  name === 'uvIndex' ? 'UV Radiation' : 'Cloud Canopy',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                formatter={(val) => (val === 'uvIndex' ? 'UV Solar Index (0-11+)' : 'Cloud Cover (%)')}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="uvIndex"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                name="uvIndex"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cloudCover"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="cloudCover"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
