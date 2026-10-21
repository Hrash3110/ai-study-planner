import React from 'react';
import { CalendarRange, Target, Clock, Lightbulb, Sparkles } from 'lucide-react';
import { WeeklyDayPlan, Language } from '../types/index.ts';
import { TRANSLATIONS } from '../utils/plannerLogic.ts';

interface WeeklyRoadmapProps {
  weeklyPlan: WeeklyDayPlan[];
  language: Language;
}

export const WeeklyRoadmap: React.FC<WeeklyRoadmapProps> = ({ weeklyPlan, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="rounded-2xl bg-[#0e1730] border border-[#1d2d54] p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-cyan-400" />
            <span>{t.weeklyRoadmap}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hinglish'
              ? 'Pure hafte ka balanced roadmap: har din ka clear focus aur revision slot'
              : 'Balanced 7-day distribution of subjects, exam prep, and revision blocks'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122147] border border-[#233c77] text-xs text-cyan-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>7-Day AI Strategy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {weeklyPlan.map((day, idx) => {
          const isWeekend = day.dayName.toLowerCase().includes('sat') || day.dayName.toLowerCase().includes('sun');
          const isToday = idx === 0;

          return (
            <div
              key={day.dayName}
              className={`rounded-xl p-3.5 border flex flex-col justify-between transition-all ${
                isToday
                  ? 'bg-[#12234e] border-cyan-500/80 shadow-md shadow-cyan-950/40'
                  : isWeekend
                  ? 'bg-[#0f1b3b]/60 border-[#1f3366]'
                  : 'bg-[#0b1329] border-[#18284e]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isToday ? 'text-cyan-300' : 'text-slate-300'
                  }`}>
                    {day.dayName}
                  </span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-600/50">
                      {language === 'hinglish' ? 'Aaj' : 'Today'}
                    </span>
                  )}
                  {isWeekend && !isToday && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#142247] text-indigo-300">
                      Weekend
                    </span>
                  )}
                </div>

                {/* Primary & Secondary Focus */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {day.primaryFocus}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1 pl-5">
                    <span>+ {day.secondaryFocus}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#182647] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Target:
                  </span>
                  <span className="font-semibold text-cyan-300 font-mono">
                    {day.targetHours}h
                  </span>
                </div>

                {day.tip && (
                  <p className="text-[10px] text-slate-400 italic line-clamp-2" title={day.tip}>
                    💡 {day.tip}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
