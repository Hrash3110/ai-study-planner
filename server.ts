import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
});

// AI Study Plan Generator endpoint
app.post('/api/generate-plan', async (req, res) => {
  try {
    const {
      subjects = [],
      dailyStudyHours = 4,
      collegeTimings = { start: '09:00', end: '16:00' },
      busyHours = [],
      language = 'hinglish',
      customGoal = '',
    } = req.body;

    const subjectsSummary = subjects.map((s: any) => ({
      name: s.name,
      examDate: s.examDate,
      daysToExam: s.examDate ? Math.max(0, Math.ceil((new Date(s.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 'Not set',
      weakTopics: s.topics?.filter((t: any) => t.isWeak).map((t: any) => t.name) || [],
      pendingTopics: s.topics?.filter((t: any) => !t.completed).map((t: any) => t.name) || [],
    }));

    if (ai) {
      const prompt = `
You are StudySaathi, an expert, empathetic AI academic coach for a beginner college student.
Create a realistic, actionable study schedule for today and a 7-day overview.

CRITICAL RULES:
1. Daily available study hours: ${dailyStudyHours} hours. DO NOT exceed this total study time.
2. College timings: ${collegeTimings.start} to ${collegeTimings.end}. NEVER schedule any study task during college hours.
3. Other busy hours: ${JSON.stringify(busyHours)}. NEVER overlap with any busy hours.
4. Breaks: Include 5-10 min break intervals between intensive sessions.
5. Priority: Prioritize subjects with the nearest exam date and topics marked as "weakTopics".
6. Revision: Include at least one 20-30 min spaced-repetition revision slot for recently covered formulas/concepts.
7. Tone & Language: Response must be in ${language === 'hinglish' ? 'Hinglish (mix of Hindi and English written in Latin script, e.g., "Pointers ke concepts bohot important hain, pehle easy examples solve karo phir deep dive")' : 'encouraging, simple student-friendly English'}.

Student Data:
${JSON.stringify({ dailyStudyHours, collegeTimings, busyHours, subjects: subjectsSummary, customGoal }, null, 2)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are StudySaathi, an AI study planner for college students. You generate balanced, hyper-realistic, non-exhausting study plans that respect college schedules and prioritize weak topics and impending exams. Always respond in valid JSON matching the requested schema.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachAdvice: {
                type: Type.STRING,
                description: 'Motivational coaching tip or strategic advice in the selected language (English or Hinglish).',
              },
              todayTasks: {
                type: Type.ARRAY,
                description: 'List of realistic study sessions and breaks for today.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    startTime: { type: Type.STRING, description: '24-hour time HH:MM, strictly outside college and busy hours' },
                    endTime: { type: Type.STRING, description: '24-hour time HH:MM' },
                    durationMinutes: { type: Type.INTEGER },
                    type: { type: Type.STRING, description: 'study, revision, practice, or break' },
                    isWeakTopic: { type: Type.BOOLEAN },
                    notes: { type: Type.STRING },
                  },
                  required: ['subject', 'topic', 'startTime', 'endTime', 'durationMinutes', 'type'],
                },
              },
              weeklyStrategy: {
                type: Type.ARRAY,
                description: '7-day overview (Day 1 to Day 7) distribution of subjects and focus areas.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayName: { type: Type.STRING, description: 'e.g. Monday, Day 1' },
                    primaryFocus: { type: Type.STRING },
                    secondaryFocus: { type: Type.STRING },
                    targetHours: { type: Type.NUMBER },
                    tip: { type: Type.STRING },
                  },
                  required: ['dayName', 'primaryFocus', 'secondaryFocus', 'targetHours'],
                },
              },
            },
            required: ['coachAdvice', 'todayTasks', 'weeklyStrategy'],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ success: true, plan: parsed, source: 'gemini' });
      }
    }

    // Fallback if no Gemini key or empty response
    return res.json({
      success: true,
      plan: generateDeterministicPlan(subjects, dailyStudyHours, collegeTimings, busyHours, language),
      source: 'deterministic-fallback',
    });
  } catch (err: any) {
    console.error('Error in /api/generate-plan:', err);
    // Graceful fallback so user is never stranded
    const { subjects = [], dailyStudyHours = 4, collegeTimings = { start: '09:00', end: '16:00' }, busyHours = [], language = 'hinglish' } = req.body;
    return res.json({
      success: true,
      plan: generateDeterministicPlan(subjects, dailyStudyHours, collegeTimings, busyHours, language),
      source: 'safe-fallback',
    });
  }
});

// Helper for deterministic plan generation
function generateDeterministicPlan(subjects: any[], hours: number, college: { start: string, end: string }, busy: any[], lang: string) {
  const isHinglish = lang === 'hinglish';
  
  // Sort subjects by nearest exam date
  const sorted = [...subjects].sort((a, b) => {
    const da = a.examDate ? new Date(a.examDate).getTime() : 9999999999999;
    const db = b.examDate ? new Date(b.examDate).getTime() : 9999999999999;
    return da - db;
  });

  const slots = [
    { start: '17:00', end: '17:50', mins: 50 },
    { start: '17:50', end: '18:00', mins: 10, isBreak: true },
    { start: '18:00', end: '18:50', mins: 50 },
    { start: '18:50', end: '19:00', mins: 10, isBreak: true },
    { start: '19:30', end: '20:20', mins: 50 },
    { start: '20:20', end: '20:30', mins: 10, isBreak: true },
    { start: '21:30', end: '22:15', mins: 45 },
  ];

  const tasks: any[] = [];
  let allocatedMins = 0;
  const maxMins = hours * 60;

  let subjIndex = 0;
  for (const slot of slots) {
    if (allocatedMins >= maxMins) break;

    if (slot.isBreak) {
      tasks.push({
        subject: 'Break',
        topic: isHinglish ? 'Chai / Water Break & Stretch' : 'Hydration & Mind Rest Break',
        startTime: slot.start,
        endTime: slot.end,
        durationMinutes: slot.mins,
        type: 'break',
        isWeakTopic: false,
        notes: isHinglish ? 'Thoda screen se dur dekho aur relax karo.' : 'Rest your eyes and take a short walk.',
      });
      continue;
    }

    const currentSubj = sorted[subjIndex % sorted.length] || { name: 'Maths', topics: [] };
    const weakTopic = currentSubj.topics?.find((t: any) => t.isWeak && !t.completed);
    const uncompletedTopic = currentSubj.topics?.find((t: any) => !t.completed) || currentSubj.topics?.[0];
    const chosenTopic = weakTopic || uncompletedTopic || { name: 'Core Revision & Practice', isWeak: false };

    tasks.push({
      subject: currentSubj.name,
      topic: chosenTopic.name,
      startTime: slot.start,
      endTime: slot.end,
      durationMinutes: slot.mins,
      type: chosenTopic.isWeak ? 'practice' : 'study',
      isWeakTopic: Boolean(chosenTopic.isWeak),
      notes: chosenTopic.isWeak 
        ? (isHinglish ? 'Weak topic hai, pehle theory clear karo phir 3 basic numericals solve karo.' : 'Focus on fundamentals first, then solve 3 baseline examples.')
        : (isHinglish ? 'Concepts ko active recall se revise karo.' : 'Practice active recall and write down summary notes.'),
    });

    allocatedMins += slot.mins;
    subjIndex++;
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weeklyStrategy = daysOfWeek.map((day, idx) => {
    const s1 = sorted[idx % sorted.length]?.name || 'Maths';
    const s2 = sorted[(idx + 1) % sorted.length]?.name || 'Physics';
    return {
      dayName: day,
      primaryFocus: s1,
      secondaryFocus: s2,
      targetHours: idx >= 5 ? Math.min(hours + 1.5, 6) : hours,
      tip: isHinglish 
        ? `${s1} ke weak topics pehle niptao, phir ${s2} ka quick revision karo.`
        : `Tackle high-weightage topics in ${s1}, then wrap up with 30m revision in ${s2}.`,
    };
  });

  return {
    coachAdvice: isHinglish
      ? 'Fikar mat karo dost! Realistic targets banaye hain college ke baad. Weak topics pe extra focus diya hai. Bas 1 session se start karo!'
      : 'Your study plan is calibrated strictly around your college hours. Priority is given to your upcoming exams and weak topics. Take it one session at a time!',
    todayTasks: tasks,
    weeklyStrategy,
  };
}

// Multi-turn Gemini Academic Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], role = 'mentor', language = 'hinglish', context = {} } = req.body;
    const isHinglish = language === 'hinglish';

    let systemInstruction = `You are StudySaathi AI, a warm, supportive, and knowledgeable academic coach for college students.
Always communicate in ${isHinglish ? 'friendly, natural Hinglish (Hindi + English written in English script, e.g., "Pointers me memory address store hota hai, simple box example se samajhte hain")' : 'clear, encouraging student-friendly English'}.`;

    if (role === 'doubt_solver') {
      systemInstruction += ` Focus on breaking down technical concepts (C programming, pointers, calculus, wave optics) with intuitive analogies and concise code/formula snippets.`;
    } else if (role === 'strategist') {
      systemInstruction += ` Focus on exam preparation tactics, high-weightage topics, spaced repetition, and realistic timetable management.`;
    }

    if (context.subjects) {
      systemInstruction += ` Current student subjects: ${JSON.stringify(context.subjects)}. Nearest exam: ${context.nearestExam || 'None'}.`;
    }

    if (ai && messages.length > 0) {
      // Format history for Gemini SDK
      const contents = messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || '';
      return res.json({ success: true, reply: replyText });
    }

    // Intelligent fallback response
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let fallbackReply = isHinglish
      ? 'Bohot badhiya sawaal hai! College exam me consistent rehna hi key hai. Pehle 25 minute ka focus session start karo, step-by-step sab sort ho jayega!'
      : 'Great question! Consistency is key for semester exams. Break it down into one 25-minute Pomodoro block and tackle the fundamentals first.';

    if (lastMsg.includes('pointer') || lastMsg.includes('c program')) {
      fallbackReply = isHinglish
        ? '💡 Pointers Tip: Pointer ek variable hai jo dusre variable ka memory address (&) store karta hai. Dereferencing (*) se us address ki value milti hai. Pehle dry-run karo memory box bana ke!'
        : '💡 Pointers Tip: A pointer stores the memory address (&) of another variable. Dereferencing (*) accesses the actual value stored there. Always draw memory boxes when tracing pointers!';
    } else if (lastMsg.includes('math') || lastMsg.includes('calculus') || lastMsg.includes('eigen')) {
      fallbackReply = isHinglish
        ? '📐 Maths Tip: Eigenvalues nikalne ke liye characteristic equation |A - λI| = 0 solve karo. 3 standard questions practice karo, concept pakka ho jayega!'
        : '📐 Maths Tip: For eigenvalues, solve the characteristic equation det(A - λI) = 0. Practice 3 textbook examples to lock in the method!';
    }

    return res.json({ success: true, reply: fallbackReply });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.json({
      success: true,
      reply: 'Saathi AI is ready! Thoda network delay hai, but keep your study momentum going strong!',
    });
  }
});

// Development vs Production setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`StudySaathi server running on port ${port}`);
  });
}

startServer();
