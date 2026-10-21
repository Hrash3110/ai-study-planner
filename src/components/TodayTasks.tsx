import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Zap,
  Coffee,
  RotateCw,
  Plus,
  Edit2,
  Trash2,
  Play,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { StudyTask, Language } from '../types/index.ts';
import { TRANSLATIONS } from '../utils/plannerLogic.ts';
import { sounds } from '../utils/sound.ts';

interface TodayTasksProps {
  tasks: StudyTask[];
  language: Language;
  onToggleTask: (taskId: string) => void;
  onSelectForTimer: (taskId: string) => void;
  onEditTask: (task: StudyTask) => void;
  onRescheduleTask: (taskId: string, newStart: string, newEnd: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewTask: () => void;
  activeTimerTaskId: string | null;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({
  tasks,
  language,
  onToggleTask,
  onSelectForTimer,
  onEditTask,
  onRescheduleTask,
  onDeleteTask,
  onAddNewTask,
  activeTimerTaskId,
}) => {
  const t = TRANSLATIONS[language];
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const totalTasks = tasks.filter((t) => t.type !== 'break').length;
  const completedTasks = tasks.filter((t) => t.type !== 'break' && t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleCheckboxClick = (task: StudyTask) => {
    onToggleTask(task.id);
    if (!task.completed) {
      sounds.playTaskComplete();
    }
  };

  const handleQuickShift = (task: StudyTask, minutesToAdd: number) => {
    const [h, m] = task.startTime.split(':').map(Number);
    const [eh, em] = task.endTime.split(':').map(Number);
    const newStartMins = Math.min(23 * 60 + 30, h * 60 + m + minutesToAdd);
    const newEndMins = Math.min(23 * 60 + 59, eh * 60 + em + minutesToAdd);

    const fmt = (mins: number) => {
      const hh = Math.floor(mins / 60);
      const mm = mins % 60;
      return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
    };

    onRescheduleTask(task.id, fmt(newStartMins), fmt(newEndMins));
  };

  return (
    <div className="rounded-2xl bg-[#0e1730] border border-[#1d2d54] p-5 shadow-xl space-y-4">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              <span>{t.todayTasks}</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-semibold">
              {completedTasks}/{totalTasks} {t.completedCount}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{t.todaySubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter pills */}
          <div className="flex rounded-xl bg-[#090f22] p-1 border border-[#182647] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'all' ? 'bg-[#1a2d59] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'pending' ? 'bg-[#1a2d59] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'completed' ? 'bg-[#1a2d59] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({tasks.filter((t) => t.completed).length})
            </button>
          </div>

          <button
            onClick={onAddNewTask}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            aria-label={t.addTask}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.addTask}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{language === 'hinglish' ? 'Aaj ki Pragati' : "Today's Target Completion"}</span>
          <span className="font-semibold text-cyan-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-[#080d1e] rounded-full h-2.5 overflow-hidden border border-[#162547]">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 100% Celebration Banner */}
      {progressPercent === 100 && totalTasks > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/50 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
          <div>
            <p className="text-sm font-bold text-emerald-300">{t.allDoneCelebration}</p>
            <p className="text-xs text-slate-300">
              {language === 'hinglish'
                ? 'Shaandar! College ke baad bhi itna focus maintain kiya. Ab aaram karo!'
                : 'Outstanding discipline! You crushed all study sessions scheduled for today.'}
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            {language === 'hinglish' ? 'Is filter mein koi task nahi hai.' : 'No tasks in this view.'}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isBreak = task.type === 'break';
            const isActiveTimer = activeTimerTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`relative group rounded-xl p-3.5 transition-all border ${
                  task.completed
                    ? 'bg-[#091024]/60 border-[#152342] opacity-75'
                    : isBreak
                    ? 'bg-[#0d1c26]/60 border-[#173a4a]'
                    : isActiveTimer
                    ? 'bg-[#102047] border-cyan-400/80 shadow-lg shadow-cyan-950/50'
                    : 'bg-[#0b1329] border-[#1b2b52] hover:border-[#2a4380]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleCheckboxClick(task)}
                      className="mt-0.5 text-slate-400 hover:text-cyan-400 transition cursor-pointer shrink-0"
                      aria-label={`Mark task ${task.topic} as ${task.completed ? 'incomplete' : 'complete'}`}
                    >
                      {task.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Square className="w-5 h-5 hover:text-cyan-300" />
                      )}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time slot pill */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#070d1e] text-[11px] font-mono text-cyan-300 border border-[#1c2e59]">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {task.startTime} - {task.endTime} ({task.durationMinutes}m)
                        </span>

                        {/* Subject Badge */}
                        <span className="text-xs font-bold text-slate-200">
                          {task.subject}
                        </span>

                        {/* Tag Badges */}
                        {task.isWeakTopic && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/50">
                            <Zap className="w-2.5 h-2.5 text-amber-400" />
                            {language === 'hinglish' ? 'Weak Topic' : 'Weak Area'}
                          </span>
                        )}

                        {task.type === 'revision' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/90 text-purple-300 border border-purple-600/50">
                            <RotateCw className="w-2.5 h-2.5 text-purple-400" />
                            Spaced Revision
                          </span>
                        )}

                        {isBreak && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-950/90 text-teal-300 border border-teal-600/50">
                            <Coffee className="w-2.5 h-2.5 text-teal-400" />
                            Break
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-medium ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-100 font-semibold'
                        }`}
                      >
                        {task.topic}
                      </h3>

                      {task.notes && (
                        <p className="text-xs text-slate-400 italic">
                          💡 {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {!isBreak && !task.completed && (
                      <button
                        onClick={() => onSelectForTimer(task.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                          isActiveTimer
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                            : 'bg-[#152347] hover:bg-[#1e346b] text-cyan-300 border-[#233c77]'
                        }`}
                        title="Study this session with Pomodoro timer"
                        aria-label={`Study ${task.topic} in Pomodoro timer`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isActiveTimer ? (language === 'hinglish' ? 'In Timer' : 'In Timer') : (language === 'hinglish' ? 'Padho' : 'Study')}</span>
                      </button>
                    )}

                    {/* Quick Reschedule: +30m */}
                    {!task.completed && (
                      <button
                        onClick={() => handleQuickShift(task, 30)}
                        className="px-2 py-1 rounded-lg bg-[#0e1933] hover:bg-[#162752] text-slate-300 hover:text-cyan-300 text-[11px] font-medium border border-[#1c2e59] transition cursor-pointer"
                        title={language === 'hinglish' ? '30 min aage badhao' : 'Shift +30 min'}
                        aria-label="Shift task by 30 minutes"
                      >
                        +30m
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded-lg bg-[#0e1933] hover:bg-[#162752] text-slate-400 hover:text-slate-200 border border-[#1c2e59] transition cursor-pointer"
                      title={t.editTask}
                      aria-label={`Edit task ${task.topic}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg bg-[#0e1933] hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-[#1c2e59] hover:border-rose-800/50 transition cursor-pointer"
                      title={t.deleteTask}
                      aria-label={`Delete task ${task.topic}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
