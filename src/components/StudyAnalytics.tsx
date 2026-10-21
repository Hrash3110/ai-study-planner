import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Zap,
  Plus,
  Minus,
} from 'lucide-react';
import { DayStudyRecord, Language } from '../types/index.ts';
import { calculateWeeklyTotals, TRANSLATIONS } from '../utils/plannerLogic.ts';

interface StudyAnalyticsProps {
  data: DayStudyRecord[];
  language: Language;
  onUpdateDayHours: (dayIndex: number, newHours: number) => void;
}

export const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({
  data,
  language,
  onUpdateDayHours,
}) => {
  const t = TRANSLATIONS[language];
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const { totalCompleted, totalTarget, percentOfGoal, peakDay, maxHours } = calculateWeeklyTotals(data);

  // Custom Dark Blue Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dayData = data.find((d) => d.day === label);
      return (
        <div className="rounded-xl bg-[#091024] border border-[#233c77] p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 border-b border-[#1c2e59] pb-1.5">
            <span className="font-bold text-white text-sm">
              {dayData?.fullDay || label}
            </span>
            <span className="text-[11px] font-semibold text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50">
              {dayData?.primarySubject}
            </span>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                {t.completedHours}:
              </span>
              <span className="font-bold font-mono text-cyan-300">
                {payload.find((p: any) => p.dataKey === 'completedHours')?.value} hrs
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600/70" />
                {t.targetHours}:
              </span>
              <span className="font-mono text-slate-300">
                {payload.find((p: any) => p.dataKey === 'targetHours')?.value} hrs
              </span>
            </div>

            {dayData && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#162547] text-[11px] text-slate-400">
                <span>Pomodoro Focus:</span>
                <span className="text-amber-300 font-semibold">{dayData.pomodoroSessions} blocks ({(dayData.pomodoroSessions * 25) / 60}h)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Find index of today (or default to current day)
  const todayNameShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const todayIdx = data.findIndex((d) => d.day === todayNameShort) !== -1
    ? data.findIndex((d) => d.day === todayNameShort)
    : 0;
  const todayRecord = data[todayIdx] || data[0];

  return (
    <div className="rounded-2xl bg-[#0e1730] border border-[#1d2d54] p-5 shadow-xl space-y-5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{t.studyAnalytics}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-600/50 text-blue-300">
                Weekly Recharts
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.analyticsSubtitle}
          </p>
        </div>

        {/* Quick Log button for today's hours */}
        <div className="flex items-center gap-2 bg-[#091024] p-1.5 rounded-xl border border-[#1a2c59] text-xs">
          <span className="text-slate-400 font-medium px-1">
            {language === 'hinglish' ? `${todayRecord.day} Ka Time:` : `${todayRecord.day} Time:`}
          </span>
          <span className="font-mono font-bold text-cyan-300">
            {todayRecord.completedHours}h
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateDayHours(todayIdx, Math.max(0, todayRecord.completedHours - 0.5))}
              className="p-1 rounded bg-[#132042] hover:bg-[#1b2d5a] text-slate-300 hover:text-white transition cursor-pointer"
              title="-0.5h"
              aria-label="Decrease study hours by 0.5"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onUpdateDayHours(todayIdx, Math.min(12, todayRecord.completedHours + 0.5))}
              className="p-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer font-bold"
              title="+0.5h"
              aria-label="Increase study hours by 0.5"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Mini-Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Hours */}
        <div className="p-3.5 rounded-xl bg-[#091024] border border-[#1b2b52] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">
              {t.totalStudied}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold font-mono text-cyan-300">
                {totalCompleted}h
              </span>
              <span className="text-[11px] text-slate-500">/ {totalTarget}h</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-cyan-950/70 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Goal Achievement Rate */}
        <div className="p-3.5 rounded-xl bg-[#091024] border border-[#1b2b52] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">
              {t.goalAchieved}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                {percentOfGoal}%
              </span>
              <span className="text-[10px] text-emerald-400/80 font-medium">
                {percentOfGoal >= 80 ? (language === 'hinglish' ? '🔥 Mast' : 'On Track') : (language === 'hinglish' ? '⚡ Push karo' : 'Needs Push')}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/70 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Peak Study Day */}
        <div className="p-3.5 rounded-xl bg-[#091024] border border-[#1b2b52] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">
              {t.peakDay}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold font-mono text-amber-300">
                {peakDay}
              </span>
              <span className="text-[11px] text-slate-400">({maxHours}h)</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-amber-950/70 text-amber-400">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Total Pomodoro Blocks */}
        <div className="p-3.5 rounded-xl bg-[#091024] border border-[#1b2b52] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">
              {language === 'hinglish' ? 'Focus Sessions' : 'Pomodoro Blocks'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold font-mono text-indigo-300">
                {data.reduce((acc, d) => acc + d.pomodoroSessions, 0)}
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'hinglish' ? 'blocks' : 'sessions'}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-indigo-950/70 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Recharts Bar Chart Container */}
      <div className="p-4 rounded-xl bg-[#091024] border border-[#18284e]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-200">
            {t.weeklyStudyHours}
          </span>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#1e3a8a] border border-blue-500/40" />
              <span className="text-slate-400">{t.targetHours}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-cyan-500 to-cyan-300" />
              <span className="text-cyan-300 font-semibold">{t.completedHours}</span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#162344"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#1d2d54' }}
                tickLine={false}
              />
              <YAxis
                unit="h"
                domain={[0, 'dataMax + 1']}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#1d2d54' }}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(30, 58, 138, 0.15)' }}
              />
              {/* Target Goal Bars */}
              <Bar
                dataKey="targetHours"
                name={t.targetHours}
                fill="#1e3a8a"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              {/* Completed Hours Bars with Cyan Glow */}
              <Bar
                dataKey="completedHours"
                name={t.completedHours}
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.day}`}
                    fill={
                      entry.day === todayRecord.day
                        ? '#38bdf8' // Brighter cyan for today
                        : entry.completedHours >= entry.targetHours
                        ? '#06b6d4' // Target achieved
                        : '#0284c7' // Solid blue
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Motivational Footer Banner inside Analytics */}
        <div className="mt-3 pt-3 border-t border-[#162344] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'hinglish' 
              ? 'Consistency Score: 85% • Weak topics mein daily 45m time allocate ho raha hai' 
              : 'Consistency Score: 85% • Daily time prioritized towards weak syllabus topics'}
          </span>
          <span className="text-[11px] text-slate-500">
            {language === 'hinglish' ? 'Click +/- to adjust today study time' : 'Click +/- on top to adjust study time'}
          </span>
        </div>
      </div>
    </div>
  );
};
