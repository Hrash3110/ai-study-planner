import React from 'react';
import { Flame, Clock, Sparkles, RotateCcw, Settings, Globe } from 'lucide-react';
import { Language } from '../types/index.ts';
import { TRANSLATIONS } from '../utils/plannerLogic.ts';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  streakCount: number;
  onOpenSettings: () => void;
  onResetData: () => void;
  overallProgress: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  streakCount,
  onOpenSettings,
  onResetData,
  overallProgress,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-[#0b1329]/90 backdrop-blur-md border-b border-[#1c2d54] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
            <div className="h-full w-full bg-[#0d1630] rounded-[10px] flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                {t.appTitle}
              </h1>
              <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 shrink-0">
                AI Study Buddy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-sm shrink-0">
          {/* Syllabus overall progress pill (desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101c3d] border border-[#1e3366] text-slate-300 text-xs">
            <span className="text-slate-400">Syllabus:</span>
            <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="font-semibold text-cyan-400">{overallProgress}%</span>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-amber-950/50 border border-amber-600/40 text-amber-300 text-xs font-semibold shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{streakCount} {language === 'hinglish' ? 'Din' : 'd'}</span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'hinglish' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl bg-[#122045] hover:bg-[#182a5a] border border-[#233c77] text-slate-200 text-xs font-medium transition cursor-pointer shadow-sm"
            title="Switch Language: English / Hinglish"
            aria-label="Switch between English and Hinglish"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{language === 'en' ? 'Switch to Hinglish' : 'Switch to English'}</span>
            <span className="px-1 py-0.5 rounded bg-[#1e346b] text-cyan-300 text-[10px] uppercase font-bold">
              {language === 'en' ? 'EN' : 'HI'}
            </span>
          </button>

          {/* Schedule Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#162752] hover:bg-[#1e356e] border border-[#2a4585] text-cyan-300 hover:text-cyan-200 text-xs font-medium transition cursor-pointer"
            aria-label="Open college and busy timings settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'hinglish' ? 'Timings' : 'Timings'}</span>
          </button>

          {/* Reset sample data */}
          <button
            onClick={onResetData}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title={t.resetSampleData}
            aria-label={t.resetSampleData}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline ml-1">{t.resetSampleData}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
