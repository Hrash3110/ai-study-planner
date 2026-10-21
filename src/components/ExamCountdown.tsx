import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Edit3, X, Check } from 'lucide-react';
import { Subject, Language } from '../types/index.ts';
import { calculateExamDaysRemaining, TRANSLATIONS } from '../utils/plannerLogic.ts';

interface ExamCountdownProps {
  subjects: Subject[];
  language: Language;
  onUpdateExamDate: (subjectId: string, newDate: string) => void;
}

export const ExamCountdown: React.FC<ExamCountdownProps> = ({
  subjects,
  language,
  onUpdateExamDate,
}) => {
  const t = TRANSLATIONS[language];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<string>('');

  const handleStartEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setTempDate(subject.examDate || new Date().toISOString().split('T')[0]);
  };

  const handleSaveEdit = (subjectId: string) => {
    if (tempDate) {
      onUpdateExamDate(subjectId, tempDate);
    }
    setEditingId(null);
  };

  // Sort subjects by upcoming exam date
  const sorted = [...subjects].sort((a, b) => {
    const da = calculateExamDaysRemaining(a.examDate);
    const db = calculateExamDaysRemaining(b.examDate);
    return da - db;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>{t.examCountdown}</span>
        </h2>
        <span className="text-xs text-slate-400">
          {language === 'hinglish' ? 'Exams aane wale hain!' : 'Upcoming semester exams'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {sorted.map((subject) => {
          const days = calculateExamDaysRemaining(subject.examDate);
          const isUrgent = days <= 5;
          const isModerate = days > 5 && days <= 12;

          let badgeColor = 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300';
          let textColor = 'text-emerald-400';
          if (days <= 0) {
            badgeColor = 'bg-rose-950/80 border-rose-600/50 text-rose-300';
            textColor = 'text-rose-400';
          } else if (isUrgent) {
            badgeColor = 'bg-rose-950/80 border-rose-600/50 text-rose-300 animate-pulse';
            textColor = 'text-rose-400';
          } else if (isModerate) {
            badgeColor = 'bg-amber-950/70 border-amber-600/40 text-amber-300';
            textColor = 'text-amber-400';
          }

          const isEditing = editingId === subject.id;

          return (
            <div
              key={subject.id}
              className="relative group p-3.5 rounded-xl bg-[#0e1730] border border-[#1b2b52] hover:border-[#2b4480] transition-all flex flex-col justify-between"
            >
              {/* Top: Subject name & Edit button */}
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: subject.color || '#3b82f6' }}
                  />
                  <h3 className="text-sm font-semibold text-slate-100 truncate" title={subject.name}>
                    {subject.name}
                  </h3>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(subject)}
                    className="opacity-60 group-hover:opacity-100 p-1 rounded hover:bg-[#1a2c59] text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                    title={language === 'hinglish' ? 'Exam date badlo' : 'Change exam date'}
                    aria-label={`Change exam date for ${subject.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Middle: Days Remaining Display or Inline Date Input */}
              <div className="my-2.5">
                {isEditing ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="date"
                      value={tempDate}
                      onChange={(e) => setTempDate(e.target.value)}
                      className="w-full text-xs bg-[#080d1d] border border-cyan-500 rounded px-1.5 py-1 text-slate-100 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(subject.id)}
                      className="p-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black tracking-tight font-mono ${textColor}`}>
                      {days <= 0 ? (language === 'hinglish' ? 'AAJ!' : 'TODAY') : `${days}`}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {days === 1
                        ? (language === 'hinglish' ? 'din baki' : 'day left')
                        : (language === 'hinglish' ? 'din baki' : 'days left')}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom: Date string & status pill */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#182647]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>
                    {subject.examDate
                      ? new Date(subject.examDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Date not set'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
                  {days <= 4
                    ? (language === 'hinglish' ? '🔥 Paas Hai' : '🔥 Urgent')
                    : days <= 10
                    ? (language === 'hinglish' ? '⚡ Taiyari' : '⚡ Focus')
                    : (language === 'hinglish' ? 'Time Hai' : 'Scheduled')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
