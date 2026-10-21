import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Zap,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Subject, Topic, Language } from '../types/index.ts';
import { calculateSubjectProgress, calculateExamDaysRemaining, TRANSLATIONS } from '../utils/plannerLogic.ts';

interface SubjectManagerProps {
  subjects: Subject[];
  language: Language;
  onUpdateSubjects: (subjects: Subject[]) => void;
  onOpenAddSubject: () => void;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  language,
  onUpdateSubjects,
  onOpenAddSubject,
}) => {
  const t = TRANSLATIONS[language];
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [newTopicNames, setNewTopicNames] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedSubjectId(expandedSubjectId === id ? null : id);
  };

  // Toggle topic completion
  const handleToggleTopic = (subjectId: string, topicId: string) => {
    const updated = subjects.map((subj) => {
      if (subj.id !== subjectId) return subj;
      return {
        ...subj,
        topics: subj.topics.map((top) => {
          if (top.id !== topicId) return top;
          return { ...top, completed: !top.completed };
        }),
      };
    });
    onUpdateSubjects(updated);
  };

  // Toggle weak topic flag
  const handleToggleWeak = (subjectId: string, topicId: string) => {
    const updated = subjects.map((subj) => {
      if (subj.id !== subjectId) return subj;
      return {
        ...subj,
        topics: subj.topics.map((top) => {
          if (top.id !== topicId) return top;
          return { ...top, isWeak: !top.isWeak };
        }),
      };
    });
    onUpdateSubjects(updated);
  };

  // Delete topic
  const handleDeleteTopic = (subjectId: string, topicId: string) => {
    const updated = subjects.map((subj) => {
      if (subj.id !== subjectId) return subj;
      return {
        ...subj,
        topics: subj.topics.filter((t) => t.id !== topicId),
      };
    });
    onUpdateSubjects(updated);
  };

  // Add new topic
  const handleAddTopic = (subjectId: string) => {
    const name = newTopicNames[subjectId]?.trim();
    if (!name) return;

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name,
      isWeak: false,
      completed: false,
    };

    const updated = subjects.map((subj) => {
      if (subj.id !== subjectId) return subj;
      return {
        ...subj,
        topics: [...subj.topics, newTopic],
      };
    });

    onUpdateSubjects(updated);
    setNewTopicNames({ ...newTopicNames, [subjectId]: '' });
  };

  // Delete entire subject
  const handleDeleteSubject = (subjectId: string) => {
    if (subjects.length <= 1) {
      alert(language === 'hinglish' ? 'Kam se kam 1 subject rehna chahiye!' : 'Keep at least one subject!');
      return;
    }
    const updated = subjects.filter((s) => s.id !== subjectId);
    onUpdateSubjects(updated);
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(updated[0]?.id || null);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0e1730] border border-[#1d2d54] p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>{t.subjectsSyllabus}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hinglish'
              ? 'Topics tick karo, mushkil topics ko tag karo taaki AI unhe pehle schedule kare'
              : 'Track completion, flag weak topics for AI priority, and manage curriculum'}
          </p>
        </div>

        <button
          onClick={onOpenAddSubject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
          aria-label={t.addSubject}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addSubject}</span>
        </button>
      </div>

      {/* Subjects Accordion / List */}
      <div className="space-y-3">
        {subjects.map((subject) => {
          const progress = calculateSubjectProgress(subject);
          const daysToExam = calculateExamDaysRemaining(subject.examDate);
          const weakCount = subject.topics.filter((t) => t.isWeak).length;
          const isExpanded = expandedSubjectId === subject.id;

          return (
            <div
              key={subject.id}
              className="rounded-xl border border-[#1c2e59] bg-[#0b1329] overflow-hidden transition-all"
            >
              {/* Subject Bar (Click to Expand) */}
              <div
                onClick={() => toggleExpand(subject.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#101b38] transition"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Toggle topics for ${subject.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(subject.id);
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: subject.color || '#3b82f6' }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100 truncate">
                        {subject.name}
                      </h3>
                      {weakCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-600/40 text-amber-300">
                          {weakCount} {language === 'hinglish' ? 'Weak' : 'Weak'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {subject.topics.filter((t) => t.completed).length} / {subject.topics.length} topics done
                      {subject.examDate && ` • Exam: ${daysToExam}d left`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  {/* Mini Progress */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold text-indigo-300 w-8 text-right">
                      {progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition cursor-pointer"
                      title={t.deleteSubject}
                      aria-label={`Delete subject ${subject.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Topics List */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#162547] bg-[#080d1e] space-y-3">
                  <div className="space-y-1.5 pt-2">
                    {subject.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs transition border ${
                          topic.completed
                            ? 'bg-[#0a1124] border-[#15223e] text-slate-400'
                            : 'bg-[#0f1b3b]/60 border-[#1f3261] text-slate-200'
                        }`}
                      >
                        {/* Topic checkbox */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTopic(subject.id, topic.id)}
                            className="cursor-pointer text-slate-400 hover:text-cyan-400 shrink-0"
                            aria-label={`Mark topic ${topic.name} as ${topic.completed ? 'incomplete' : 'complete'}`}
                          >
                            {topic.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                            )}
                          </button>
                          <span
                            className={`truncate ${
                              topic.completed ? 'line-through text-slate-400' : 'font-medium'
                            }`}
                          >
                            {topic.name}
                          </span>
                        </div>

                        {/* Weak Topic tag toggle & delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleWeak(subject.id, topic.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer border ${
                              topic.isWeak
                                ? 'bg-amber-950 text-amber-300 border-amber-600/70 shadow-sm'
                                : 'bg-[#121f3f] text-slate-400 hover:text-slate-200 border-[#1f3366]'
                            }`}
                            title="Flag as weak topic to prioritize in AI study schedule"
                            aria-label={`Toggle weak flag for ${topic.name}`}
                          >
                            <Zap className={`w-2.5 h-2.5 ${topic.isWeak ? 'text-amber-400 fill-amber-400' : ''}`} />
                            <span>{topic.isWeak ? (language === 'hinglish' ? 'Mushkil Topic' : 'Weak Area') : (language === 'hinglish' ? '+ Weak Mark' : '+ Weak')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTopic(subject.id, topic.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Delete topic"
                            aria-label={`Delete topic ${topic.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add new topic input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newTopicNames[subject.id] || ''}
                      onChange={(e) =>
                        setNewTopicNames({ ...newTopicNames, [subject.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTopic(subject.id);
                        }
                      }}
                      placeholder={language === 'hinglish' ? '+ Naya chapter ya topic likho aur Enter dabao...' : '+ Type new chapter / topic and press Enter...'}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#070c1c] border border-[#1b2f5c] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTopic(subject.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#18274f] hover:bg-[#20346b] text-indigo-300 text-xs font-semibold transition cursor-pointer border border-[#273f7c]"
                    >
                      {t.addTopic}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
