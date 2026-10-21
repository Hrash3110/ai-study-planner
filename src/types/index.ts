export type Language = 'en' | 'hinglish';

export interface Topic {
  id: string;
  name: string;
  isWeak: boolean;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  examDate: string; // YYYY-MM-DD
  topics: Topic[];
}

export interface BusySlot {
  id: string;
  label: string;
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  type: 'study' | 'revision' | 'practice' | 'break';
  isWeakTopic: boolean;
  completed: boolean;
  notes?: string;
  date?: string; // YYYY-MM-DD
}

export interface WeeklyDayPlan {
  dayName: string;
  primaryFocus: string;
  secondaryFocus: string;
  targetHours: number;
  tip: string;
}

export interface DayStudyRecord {
  day: string;
  fullDay: string;
  targetHours: number;
  completedHours: number;
  pomodoroSessions: number;
  primarySubject: string;
}

export interface AIPlanResponse {
  coachAdvice: string;
  todayTasks: Omit<StudyTask, 'id' | 'completed'>[];
  weeklyStrategy: WeeklyDayPlan[];
}

export interface ScheduleConfig {
  dailyStudyHours: number;
  collegeTimings: {
    start: string;
    end: string;
  };
  busyHours: BusySlot[];
  language: Language;
}
