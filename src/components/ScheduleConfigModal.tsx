import React, { useState } from 'react';
import { X, Clock, School, ShieldCheck, Plus, Trash2, Globe } from 'lucide-react';
import { ScheduleConfig, BusySlot, Language } from '../types/index.ts';
import { TRANSLATIONS } from '../utils/plannerLogic.ts';

interface ScheduleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScheduleConfig;
  onSaveConfig: (newConfig: ScheduleConfig) => void;
}

export const ScheduleConfigModal: React.FC<ScheduleConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[config.language];
  const [dailyHours, setDailyHours] = useState<number>(config.dailyStudyHours);
  const [collegeStart, setCollegeStart] = useState<string>(config.collegeTimings.start);
  const [collegeEnd, setCollegeEnd] = useState<string>(config.collegeTimings.end);
  const [busySlots, setBusySlots] = useState<BusySlot[]>(config.busyHours);
  const [lang, setLang] = useState<Language>(config.language);

  // New busy slot form state
  const [newLabel, setNewLabel] = useState('');
  const [newStart, setNewStart] = useState('17:00');
  const [newEnd, setNewEnd] = useState('18:00');

  const handleAddBusySlot = () => {
    if (!newLabel.trim()) return;
    const newSlot: BusySlot = {
      id: `busy-${Date.now()}`,
      label: newLabel.trim(),
      start: newStart,
      end: newEnd,
    };
    setBusySlots([...busySlots, newSlot]);
    setNewLabel('');
  };

  const handleDeleteBusySlot = (id: string) => {
    setBusySlots(busySlots.filter((b) => b.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      dailyStudyHours: Number(dailyHours),
      collegeTimings: {
        start: collegeStart,
        end: collegeEnd,
      },
      busyHours: busySlots,
      language: lang,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0e1730] border border-[#233a70] p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1c2e59] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t.scheduleSettings}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'hinglish' 
                  ? 'In timings ke hisaab se StudySaathi padhai ka plan arrange karega' 
                  : 'StudySaathi will schedule study strictly outside these hours'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2c59] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Daily Available Study Hours */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{t.availableHours}</span>
              </label>
              <span className="text-sm font-mono font-bold text-cyan-400 bg-[#091024] px-2.5 py-1 rounded-lg border border-[#1d305e]">
                {dailyHours} {lang === 'hinglish' ? 'Ghante / Din' : 'Hours / Day'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>1h (Light)</span>
              <span>4h (Balanced)</span>
              <span>8h (Intense)</span>
            </div>
          </div>

          {/* College Timings */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#091024] border border-[#1a2d59]">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <School className="w-4 h-4 text-blue-400" />
              <span>{t.collegeHours}</span>
            </label>
            <p className="text-[11px] text-slate-400">
              {lang === 'hinglish' 
                ? 'College ke waqt koi bhi padhai schedule nahi hogi' 
                : 'Study sessions will never overlap with this time window'}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">College Start:</span>
                <input
                  type="time"
                  value={collegeStart}
                  onChange={(e) => setCollegeStart(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#0c152e] border border-[#223666] text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">College End:</span>
                <input
                  type="time"
                  value={collegeEnd}
                  onChange={(e) => setCollegeEnd(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#0c152e] border border-[#223666] text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Other Busy Hours (Coaching, Commute, Dinner) */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-200">
              {t.busySlots}
            </label>
            <div className="space-y-2">
              {busySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#091024] border border-[#1b2f5c] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{slot.label}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({slot.start} - {slot.end})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBusySlot(slot.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    aria-label={`Delete busy slot ${slot.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Busy Slot inputs */}
            <div className="p-3 rounded-xl bg-[#091024]/70 border border-[#18284e] space-y-2">
              <span className="text-[11px] font-medium text-slate-400 block">
                {lang === 'hinglish' ? '+ Naya busy slot jodo (Gym, Commute, Coaching):' : '+ Add new busy slot (Gym, Coaching, Dinner):'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Activity label (e.g. Gym)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0b1329] border border-[#20335e] text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-[#0b1329] border border-[#20335e] text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-[#0b1329] border border-[#20335e] text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="button"
                onClick={handleAddBusySlot}
                disabled={!newLabel.trim()}
                className="w-full py-1.5 rounded-lg bg-[#152449] hover:bg-[#1d3266] text-cyan-300 text-xs font-semibold border border-[#233c77] transition cursor-pointer disabled:opacity-50"
              >
                {t.addBusySlot}
              </button>
            </div>
          </div>

          {/* Language Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Language / Bhasha</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLang('hinglish')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                  lang === 'hinglish'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md'
                    : 'bg-[#091024] border-[#1b2f5c] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇮🇳 Hinglish (English + Hindi)</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                  lang === 'en'
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-md'
                    : 'bg-[#091024] border-[#1b2f5c] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>
          </div>

          {/* No Overlap Guarantee Footer */}
          <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-600/40 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-cyan-200 leading-relaxed">
              {t.noOverlapGuarantee}
            </p>
          </div>

          {/* Save & Cancel buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1c2e59]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 transition cursor-pointer"
            >
              {t.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
