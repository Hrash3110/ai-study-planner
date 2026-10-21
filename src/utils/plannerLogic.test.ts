import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExamDaysRemaining,
  isTimeOverlapping,
  isSlotConflictingWithBusyHours,
  calculateSubjectProgress,
  calculateOverallProgress,
  generateValidStudySlots,
  buildInitialTodayTasks,
  getSampleSubjects,
  getDefaultScheduleConfig,
  calculateWeeklyTotals,
} from './plannerLogic.ts';

test('calculateExamDaysRemaining returns correct difference', () => {
  const base = new Date('2026-10-20T12:00:00Z');
  const targetSame = '2026-10-20';
  assert.equal(calculateExamDaysRemaining(targetSame, base), 0);

  const targetFuture = '2026-10-25';
  assert.equal(calculateExamDaysRemaining(targetFuture, base), 5);

  const targetPast = '2026-10-18';
  assert.equal(calculateExamDaysRemaining(targetPast, base), -2);
});

test('isTimeOverlapping detects interval collisions accurately', () => {
  // Overlapping
  assert.equal(isTimeOverlapping('09:00', '16:00', '10:00', '12:00'), true);
  assert.equal(isTimeOverlapping('10:00', '12:00', '09:00', '16:00'), true);
  assert.equal(isTimeOverlapping('15:30', '16:30', '09:00', '16:00'), true);

  // Exact boundaries (end of one is start of another) -> does not overlap
  assert.equal(isTimeOverlapping('08:00', '09:00', '09:00', '16:00'), false);
  assert.equal(isTimeOverlapping('16:00', '17:00', '09:00', '16:00'), false);

  // Completely disjoint
  assert.equal(isTimeOverlapping('17:00', '18:00', '09:00', '16:00'), false);
  assert.equal(isTimeOverlapping('06:00', '07:30', '09:00', '16:00'), false);
});

test('isSlotConflictingWithBusyHours detects college and busy slots', () => {
  const college = { start: '09:00', end: '16:00' };
  const busy = [
    { id: '1', label: 'Commute', start: '08:00', end: '08:45' },
    { id: '2', label: 'Dinner', start: '20:30', end: '21:30' },
  ];

  // College hours conflict
  assert.equal(isSlotConflictingWithBusyHours('11:00', '12:00', college, busy), true);
  // Dinner conflict
  assert.equal(isSlotConflictingWithBusyHours('20:45', '21:45', college, busy), true);
  // Free slot (17:30 to 18:30)
  assert.equal(isSlotConflictingWithBusyHours('17:30', '18:30', college, busy), false);
  // Night free slot (21:45 to 22:45)
  assert.equal(isSlotConflictingWithBusyHours('21:45', '22:45', college, busy), false);
});

test('calculateSubjectProgress returns accurate percentage', () => {
  const subject = {
    id: 's1',
    name: 'Physics',
    color: '#06b6d4',
    examDate: '2026-11-01',
    topics: [
      { id: 't1', name: 'Optics', isWeak: false, completed: true },
      { id: 't2', name: 'Mechanics', isWeak: false, completed: false },
      { id: 't3', name: 'Thermo', isWeak: true, completed: false },
      { id: 't4', name: 'Waves', isWeak: false, completed: true },
    ],
  };
  // 2 out of 4 completed = 50%
  assert.equal(calculateSubjectProgress(subject), 50);

  // Empty topics
  assert.equal(calculateSubjectProgress({ ...subject, topics: [] }), 0);
});

test('generateValidStudySlots never schedules inside college or busy hours', () => {
  const college = { start: '09:00', end: '16:00' };
  const busy = [
    { id: 'b1', label: 'Commute', start: '08:00', end: '08:45' },
    { id: 'b2', label: 'Dinner', start: '20:30', end: '21:30' },
  ];

  const slots = generateValidStudySlots(180, college, busy);
  assert.ok(slots.length > 0);

  for (const slot of slots) {
    const conflict = isSlotConflictingWithBusyHours(slot.start, slot.end, college, busy);
    assert.equal(conflict, false, `Slot ${slot.start}-${slot.end} should not conflict with busy hours`);
  }
});

test('buildInitialTodayTasks populates realistic tasks with weak topics prioritized', () => {
  const subjects = getSampleSubjects();
  const config = getDefaultScheduleConfig();
  const tasks = buildInitialTodayTasks(subjects, config);

  assert.ok(tasks.length >= 3);
  // Contains at least one study task
  const studyTasks = tasks.filter(t => t.type !== 'break');
  assert.ok(studyTasks.length >= 2);

  // Contains break tasks
  const breakTasks = tasks.filter(t => t.type === 'break');
  assert.ok(breakTasks.length >= 1);

  // Checks weak topic assignment
  const hasWeakPrioritized = studyTasks.some(t => t.isWeakTopic);
  assert.ok(hasWeakPrioritized, 'Should prioritize weak topics');
});

test('calculateWeeklyTotals accurately calculates sums, percentages and peak day', () => {
  const records = [
    { day: 'Mon', targetHours: 4, completedHours: 3.5 },
    { day: 'Tue', targetHours: 4, completedHours: 4.5 },
    { day: 'Wed', targetHours: 4, completedHours: 2.0 },
  ];
  const { totalCompleted, totalTarget, percentOfGoal, peakDay } = calculateWeeklyTotals(records);

  assert.equal(totalCompleted, 10.0);
  assert.equal(totalTarget, 12.0);
  assert.equal(percentOfGoal, 83); // 10/12 = 83.33% -> 83%
  assert.equal(peakDay, 'Tue'); // 4.5 hrs highest
});

