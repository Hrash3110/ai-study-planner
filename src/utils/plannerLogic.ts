import { Subject, BusySlot, StudyTask, ScheduleConfig, Language } from '../types/index.ts';

/**
 * Calculates days remaining until the given exam date.
 * Returns negative if the date is in the past, or 0 if today.
 */
export function calculateExamDaysRemaining(examDateStr: string, currentDate: Date = new Date()): number {
  if (!examDateStr) return 999;
  const target = new Date(examDateStr);
  // Set both to midnight UTC for clean day delta calculation
  const d1 = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const d2 = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Converts HH:MM string to total minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes from midnight to HH:MM format.
 */
export function minutesToTime(minutes: number): string {
  const m = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

/**
 * Checks if interval [startA, endA) overlaps with interval [startB, endB).
 */
export function isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return Math.max(a1, b1) < Math.min(a2, b2);
}

/**
 * Checks if a given time slot conflicts with college hours or any busy hours.
 */
export function isSlotConflictingWithBusyHours(
  start: string,
  end: string,
  college: { start: string; end: string },
  busyHours: BusySlot[]
): boolean {
  if (college.start && college.end && isTimeOverlapping(start, end, college.start, college.end)) {
    return true;
  }
  for (const slot of busyHours) {
    if (slot.start && slot.end && isTimeOverlapping(start, end, slot.start, slot.end)) {
      return true;
    }
  }
  return false;
}

/**
 * Computes syllabus completion percentage for a subject.
 */
export function calculateSubjectProgress(subject: Subject): number {
  if (!subject.topics || subject.topics.length === 0) return 0;
  const completed = subject.topics.filter(t => t.completed).length;
  return Math.round((completed / subject.topics.length) * 100);
}

/**
 * Computes overall syllabus completion percentage across all subjects.
 */
export function calculateOverallProgress(subjects: Subject[]): number {
  const allTopics = subjects.flatMap(s => s.topics || []);
  if (allTopics.length === 0) return 0;
  const completed = allTopics.filter(t => t.completed).length;
  return Math.round((completed / allTopics.length) * 100);
}

/**
 * Default sample subjects requested in the brief:
 * Maths, Physics, C Programming, English, and EVS
 */
export function getSampleSubjects(): Subject[] {
  // Use dates relative to now so countdowns are always lively and realistic
  const today = new Date();
  const formatOffsetDate = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'subj-1',
      name: 'C Programming',
      color: '#3b82f6', // Sapphire blue
      examDate: formatOffsetDate(4), // Exam in 4 days! High urgency
      topics: [
        { id: 'c-1', name: 'Control Structures & Loops', isWeak: false, completed: true },
        { id: 'c-2', name: 'Functions & Recursion', isWeak: false, completed: true },
        { id: 'c-3', name: 'Pointers & Dynamic Memory Allocation', isWeak: true, completed: false },
        { id: 'c-4', name: 'Structures, Unions & Typedef', isWeak: false, completed: false },
        { id: 'c-5', name: 'File Handling & Command Line Args', isWeak: true, completed: false },
      ],
    },
    {
      id: 'subj-2',
      name: 'Engineering Maths',
      color: '#8b5cf6', // Indigo / Purple
      examDate: formatOffsetDate(8), // Exam in 8 days
      topics: [
        { id: 'm-1', name: 'Matrices & Rank of Matrix', isWeak: false, completed: true },
        { id: 'm-2', name: 'Eigenvalues & Eigenvectors', isWeak: true, completed: false },
        { id: 'm-3', name: 'Differential Calculus & Mean Value Theorem', isWeak: false, completed: false },
        { id: 'm-4', name: 'First Order Ordinary Differential Equations', isWeak: true, completed: false },
        { id: 'm-5', name: 'Multiple Integrals & Vector Calculus', isWeak: false, completed: false },
      ],
    },
    {
      id: 'subj-3',
      name: 'Applied Physics',
      color: '#06b6d4', // Cyan
      examDate: formatOffsetDate(14), // Exam in 14 days
      topics: [
        { id: 'p-1', name: 'Wave Optics & Interference', isWeak: true, completed: false },
        { id: 'p-2', name: 'Diffraction & Polarization', isWeak: false, completed: false },
        { id: 'p-3', name: 'Lasers & Optical Fibers', isWeak: false, completed: true },
        { id: 'p-4', name: 'Quantum Mechanics (Schrödinger Equation)', isWeak: true, completed: false },
        { id: 'p-5', name: 'Electromagnetism & Maxwell Equations', isWeak: false, completed: false },
      ],
    },
    {
      id: 'subj-4',
      name: 'Professional English',
      color: '#10b981', // Emerald
      examDate: formatOffsetDate(21), // Exam in 21 days
      topics: [
        { id: 'e-1', name: 'Technical Report & Memo Writing', isWeak: false, completed: true },
        { id: 'e-2', name: 'Reading Comprehension & Critical Analysis', isWeak: false, completed: true },
        { id: 'e-3', name: 'Email Etiquette & Professional Correspondence', isWeak: false, completed: false },
        { id: 'e-4', name: 'Vocabulary & Common Grammatical Pitfalls', isWeak: true, completed: false },
      ],
    },
    {
      id: 'subj-5',
      name: 'Environmental Studies (EVS)',
      color: '#f59e0b', // Amber
      examDate: formatOffsetDate(28), // Exam in 28 days
      topics: [
        { id: 'evs-1', name: 'Ecosystems & Biodiversity Conservation', isWeak: false, completed: true },
        { id: 'evs-2', name: 'Environmental Pollution Control (Air/Water/Solid)', isWeak: false, completed: false },
        { id: 'evs-3', name: 'Renewable Energy & Sustainable Living', isWeak: false, completed: false },
        { id: 'evs-4', name: 'Environmental Protection Acts & Case Studies', isWeak: false, completed: false },
      ],
    },
  ];
}

export function getDefaultScheduleConfig(): ScheduleConfig {
  return {
    dailyStudyHours: 4,
    collegeTimings: {
      start: '09:00',
      end: '16:00',
    },
    busyHours: [
      { id: 'b-1', label: 'Morning Commute', start: '08:00', end: '08:45' },
      { id: 'b-2', label: 'Evening Refresh / Commute', start: '16:15', end: '17:15' },
      { id: 'b-3', label: 'Dinner & Family Time', start: '20:30', end: '21:30' },
    ],
    language: 'hinglish',
  };
}

/**
 * Default 7-day study record for analytics
 */
export function getDefaultWeeklyAnalytics(dailyStudyHours: number = 4) {
  return [
    { day: 'Mon', fullDay: 'Monday', targetHours: dailyStudyHours, completedHours: 3.5, pomodoroSessions: 6, primarySubject: 'C Programming' },
    { day: 'Tue', fullDay: 'Tuesday', targetHours: dailyStudyHours, completedHours: 4.0, pomodoroSessions: 7, primarySubject: 'Engineering Maths' },
    { day: 'Wed', fullDay: 'Wednesday', targetHours: dailyStudyHours, completedHours: 2.8, pomodoroSessions: 4, primarySubject: 'Applied Physics' },
    { day: 'Thu', fullDay: 'Thursday', targetHours: dailyStudyHours, completedHours: 4.5, pomodoroSessions: 8, primarySubject: 'C Programming' },
    { day: 'Fri', fullDay: 'Friday', targetHours: dailyStudyHours, completedHours: 3.2, pomodoroSessions: 5, primarySubject: 'Engineering Maths' },
    { day: 'Sat', fullDay: 'Saturday', targetHours: Math.min(dailyStudyHours + 1.5, 6), completedHours: 5.5, pomodoroSessions: 10, primarySubject: 'Weak Topics Blitz' },
    { day: 'Sun', fullDay: 'Sunday', targetHours: Math.min(dailyStudyHours + 1, 5), completedHours: 4.2, pomodoroSessions: 7, primarySubject: 'Formula Revision' },
  ];
}

/**
 * Computes summary stats from weekly analytics data
 */
export function calculateWeeklyTotals(records: { targetHours: number; completedHours: number; day: string }[]) {
  const totalCompleted = Number(records.reduce((acc, r) => acc + (r.completedHours || 0), 0).toFixed(1));
  const totalTarget = Number(records.reduce((acc, r) => acc + (r.targetHours || 0), 0).toFixed(1));
  const percentOfGoal = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
  
  let peakDay = records[0]?.day || 'Mon';
  let maxHours = records[0]?.completedHours || 0;
  for (const r of records) {
    if (r.completedHours > maxHours) {
      maxHours = r.completedHours;
      peakDay = r.day;
    }
  }

  return { totalCompleted, totalTarget, percentOfGoal, peakDay, maxHours };
}

/**
 * Generates candidate study slots after college & busy hours.
 */
export function generateValidStudySlots(
  targetStudyMinutes: number,
  college: { start: string; end: string },
  busyHours: BusySlot[]
): { start: string; end: string; mins: number; isBreak?: boolean }[] {
  // Candidate available blocks in the student day (early morning, evening, night)
  const candidateBlocks = [
    { start: '06:30', end: '07:30' },
    { start: '17:30', end: '18:30' },
    { start: '18:40', end: '19:40' },
    { start: '19:45', end: '20:30' },
    { start: '21:40', end: '22:40' },
    { start: '22:50', end: '23:35' },
  ];

  const validSlots: { start: string; end: string; mins: number; isBreak?: boolean }[] = [];
  let accumulatedStudyMins = 0;

  for (const block of candidateBlocks) {
    if (accumulatedStudyMins >= targetStudyMinutes) break;

    // Check conflict
    if (!isSlotConflictingWithBusyHours(block.start, block.end, college, busyHours)) {
      const duration = timeToMinutes(block.end) - timeToMinutes(block.start);
      if (duration >= 25) {
        validSlots.push({
          start: block.start,
          end: block.end,
          mins: duration,
        });
        accumulatedStudyMins += duration;

        // Add 10-min break if we still have study time remaining
        if (accumulatedStudyMins < targetStudyMinutes) {
          const breakStartMin = timeToMinutes(block.end);
          const breakEndMin = breakStartMin + 10;
          const breakStart = minutesToTime(breakStartMin);
          const breakEnd = minutesToTime(breakEndMin);
          if (!isSlotConflictingWithBusyHours(breakStart, breakEnd, college, busyHours)) {
            validSlots.push({
              start: breakStart,
              end: breakEnd,
              mins: 10,
              isBreak: true,
            });
          }
        }
      }
    }
  }

  return validSlots;
}

/**
 * Builds realistic, prioritised today tasks list based on subjects, weak topics, and exam urgency.
 */
export function buildInitialTodayTasks(subjects: Subject[], config: ScheduleConfig): StudyTask[] {
  const targetStudyMins = config.dailyStudyHours * 60;
  const slots = generateValidStudySlots(targetStudyMins, config.collegeTimings, config.busyHours);
  const isHinglish = config.language === 'hinglish';

  // Sort subjects by urgency: nearest exam first
  const sortedSubjects = [...subjects].sort((a, b) => {
    const da = calculateExamDaysRemaining(a.examDate);
    const db = calculateExamDaysRemaining(b.examDate);
    return da - db;
  });

  const tasks: StudyTask[] = [];
  let subjectIdx = 0;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.isBreak) {
      tasks.push({
        id: `task-break-${i}`,
        subject: isHinglish ? 'Break / Chai' : 'Rest Break',
        topic: isHinglish ? 'Pani piyo aur thoda stretch karo' : 'Hydrate, stretch & rest eyes',
        startTime: slot.start,
        endTime: slot.end,
        durationMinutes: slot.mins,
        type: 'break',
        isWeakTopic: false,
        completed: false,
        notes: isHinglish ? 'Screen se door raho!' : 'Step away from screen!',
      });
      continue;
    }

    const currentSubj = sortedSubjects[subjectIdx % sortedSubjects.length];
    subjectIdx++;

    if (!currentSubj) continue;

    // Pick weak topic first if available, else first uncompleted topic
    const weakTopic = currentSubj.topics.find(t => t.isWeak && !t.completed);
    const uncompletedTopic = currentSubj.topics.find(t => !t.completed);
    const chosenTopic = weakTopic || uncompletedTopic || currentSubj.topics[0] || { name: 'Full Chapter Revision', isWeak: false };

    const isRevision = i === slots.length - 1; // Last slot for revision
    const taskType = isRevision ? 'revision' : chosenTopic.isWeak ? 'practice' : 'study';

    tasks.push({
      id: `task-${Date.now()}-${i}`,
      subject: currentSubj.name,
      topic: chosenTopic.name,
      startTime: slot.start,
      endTime: slot.end,
      durationMinutes: slot.mins,
      type: taskType,
      isWeakTopic: Boolean(chosenTopic.isWeak),
      completed: false,
      notes: chosenTopic.isWeak
        ? (isHinglish ? 'Weak topic hai: Pehle formula & concepts dekho phir 3 questions solve karo.' : 'Weak topic: Review core rules first, then attempt 3 standard questions.')
        : isRevision
        ? (isHinglish ? 'Spaced repetition: Aaj jo padha usko bina dekhe likhne ki koshish karo.' : 'Spaced repetition: Active recall summary without checking notes.')
        : (isHinglish ? 'Notes banao aur key definitions highlight karo.' : 'Take concise notes and highlight core theorems.'),
    });
  }

  return tasks;
}

/**
 * UI Translations dictionary
 */
export const TRANSLATIONS = {
  en: {
    appTitle: 'StudySaathi',
    appSubtitle: 'Your AI Academic Copilot & Study Planner',
    todayTasks: "Today's Study Plan",
    todaySubtitle: 'Calibrated to avoid college hours and prioritized by exam urgency',
    generateAIPlan: 'Generate AI Plan with Gemini',
    generating: 'Gemini is thinking...',
    pomodoroTimer: '25-Min Study Focus Timer',
    examCountdown: 'Exam Countdowns',
    subjectsSyllabus: 'Subjects & Syllabus Tracker',
    weeklyRoadmap: '7-Day Weekly Roadmap',
    scheduleSettings: 'College & Busy Timings',
    availableHours: 'Daily Study Hours',
    collegeHours: 'College Timings',
    busySlots: 'Other Busy Hours',
    addBusySlot: '+ Add Busy Slot',
    addSubject: '+ Add Subject',
    editSubject: 'Edit Subject',
    deleteSubject: 'Delete',
    addTopic: '+ Add Topic',
    weakTopicBadge: 'Weak Topic',
    markWeak: 'Mark as Weak',
    markedWeak: 'Weak Area',
    markDone: 'Done',
    pending: 'Pending',
    allDoneCelebration: "🎉 Awesome! You finished today's study targets!",
    completedCount: 'tasks completed',
    streakBadge: 'Day Streak',
    startSession: 'Start 25m Focus',
    pauseSession: 'Pause',
    resetTimer: 'Reset',
    shortBreak: '5m Break',
    longBreak: '15m Long Break',
    studyMode: '25m Study',
    timerLinkedTo: 'Active Task',
    selectTaskToTime: 'Select a task to link timer',
    reschedule: 'Reschedule',
    editTask: 'Edit Task',
    deleteTask: 'Delete',
    addTask: '+ Add Custom Task',
    saveChanges: 'Save',
    cancel: 'Cancel',
    noOverlapGuarantee: 'No college overlap guarantee: study slots are scheduled strictly outside busy timings.',
    resetSampleData: 'Reset to Sample Data',
    motivationQuote: 'Consistency beats intensity. One focused 25-minute block can change your semester!',
    studyAnalytics: 'Study Analytics',
    analyticsSubtitle: 'Weekly study hours distribution and consistency report',
    weeklyStudyHours: 'Weekly Study Hours (Target vs Completed)',
    targetHours: 'Target Goal',
    completedHours: 'Completed',
    totalStudied: 'Total Hours Studied',
    goalAchieved: 'Goal Achieved',
    peakDay: 'Peak Study Day',
    logHours: 'Log Today Study',
  },
  hinglish: {
    appTitle: 'StudySaathi',
    appSubtitle: 'Aapka AI Study Buddy • Sab sort ho jayega!',
    todayTasks: 'Aaj Ka Study Target',
    todaySubtitle: 'College hours ke bilkul baad set hai, weak topics aur exams ko pehli priority di hai',
    generateAIPlan: 'Gemini AI se Fresh Plan Banao',
    generating: 'Gemini study plan bana raha hai...',
    pomodoroTimer: '25-Minute Focus Timer',
    examCountdown: 'Exams Countdown',
    subjectsSyllabus: 'Subjects & Syllabus Tracker',
    weeklyRoadmap: 'Hafte Ka Master Plan (7 Days)',
    scheduleSettings: 'College & Busy Hours Set Karo',
    availableHours: 'Roz Kitna Padhna Hai',
    collegeHours: 'College Ka Time',
    busySlots: 'Coaching / Commute / Dinner Timings',
    addBusySlot: '+ Naya Busy Slot Jodo',
    addSubject: '+ Naya Subject Jodo',
    editSubject: 'Subject Edit Karo',
    deleteSubject: 'Hatao',
    addTopic: '+ Naya Chapter/Topic',
    weakTopicBadge: 'Mushkil Topic',
    markWeak: 'Mushkil Tag Karo',
    markedWeak: 'Weak Area',
    markDone: 'Ho Gaya',
    pending: 'Baki Hai',
    allDoneCelebration: '🎉 Kamaal kar diya! Aaj ke saare targets complete ho gaye!',
    completedCount: 'tasks khatam',
    streakBadge: 'Din Ki Streak',
    startSession: 'Padhai Chalu Karo',
    pauseSession: 'Ruko',
    resetTimer: 'Dobara Shuru',
    shortBreak: '5 Min Ka Break',
    longBreak: '15 Min Long Break',
    studyMode: '25 Min Padhai',
    timerLinkedTo: 'Abhi Ye Padh Rahe Ho',
    selectTaskToTime: 'Timer ke sath task jodo',
    reschedule: 'Time Badlo / Kal Shift Karo',
    editTask: 'Task Edit Karo',
    deleteTask: 'Hatao',
    addTask: '+ Khud Ka Task Jodo',
    saveChanges: 'Save Karo',
    cancel: 'Cancel',
    noOverlapGuarantee: 'No overlap guarantee: College aur coaching timings ke beech padhai kabhi clash nahi hogi.',
    resetSampleData: 'Sample Subjects Wapas Lao',
    motivationQuote: 'Roz thoda-thoda padhoge toh exam night mein panic nahi hoga. Chalo ek 25 min session complete karte hain!',
    studyAnalytics: 'Study Analytics & Report',
    analyticsSubtitle: 'Hafte bhar ki padhai ka chart aur target comparison',
    weeklyStudyHours: 'Hafte Ki Padhai (Target vs Completed Ghante)',
    targetHours: 'Target Goal',
    completedHours: 'Complete Kiya',
    totalStudied: 'Total Padhai Ki',
    goalAchieved: 'Target Complete',
    peakDay: 'Sabse Best Din',
    logHours: 'Aaj Ka Time Log Karo',
  },
};
