import React, { useState, useEffect } from 'react';
import {
  Subject,
  StudyTask,
  ScheduleConfig,
  WeeklyDayPlan,
  Language,
  DayStudyRecord,
} from './types/index.ts';
import {
  getSampleSubjects,
  getDefaultScheduleConfig,
  buildInitialTodayTasks,
  calculateOverallProgress,
  calculateExamDaysRemaining,
  getDefaultWeeklyAnalytics,
  TRANSLATIONS,
} from './utils/plannerLogic.ts';
import { Navbar } from './components/Navbar.tsx';
import { AiPlannerBanner } from './components/AiPlannerBanner.tsx';
import { ExamCountdown } from './components/ExamCountdown.tsx';
import { StudyTimer } from './components/StudyTimer.tsx';
import { TodayTasks } from './components/TodayTasks.tsx';
import { SubjectManager } from './components/SubjectManager.tsx';
import { WeeklyRoadmap } from './components/WeeklyRoadmap.tsx';
import { StudyAnalytics } from './components/StudyAnalytics.tsx';
import { ThreeStudyRoom } from './components/ThreeStudyRoom.tsx';
import { GeminiChatbot } from './components/GeminiChatbot.tsx';
import { ScheduleConfigModal } from './components/ScheduleConfigModal.tsx';
import { EditTaskModal } from './components/EditTaskModal.tsx';
import { AddSubjectModal } from './components/AddSubjectModal.tsx';

const STORAGE_KEYS = {
  SUBJECTS: 'studysaathi_subjects_v2',
  CONFIG: 'studysaathi_config_v2',
  TASKS: 'studysaathi_tasks_v2',
  WEEKLY: 'studysaathi_weekly_v2',
  COACH_ADVICE: 'studysaathi_advice_v2',
  STREAK: 'studysaathi_streak_v2',
  ANALYTICS: 'studysaathi_analytics_v2',
};

export default function App() {
  // Initialize state with localStorage data or defaults
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getSampleSubjects();
  });

  const [config, setConfig] = useState<ScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDefaultScheduleConfig();
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return buildInitialTodayTasks(getSampleSubjects(), getDefaultScheduleConfig());
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyDayPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { dayName: 'Monday', primaryFocus: 'C Programming', secondaryFocus: 'Maths Revision', targetHours: 4, tip: 'Pointers memory diagrams bana kar samjho.' },
      { dayName: 'Tuesday', primaryFocus: 'Engineering Maths', secondaryFocus: 'Physics Numericals', targetHours: 4, tip: 'Eigenvalues ke step-by-step 3 numerical solve karo.' },
      { dayName: 'Wednesday', primaryFocus: 'Applied Physics', secondaryFocus: 'C Dynamic Memory', targetHours: 4, tip: 'Wave optics interference derivations ko write down karo.' },
      { dayName: 'Thursday', primaryFocus: 'C Programming', secondaryFocus: 'English Memos', targetHours: 4, tip: 'Pointers aur Structs ke combining codes dry run karo.' },
      { dayName: 'Friday', primaryFocus: 'Engineering Maths', secondaryFocus: 'EVS Pollution Acts', targetHours: 4, tip: 'Differential equations standard forms review karo.' },
      { dayName: 'Saturday', primaryFocus: 'Deep Weak Topic Blitz', secondaryFocus: 'Mock Questions', targetHours: 5, tip: 'Weekend boost: Sabhi weak topics ke unsolved problems solve karo.' },
      { dayName: 'Sunday', primaryFocus: 'Full Spaced Repetition', secondaryFocus: 'Light Reading', targetHours: 4.5, tip: 'Formula sheets revision aur agle hafte ka study plan ready karo.' },
    ];
  });

  const [coachAdvice, setCoachAdvice] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COACH_ADVICE);
      if (saved) return saved;
    } catch (e) {}
    return 'College khatam hone ke baad fresh mind se padhna hai. C Programming ka exam sirf 4 din door hai aur Pointers weak hai, isliye pehla slot usi ka rakha hai!';
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (saved) return Number(saved);
    } catch (e) {}
    return 3;
  });

  const [analyticsData, setAnalyticsData] = useState<DayStudyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return getDefaultWeeklyAnalytics(4);
  });

  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'today' | '3d' | 'analytics' | 'syllabus' | 'timer' | 'weekly'>('today');

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COACH_ADVICE, coachAdvice);
  }, [coachAdvice]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAK, streakCount.toString());
  }, [streakCount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analyticsData));
  }, [analyticsData]);

  // Handle Gemini Plan Generation
  const handleGeneratePlan = async (customGoal: string = '') => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          dailyStudyHours: config.dailyStudyHours,
          collegeTimings: config.collegeTimings,
          busyHours: config.busyHours,
          language: config.language,
          customGoal,
        }),
      });

      const data = await res.json();
      if (data?.plan) {
        const { coachAdvice: newAdvice, todayTasks: newToday, weeklyStrategy: newWeekly } = data.plan;

        if (newAdvice) setCoachAdvice(newAdvice);
        if (Array.isArray(newWeekly) && newWeekly.length > 0) setWeeklyPlan(newWeekly);

        if (Array.isArray(newToday) && newToday.length > 0) {
          const formattedTasks: StudyTask[] = newToday.map((t: any, index: number) => ({
            id: `task-${Date.now()}-${index}`,
            subject: t.subject || 'Core Study',
            topic: t.topic || 'Revision',
            startTime: t.startTime || '18:00',
            endTime: t.endTime || '18:45',
            durationMinutes: t.durationMinutes || 45,
            type: t.type || 'study',
            isWeakTopic: Boolean(t.isWeakTopic),
            completed: false,
            notes: t.notes || '',
          }));
          setTasks(formattedTasks);
        }
      }
    } catch (err) {
      console.error('Error generating AI plan:', err);
      // Fallback locally
      const fallback = buildInitialTodayTasks(subjects, config);
      setTasks(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to adjust today's analytics hours when checking off study tasks
  const updateTodayAnalyticsHours = (deltaHours: number) => {
    const todayNameShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    setAnalyticsData((prev) =>
      prev.map((d) => {
        if (d.day === todayNameShort) {
          const newHours = Number(Math.max(0, d.completedHours + deltaHours).toFixed(1));
          const newSessions = Math.max(0, d.pomodoroSessions + (deltaHours > 0 ? 1 : -1));
          return { ...d, completedHours: newHours, pomodoroSessions: newSessions };
        }
        return d;
      })
    );
  };

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nowCompleted = !t.completed;
        // If not a break, adjust today's logged study hours dynamically
        if (t.type !== 'break') {
          const hoursDelta = Number((t.durationMinutes / 60).toFixed(1));
          updateTodayAnalyticsHours(nowCompleted ? hoursDelta : -hoursDelta);
        }
        return { ...t, completed: nowCompleted };
      })
    );
  };

  // Update specific day hours from Study Analytics chart controls
  const handleUpdateDayHours = (dayIndex: number, newHours: number) => {
    setAnalyticsData((prev) =>
      prev.map((d, idx) => (idx === dayIndex ? { ...d, completedHours: Number(newHours.toFixed(1)) } : d))
    );
  };

  // Reschedule task times
  const handleRescheduleTask = (taskId: string, newStart: string, newEnd: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const [sh, sm] = newStart.split(':').map(Number);
        const [eh, em] = newEnd.split(':').map(Number);
        const duration = Math.max(10, (eh * 60 + em) - (sh * 60 + sm));
        return {
          ...t,
          startTime: newStart,
          endTime: newEnd,
          durationMinutes: duration,
        };
      })
    );
  };

  // Shift to tomorrow
  const handleRescheduleToTomorrow = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          notes: `${t.notes ? t.notes + ' • ' : ''}(Shifted to Tomorrow)`,
          startTime: '17:30',
          endTime: '18:25',
        };
      })
    );
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTimerTaskId === taskId) {
      setActiveTimerTaskId(null);
    }
  };

  // Add new task
  const handleAddNewTask = () => {
    const newTask: StudyTask = {
      id: `task-manual-${Date.now()}`,
      subject: subjects[0]?.name || 'Maths',
      topic: 'New Study Target',
      startTime: '19:00',
      endTime: '19:45',
      durationMinutes: 45,
      type: 'study',
      isWeakTopic: false,
      completed: false,
      notes: 'Added by student',
    };
    setTasks((prev) => [...prev, newTask]);
    setEditingTask(newTask);
  };

  // Save edited task
  const handleSaveEditedTask = (updatedTask: StudyTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);
  };

  // Update Exam Date from Countdown Card
  const handleUpdateExamDate = (subjectId: string, newDate: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, examDate: newDate } : s))
    );
  };

  // Add Subject
  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  // Reset to default sample subjects & config
  const handleResetData = () => {
    const confirmText = config.language === 'hinglish'
      ? 'Kya aap sachme sample data (Maths, Physics, C Programming, English, EVS) reset karna chahte hain?'
      : 'Do you want to reset your schedule and sample subjects to default?';
    if (window.confirm(confirmText)) {
      const defaultSubjects = getSampleSubjects();
      const defaultConfig = getDefaultScheduleConfig();
      setSubjects(defaultSubjects);
      setConfig(defaultConfig);
      setTasks(buildInitialTodayTasks(defaultSubjects, defaultConfig));
      setCoachAdvice('College khatam hone ke baad fresh mind se padhna hai. C Programming ka exam sirf 4 din door hai!');
      setAnalyticsData(getDefaultWeeklyAnalytics(defaultConfig.dailyStudyHours));
    }
  };

  // Stats calculation
  const overallProgress = calculateOverallProgress(subjects);
  const weakTopicsCount = subjects.flatMap((s) => s.topics).filter((t) => t.isWeak && !t.completed).length;

  // Nearest exam
  const sortedExams = [...subjects].sort((a, b) => {
    return calculateExamDaysRemaining(a.examDate) - calculateExamDaysRemaining(b.examDate);
  });
  const nearestExam = sortedExams[0];
  const nearestExamDays = nearestExam ? calculateExamDaysRemaining(nearestExam.examDate) : null;

  return (
    <div className="min-h-screen bg-[#070c1a] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-16">
      {/* Top Navigation */}
      <Navbar
        language={config.language}
        onLanguageChange={(newLang) => setConfig({ ...config, language: newLang })}
        streakCount={streakCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetData={handleResetData}
        overallProgress={overallProgress}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6">
        {/* AI Study Planner Coach Banner */}
        <AiPlannerBanner
          language={config.language}
          config={config}
          coachAdvice={coachAdvice}
          isGenerating={isGenerating}
          onGeneratePlan={handleGeneratePlan}
          weakTopicsCount={weakTopicsCount}
          nearestExamSubject={nearestExam?.name || null}
          nearestExamDays={nearestExamDays}
        />

        {/* Exam Countdown Cards Row */}
        <ExamCountdown
          subjects={subjects}
          language={config.language}
          onUpdateExamDate={handleUpdateExamDate}
        />

        {/* Mobile View Tabs Selector */}
        <div className="flex lg:hidden rounded-xl bg-[#0e1730] p-1 border border-[#1d2d54] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setMobileTab('today')}
            className={`flex-1 min-w-[65px] py-2 rounded-lg transition cursor-pointer text-center ${
              mobileTab === 'today' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {config.language === 'hinglish' ? "Aaj Ka Target" : "Today"}
          </button>
          <button
            onClick={() => setMobileTab('3d')}
            className={`flex-1 min-w-[65px] py-2 rounded-lg transition cursor-pointer text-center ${
              mobileTab === '3d' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {config.language === 'hinglish' ? "3D Zone" : "3D Room"}
          </button>
          <button
            onClick={() => setMobileTab('analytics')}
            className={`flex-1 min-w-[65px] py-2 rounded-lg transition cursor-pointer text-center ${
              mobileTab === 'analytics' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {config.language === 'hinglish' ? "Analytics" : "Analytics"}
          </button>
          <button
            onClick={() => setMobileTab('syllabus')}
            className={`flex-1 min-w-[65px] py-2 rounded-lg transition cursor-pointer text-center ${
              mobileTab === 'syllabus' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {config.language === 'hinglish' ? "Syllabus" : "Syllabus"}
          </button>
          <button
            onClick={() => setMobileTab('timer')}
            className={`flex-1 min-w-[65px] py-2 rounded-lg transition cursor-pointer text-center ${
              mobileTab === 'timer' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {config.language === 'hinglish' ? "25m Timer" : "Timer"}
          </button>
          <button
            onClick={() => setMobileTab('weekly')}
            className={`flex-1 min-w-[65px] py-2 rounded-lg transition cursor-pointer text-center ${
              mobileTab === 'weekly' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {config.language === 'hinglish' ? "7-Day Plan" : "Weekly"}
          </button>
        </div>

        {/* Main Content Multi-Panel Grid for Desktop & Tab-based for Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Today's Tasks (7 cols) */}
          <div className={`lg:col-span-7 space-y-6 ${mobileTab !== 'today' ? 'hidden lg:block' : ''}`}>
            <TodayTasks
              tasks={tasks}
              language={config.language}
              onToggleTask={handleToggleTask}
              onSelectForTimer={(id) => {
                setActiveTimerTaskId(id);
                setMobileTab('timer'); // Switch to timer on mobile
              }}
              onEditTask={(task) => setEditingTask(task)}
              onRescheduleTask={handleRescheduleTask}
              onDeleteTask={handleDeleteTask}
              onAddNewTask={handleAddNewTask}
              activeTimerTaskId={activeTimerTaskId}
            />
          </div>

          {/* Right Column: 25-Min Timer & Subjects/Syllabus Tracker (5 cols) */}
          <div className={`lg:col-span-5 space-y-6 ${mobileTab === 'today' ? 'hidden lg:block' : ''}`}>
            {/* Study Timer Component */}
            <div className={`${mobileTab !== 'timer' && mobileTab !== 'today' ? 'hidden lg:block' : ''}`}>
              <StudyTimer
                language={config.language}
                tasks={tasks}
                activeTaskId={activeTimerTaskId}
                onSelectTask={setActiveTimerTaskId}
                onCompleteTask={(id) => handleToggleTask(id)}
              />
            </div>

            {/* Subjects and Syllabus Tracker Component */}
            <div className={`${mobileTab !== 'syllabus' && mobileTab !== 'today' ? 'hidden lg:block' : ''}`}>
              <SubjectManager
                subjects={subjects}
                language={config.language}
                onUpdateSubjects={setSubjects}
                onOpenAddSubject={() => setIsAddSubjectOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* 3D Study Room Scene (Three.js PBR procedural models) */}
        <div className={`${mobileTab === '3d' ? 'block' : 'hidden lg:block'}`}>
          <ThreeStudyRoom language={config.language} />
        </div>

        {/* Study Analytics Recharts Bar Chart Section */}
        <div className={`${mobileTab === 'analytics' ? 'block' : 'hidden lg:block'}`}>
          <StudyAnalytics
            data={analyticsData}
            language={config.language}
            onUpdateDayHours={handleUpdateDayHours}
          />
        </div>

        {/* Weekly Roadmap Section */}
        <div className={`${mobileTab === 'weekly' ? 'block' : 'hidden lg:block'}`}>
          <WeeklyRoadmap
            weeklyPlan={weeklyPlan}
            language={config.language}
          />
        </div>

        {/* Floating Gemini AI Academic Chatbot */}
        <GeminiChatbot language={config.language} subjects={subjects} />

        {/* Footer Guarantee & Motivation */}
        <footer className="pt-6 pb-4 border-t border-[#152342] text-center text-xs text-slate-500 space-y-1">
          <p className="text-slate-400 font-medium">
            {TRANSLATIONS[config.language].motivationQuote}
          </p>
          <p className="text-[11px] text-slate-500">
            StudySaathi • Personalized AI Study Planner for Indian College Students • Dark Blue Edition
          </p>
        </footer>
      </main>

      {/* Modals */}
      <ScheduleConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => {
          setConfig(newConfig);
          // Recalculate tasks with new college/study hours
          setTasks(buildInitialTodayTasks(subjects, newConfig));
        }}
      />

      <EditTaskModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        subjects={subjects}
        language={config.language}
        onSaveTask={handleSaveEditedTask}
        onRescheduleToTomorrow={handleRescheduleToTomorrow}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        language={config.language}
        onAddSubject={handleAddSubject}
      />
    </div>
  );
}
