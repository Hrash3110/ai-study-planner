import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Brain,
  Lightbulb,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Language, Subject } from '../types/index.ts';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface GeminiChatbotProps {
  language: Language;
  subjects: Subject[];
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ language, subjects }) => {
  const isHinglish = language === 'hinglish';
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<'mentor' | 'doubt_solver' | 'strategist'>('doubt_solver');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      role: 'model',
      content: isHinglish
        ? 'Namaste! Main hoon StudySaathi AI. Koi formula samajh nahi aa raha ya C Programming ke Pointers mein doubt hai? Poocho, step-by-step clear karte hain!'
        : 'Hello! I am StudySaathi AI. Stuck on a concept, formula, or exam strategy? Ask me anything and let\'s solve it together!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          role,
          language,
          context: {
            subjects: subjects.map((s) => s.name),
            nearestExam: subjects[0]?.name,
          },
        }),
      });

      const data = await res.json();
      const botReply = data.reply || (isHinglish ? 'Bohot accha sawaal! Is topic ko step-by-step solve karo.' : 'Good question! Let us tackle this methodically.');

      const modelMsg: Message = {
        id: `msg-${Date.now()}-bot`,
        role: 'model',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        content: isHinglish
          ? 'Thoda network issue lag raha hai, par himmat mat haro! Aapka focus session shuru rakho.'
          : 'Encountered a quick connection hiccup, but keep your study momentum going!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = isHinglish
    ? [
        'C Programming mein Pointers aur & vs * clearly samjhao',
        'Engineering Maths ke Eigenvalues kaise find karte hain?',
        'Wave Optics mein Interference ka quick revision karwao',
        'Exam se 3 din pehle revision plan kaisa hona chahiye?',
      ]
    : [
        'Explain Pointers in C with memory address analogy',
        'How do I calculate Eigenvalues in Linear Algebra?',
        'Quick derivation summary of Wave Optics interference',
        'What is the best 3-day exam revision strategy?',
      ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-2xl shadow-cyan-900/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-400/40"
          aria-label="Open StudySaathi AI Chatbot"
        >
          <Bot className="w-4 h-4 text-cyan-200" />
          <span>{isHinglish ? 'Doubt Pucho (AI Bot)' : 'Ask Saathi AI'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* Slide-in Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[85vh] h-[580px] rounded-2xl bg-[#0b142c] border border-[#233c77] shadow-2xl flex flex-col overflow-hidden animate-fadeIn backdrop-blur-md">
          {/* Header */}
          <div className="p-3.5 bg-[#0e1938] border-b border-[#1c2e59] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-600/20 text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  StudySaathi AI
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                    Gemini 3.8
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isHinglish ? '24/7 Academic Doubt Solver & Coach' : 'College Academic Assistant'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2d5c] transition cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Switcher */}
          <div className="p-2 bg-[#080f24] border-b border-[#162547] flex items-center justify-between gap-1 text-[11px]">
            <button
              onClick={() => setRole('doubt_solver')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                role === 'doubt_solver'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>{isHinglish ? 'Doubt Solver' : 'Doubt Solver'}</span>
            </button>
            <button
              onClick={() => setRole('strategist')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                role === 'strategist'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isHinglish ? 'Exam Strategy' : 'Exam Strategy'}</span>
            </button>
            <button
              onClick={() => setRole('mentor')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                role === 'mentor'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3 h-3" />
              <span>{isHinglish ? 'Peer Mentor' : 'Peer Mentor'}</span>
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#070d1e]/80">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-[#101c3d] text-slate-200 border border-[#203463] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <span className="block text-[9px] text-slate-400/80 mt-1 text-right">
                    {m.timestamp}
                  </span>
                </div>
                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#101c3d] border border-[#203463] rounded-2xl p-2.5 rounded-tl-none flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">{isHinglish ? 'StudySaathi likh raha hai...' : 'Thinking...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-1.5 bg-[#080e22] border-t border-[#162547] overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#101b38] hover:bg-[#182954] text-[10px] text-cyan-300 border border-[#1f356b] transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-[#0e1938] border-t border-[#1c2e59] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isHinglish ? 'Apna doubt ya sawaal yahan likho...' : 'Type your academic doubt or question...'}
              className="flex-1 px-3 py-2 rounded-xl bg-[#070d1e] border border-[#223666] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition cursor-pointer shadow-md"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
