import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Zap, AlertCircle, RefreshCw, BookOpen, Coffee } from 'lucide-react';
import { Language, ScheduleConfig } from '../types/index.ts';
import { TRANSLATIONS } from '../utils/plannerLogic.ts';

interface AiPlannerBannerProps {
  language: Language;
  config: ScheduleConfig;
  coachAdvice: string;
  isGenerating: boolean;
  onGeneratePlan: (customGoal: string) => void;
  weakTopicsCount: number;
  nearestExamSubject: string | null;
  nearestExamDays: number | null;
}

export const AiPlannerBanner: React.FC<AiPlannerBannerProps> = ({
  language,
  config,
  coachAdvice,
  isGenerating,
  onGeneratePlan,
  weakTopicsCount,
  nearestExamSubject,
  nearestExamDays,
}) => {
  const t = TRANSLATIONS[language];
  const [customGoal, setCustomGoal] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePlan(customGoal);
    setShowInput(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101c3d] via-[#0d1630] to-[#070c1a] border border-[#233c77] p-4 sm:p-6 shadow-xl shadow-blue-950/40">
      {/* Background ambient glow circles */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Left Side: Coach Advice & Guarantee Badges */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-600/40 text-cyan-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Powered by Gemini AI
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/70 border border-blue-600/40 text-blue-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              College Hours Safe ({config.collegeTimings.start} - {config.collegeTimings.end})
            </span>

            {weakTopicsCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-600/40 text-amber-300 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {weakTopicsCount} {language === 'hinglish' ? 'Weak Topics Focus' : 'Weak Topics Targeted'}
              </span>
            )}

            {nearestExamSubject && nearestExamDays !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-600/40 text-rose-300 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                {nearestExamSubject}: {nearestExamDays}d left
              </span>
            )}
          </div>

          {/* Coach Advice speech bubble */}
          <div className="p-3.5 rounded-xl bg-[#14234c]/60 border border-[#233a70]/80">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 rounded-lg bg-cyan-500/20 text-cyan-300">
                <BookOpen className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  {language === 'hinglish' ? 'StudySaathi AI Coach ka Sandesh:' : 'StudySaathi AI Coach Tip:'}
                </p>
                <p className="text-sm font-medium text-slate-100 mt-0.5 leading-relaxed">
                  "{coachAdvice || (language === 'hinglish' 
                    ? 'College ke baad fresh mind se padhna hai. Weak topics pe pehle focus karenge!' 
                    : 'Balanced study sessions configured right after college. Let\'s conquer the day!')}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Action Trigger */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <button
            onClick={() => onGeneratePlan(customGoal)}
            disabled={isGenerating}
            className="w-full sm:w-auto lg:w-64 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label={t.generateAIPlan}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>{t.generateAIPlan}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowInput(!showInput)}
            className="text-xs text-cyan-300/80 hover:text-cyan-200 underline text-center cursor-pointer py-1"
          >
            {showInput
              ? (language === 'hinglish' ? 'Custom target band karo' : 'Hide custom focus')
              : (language === 'hinglish' ? '+ Aaj koi specific topic ya exam focus hai?' : '+ Add specific target or exam goal?')}
          </button>
        </div>
      </div>

      {/* Optional custom goal form */}
      {showInput && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-[#1c2e59] flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder={language === 'hinglish' 
              ? 'Jaise: "C Programming ke Pointers & Linked Lists pe zyada focus karo"'
              : 'E.g., "Give extra time to Calculus derivatives and C pointers"'}
            className="flex-1 px-3 py-2 rounded-xl bg-[#091024] border border-[#223666] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer shrink-0"
          >
            {language === 'hinglish' ? 'Apply & Replan' : 'Apply Goal'}
          </button>
        </form>
      )}
    </div>
  );
};
