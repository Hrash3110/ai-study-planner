import React, { useState } from 'react';
import { X, Clock, BookOpen, Zap, Calendar, Sparkles } from 'lucide-react';
import { StudyTask, Language, Subject } from '../types/index.ts';
import { TRANSLATIONS } from '../utils/plannerLogic.ts';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: StudyTask | null;
  subjects: Subject[];
  language: Language;
  onSaveTask: (updatedTask: StudyTask) => void;
  onRescheduleToTomorrow?: (taskId: string) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  subjects,
  language,
  onSaveTask,
  onRescheduleToTomorrow,
}) => {
  if (!isOpen || !task) return null;

  const t = TRANSLATIONS[language];
  const [subject, setSubject] = useState(task.subject);
  const [topic, setTopic] = useState(task.topic);
  const [startTime, setStartTime] = useState(task.startTime);
  const [endTime, setEndTime] = useState(task.endTime);
  const [type, setType] = useState<StudyTask['type']>(task.type);
  const [isWeakTopic, setIsWeakTopic] = useState(task.isWeakTopic);
  const [notes, setNotes] = useState(task.notes || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // calculate duration
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = Math.max(10, (eh * 60 + em) - (sh * 60 + sm));

    onSaveTask({
      ...task,
      subject,
      topic,
      startTime,
      endTime,
      durationMinutes: duration,
      type,
      isWeakTopic,
      notes,
    });
    onClose();
  };

  const handleShiftTomorrow = () => {
    if (onRescheduleToTomorrow) {
      onRescheduleToTomorrow(task.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1730] border border-[#233a70] p-6 shadow-2xl space-y-4 text-slate-100">
        <div className="flex items-center justify-between border-b border-[#1c2e59] pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>{t.editTask}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2c59] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Subject Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#091024] border border-[#20335e] text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="Break">Break</option>
              <option value="Custom">Custom Subject</option>
            </select>
          </div>

          {/* Topic Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Topic or Chapter Name
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#091024] border border-[#20335e] text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#091024] border border-[#20335e] text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#091024] border border-[#20335e] text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          {/* Task Type */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Session Type
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {(['study', 'practice', 'revision', 'break'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setType(mode)}
                  className={`py-1.5 rounded-lg border font-medium capitalize transition cursor-pointer text-center ${
                    type === mode
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-sm'
                      : 'bg-[#091024] border-[#1b2f5c] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Weak Topic Flag */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="weakCheck"
              checked={isWeakTopic}
              onChange={(e) => setIsWeakTopic(e.target.checked)}
              className="accent-amber-400 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="weakCheck" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hinglish' ? 'Mushkil / Weak topic hai (Special priority)' : 'Mark as Weak Topic / High Attention'}</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Study Notes / Checklist
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Solve 5 numerical problems from question bank..."
              className="w-full px-3 py-2 rounded-xl bg-[#091024] border border-[#20335e] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1c2e59]">
            {/* Quick Reschedule to Tomorrow */}
            <button
              type="button"
              onClick={handleShiftTomorrow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142347] hover:bg-[#1a2f61] text-cyan-300 border border-[#22396d] text-xs font-medium transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'hinglish' ? 'Kal Shift Karo' : 'Postpone to Tomorrow'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
