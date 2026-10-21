import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, CheckCircle, Coffee, BookOpen, Sparkles, Bell } from 'lucide-react';
import { StudyTask, Language } from '../types/index.ts';
import { TRANSLATIONS } from '../utils/plannerLogic.ts';
import { sounds } from '../utils/sound.ts';

interface StudyTimerProps {
  language: Language;
  tasks: StudyTask[];
  activeTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onCompleteTask: (taskId: string) => void;
}

type TimerMode = 'study' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: Record<TimerMode, number> = {
  study: 25 * 60, // 25 minutes (1500 seconds)
  shortBreak: 5 * 60, // 5 minutes (300 seconds)
  longBreak: 15 * 60, // 15 minutes (900 seconds)
};

export const StudyTimer: React.FC<StudyTimerProps> = ({
  language,
  tasks,
  activeTaskId,
  onSelectTask,
  onCompleteTask,
}) => {
  const t = TRANSLATIONS[language];
  const [mode, setMode] = useState<TimerMode>('study');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.study);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Set duration when mode switches
  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            sounds.playTimerBell();
            if (mode === 'study') {
              setCompletedSessionsCount((c) => c + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const toggleTimer = () => {
    // If timer reached 0, restart it
    if (timeLeft === 0) {
      setTimeLeft(MODE_DURATIONS[mode]);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  // Circumference for r=56 is ~351.85
  const strokeDashoffset = 351.85 - (351.85 * progressPercent) / 100;

  return (
    <div className="rounded-2xl bg-[#0e1730] border border-[#1d2d54] p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Glow highlight */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-24 bg-blue-500/10 blur-2xl pointer-events-none" />

      {/* Header & Mode Switches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">{t.pomodoroTimer}</h2>
              <p className="text-[11px] text-slate-400">
                {language === 'hinglish' ? '25 min deep focus, 5 min break' : '25-min focus sessions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#14234c] border border-[#23386b] text-[11px] text-cyan-300 font-medium">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{completedSessionsCount} {language === 'hinglish' ? 'Sessions Done' : 'Sessions Done'}</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#090f22] border border-[#182647] mb-5">
          <button
            onClick={() => switchMode('study')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              mode === 'study'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.studyMode}</span>
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              mode === 'shortBreak'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{t.shortBreak}</span>
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              mode === 'longBreak'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{t.longBreak}</span>
          </button>
        </div>
      </div>

      {/* Circular Progress & Digits */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
            {/* Background ring */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="6"
              className="text-[#132042]"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray="351.85"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                mode === 'study' ? 'text-cyan-400' : 'text-emerald-400'
              }`}
              fill="transparent"
            />
          </svg>

          {/* Time digits in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-tight font-mono text-white drop-shadow">
              {formattedTime}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
              {isRunning
                ? (mode === 'study' ? (language === 'hinglish' ? 'Padhai Chalu' : 'Focus Mode') : (language === 'hinglish' ? 'Break Time' : 'Resting'))
                : (timeLeft === 0 ? (language === 'hinglish' ? 'Complete!' : 'Done!') : (language === 'hinglish' ? 'Ready' : 'Paused'))}
            </span>
          </div>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-[#14234c] hover:bg-[#1a2e63] text-slate-300 hover:text-white transition cursor-pointer border border-[#23396e]"
            title={t.resetTimer}
            aria-label={t.resetTimer}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30 font-extrabold'
            }`}
            aria-label={isRunning ? t.pauseSession : t.startSession}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{t.pauseSession}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{t.startSession}</span>
              </>
            )}
          </button>

          {activeTask && !activeTask.completed && (
            <button
              onClick={() => {
                onCompleteTask(activeTask.id);
                sounds.playTaskComplete();
              }}
              className="p-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              title={language === 'hinglish' ? 'Task Khatam Mark Karo' : 'Mark task completed'}
              aria-label="Mark linked task completed"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom: Linked Active Task */}
      <div className="mt-4 pt-3 border-t border-[#182647]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {t.timerLinkedTo}:
          </span>
          {activeTask && (
            <button
              onClick={() => onSelectTask(null)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              {language === 'hinglish' ? 'Alag karo' : 'Unlink'}
            </button>
          )}
        </div>

        {activeTask ? (
          <div className="p-2.5 rounded-xl bg-[#14234c]/60 border border-[#233a70] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-cyan-300 truncate">
                  {activeTask.subject}:
                </span>
                <span className="text-xs text-slate-200 truncate font-medium">
                  {activeTask.topic}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {activeTask.startTime} - {activeTask.endTime} ({activeTask.durationMinutes}m)
              </p>
            </div>
            {activeTask.isWeakTopic && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 border border-amber-600/50 text-amber-300 shrink-0">
                Weak Area
              </span>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#091024] border border-[#16254a] text-center">
            <p className="text-xs text-slate-400">
              {language === 'hinglish' 
                ? 'Tasks list me kisi bhi task pe "Padho" click karke timer se jodo.' 
                : 'Click "Study this" on any task in your list to sync with this timer.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
