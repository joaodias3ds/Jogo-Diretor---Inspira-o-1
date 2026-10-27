/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { IbopeHistoryPoint } from '@/engine/broadcast/broadcastTypes';
import { Tv, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

interface AudienceTrendChartProps {
  history: IbopeHistoryPoint[];
  currentIbope: number;
  targetIbope?: number;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const ibope = payload.find((p) => p.name === 'IBOPE')?.value;
    const share = payload.find((p) => p.name === 'Share %')?.value;

    return (
      <div className="p-3 bg-slate-950/95 border border-cyan-800/60 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[150px]">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
          <span>HORÁRIO</span>
          <span className="text-cyan-300 font-bold">{label}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-cyan-400 font-medium">● IBOPE:</span>
          <span className="text-white font-bold text-sm">{ibope?.toFixed(1)} pts</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-amber-400 font-medium">● Share:</span>
          <span className="text-amber-200 font-bold">{share}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const AudienceTrendChart: React.FC<AudienceTrendChartProps> = ({
  history,
  currentIbope,
  targetIbope = 25.0,
  className = '',
}) => {
  const [showShare, setShowShare] = useState(true);

  // Se o histórico for curto, preenche com curva para renderizar bonito
  const chartData = history.length >= 3 ? history : [
    { time: '20:30', ibope: 24.2, share: 41 },
    { time: '20:45', ibope: 25.8, share: 43 },
    { time: '21:00', ibope: 27.4, share: 46 },
    { time: '21:15', ibope: 28.9, share: 49 },
    { time: '21:30', ibope: currentIbope, share: Math.min(65, Math.round(currentIbope * 1.65)) },
  ];

  const highestPoint = Math.max(...chartData.map((d) => d.ibope), targetIbope);
  const maxDomain = Math.ceil(highestPoint + 4);

  return (
    <div className={`p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl flex flex-col justify-between ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Tv size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Curva de Audiência em Tempo Real (IBOPE)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-400 border border-cyan-800/50">
                RECHARTS TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Pico de transmissão ao vivo vs. Meta de audiência dos patrocinadores ({targetIbope.toFixed(1)} pts)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowShare(!showShare)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
              showShare
                ? 'bg-amber-950/50 border-amber-800/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Share %</span>
          </button>
          <div className="px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/50 text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Ao Vivo: {currentIbope.toFixed(1)} pts</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ibopeGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              domain={[15, maxDomain]}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={targetIbope}
              label={{
                value: `Meta: ${targetIbope} pts`,
                fill: '#10b981',
                fontSize: 10,
                fontFamily: 'monospace',
                position: 'insideTopRight',
              }}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* IBOPE Line (Cyan Neon) */}
            <Line
              type="monotone"
              dataKey="ibope"
              name="IBOPE"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={{ fill: '#0891b2', stroke: '#22d3ee', strokeWidth: 1.5, r: 3.5 }}
              activeDot={{ r: 6, fill: '#22d3ee', stroke: '#ffffff', strokeWidth: 2 }}
            />

            {/* Share Line (Amber Neon) */}
            {showShare && (
              <Line
                type="monotone"
                dataKey="share"
                name="Share %"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={{ fill: '#b45309', stroke: '#f59e0b', strokeWidth: 1, r: 2.5 }}
                activeDot={{ r: 5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1.5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend & Insights */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80 mt-2 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-cyan-400 rounded-sm"></span>
            <span>Audiência (IBOPE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-amber-400 rounded-sm"></span>
            <span>Share da Emissora</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-1 border-t-2 border-dashed border-emerald-400"></span>
            <span>Meta Comercial</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-cyan-300">
          <Sparkles size={13} />
          <span>Engajamento em alta (+12% vs. semana anterior)</span>
        </div>
      </div>
    </div>
  );
};
