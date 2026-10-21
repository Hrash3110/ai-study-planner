import React, { useState } from 'react';
import { X, BookOpen, Plus, Trash2, Calendar } from 'lucide-react';
import { Subject, Language } from '../types/index.ts';
import { TRANSLATIONS } from '../utils/plannerLogic.ts';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAddSubject: (newSubject: Subject) => void;
}

const COLOR_OPTIONS = [
  '#3b82f6', // Sapphire blue
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#f43f5e', // Rose
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  language,
  onAddSubject,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [topicInputs, setTopicInputs] = useState<string[]>(['Unit 1: Fundamentals', 'Unit 2: Core Concepts']);

  const handleAddTopicRow = () => {
    setTopicInputs([...topicInputs, '']);
  };

  const handleUpdateTopicRow = (index: number, val: string) => {
    const updated = [...topicInputs];
    updated[index] = val;
    setTopicInputs(updated);
  };

  const handleDeleteTopicRow = (index: number) => {
    setTopicInputs(topicInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validTopics = topicInputs
      .map((t) => t.trim())
      .filter(Boolean)
      .map((topicName, idx) => ({
        id: `t-${Date.now()}-${idx}`,
        name: topicName,
        isWeak: false,
        completed: false,
      }));

    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: name.trim(),
      color,
      examDate: examDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      topics: validTopics.length > 0 ? validTopics : [
        { id: `t-${Date.now()}-0`, name: 'Module 1: Introduction', isWeak: false, completed: false }
      ],
    };

    onAddSubject(newSubject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1730] border border-[#233a70] p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1c2e59] pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>{t.addSubject}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2c59] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {language === 'hinglish' ? 'Subject Ka Naam (e.g. Data Structures, Chemistry)' : 'Subject Name (e.g., Data Structures, Chemistry)'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full px-3 py-2 rounded-xl bg-[#091024] border border-[#20335e] text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
              required
            />
          </div>

          {/* Exam Date */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'hinglish' ? 'Exam Ki Tareekh' : 'Exam Date'}</span>
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#091024] border border-[#20335e] text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Color tag */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Tag Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Initial Topics / Syllabus Chapters */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                {language === 'hinglish' ? 'Syllabus Chapters / Topics' : 'Syllabus Chapters / Topics'}
              </label>
              <button
                type="button"
                onClick={handleAddTopicRow}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{language === 'hinglish' ? 'Topic Jodo' : 'Add Topic'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {topicInputs.map((top, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={top}
                    onChange={(e) => handleUpdateTopicRow(idx, e.target.value)}
                    placeholder={`Chapter/Topic ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#091024] border border-[#1e3059] text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                  {topicInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTopicRow(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      aria-label="Remove topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1c2e59]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              {t.addSubject}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
