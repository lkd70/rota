import {
  activeWorkEnd,
  buildPageTitle,
  chunkWeeks,
  dayKindFor,
  formatDaysLeftInCover,
  indexByDate,
  isBusyOnDate,
  nextDayOff,
  nextWorkStart,
  resolveLinkFocusDate,
  scheduleStats,
} from '$lib/domain/index.js';
import { Clock, timeToMinutes } from '$lib/domain/clock.js';
import { calendar } from '$lib/data/schedule.js';
import {
  applyLayout,
  applyTheme,
  loadLayout,
  loadTheme,
  saveLayout,
  saveTheme,
  WIDE_LAYOUT_MIN_WIDTH,
} from '$lib/prefs/preferences.js';
import {
  attachEasterEggListeners,
  isEasterEggUnlocked,
  markEasterEggUnlocked,
} from '$lib/prefs/easterEggs.js';

/** @typedef {import('$lib/domain/types.js').ScheduleDocument} ScheduleDocument */

/** @param {URLSearchParams} params */
function readTestHarness(params) {
  const panelOpen = params.get('test') === '1';
  return {
    panelOpen,
    active: panelOpen,
    date: panelOpen ? params.get('date') : null,
    time: panelOpen ? params.get('time') : null,
  };
}

/** Reactive view-model for the schedule app. */
export class ScheduleLive {
  schedule = $state(/** @type {ScheduleDocument} */ ({ meta: {}, period: { start: '', end: '' }, days: [] }));

  showTestPanel = $state(false);
  testMode = $state(false);
  spoofedDate = $state('');
  spoofedTime = $state('');
  layout = $state(loadLayout());
  theme = $state(loadTheme());
  wideLayoutAvailable = $state(false);
  showStats = $state(false);
  showDownload = $state(false);
  linkFocusDate = $state(/** @type {string | null} */ (null));
  nowMs = $state(Date.now());
  /** Whether `?test=1` harness UI is available. */
  harnessEnabled = false;
  /** XP theme unlocked via easter egg. */
  xpUnlocked = $state(false);
  /** bet365 theme unlocked via easter egg. */
  bet365Unlocked = $state(false);
  showEasterEggToast = $state(/** @type {'xp' | 'bet365' | null} */ (null));

  /** @param {ScheduleDocument} doc @param {URLSearchParams} params */
  constructor(doc, params) {
    const harness = readTestHarness(params);
    const bootClock = new Clock(calendar);

    this.harnessEnabled = harness.panelOpen;
    this.xpUnlocked = isEasterEggUnlocked('xp');
    this.bet365Unlocked = isEasterEggUnlocked('bet365');
    this.schedule = doc;
    this.showTestPanel = harness.panelOpen;
    this.testMode = harness.active;
    this.spoofedDate = harness.date ?? bootClock.realToday();
    this.spoofedTime = harness.time ?? bootClock.realTime();
    this.linkFocusDate = harness.panelOpen
      ? null
      : resolveLinkFocusDate(params.get('date'), bootClock.realToday());
  }

  meta = $derived(this.schedule.meta);
  period = $derived(this.schedule.period);
  days = $derived(this.schedule.days);
  byDate = $derived(indexByDate(this.schedule.days));
  weeks = $derived(chunkWeeks(this.schedule.days));
  stats = $derived(scheduleStats(this.schedule.days, this.weeks));

  clock = $derived.by(() => {
    this.nowMs;
    this.testMode;
    this.spoofedDate;
    this.spoofedTime;
    return new Clock(calendar, {
      spoofed: this.testMode,
      date: this.spoofedDate,
      minutes: timeToMinutes(this.spoofedTime),
    });
  });

  today = $derived(this.clock.today());
  todayDay = $derived(this.byDate[this.today]);
  todayKind = $derived(dayKindFor(this.todayDay));
  inPeriod = $derived(this.today >= this.period.start && this.today <= this.period.end);
  busyNow = $derived(isBusyOnDate(this.today, this.days, this.byDate, this.clock.nowMinutes()));
  currentWeekIndex = $derived(
    this.weeks.findIndex((week) => week.some((cell) => cell.date === this.today)),
  );
  nextShift = $derived(
    this.inPeriod ? nextWorkStart(this.days, this.today, this.clock.nowMinutes()) : null,
  );
  shiftEnd = $derived(
    this.inPeriod && this.busyNow
      ? activeWorkEnd(this.days, this.today, this.clock.nowMinutes())
      : null,
  );
  nextOff = $derived(
    this.inPeriod && this.todayKind !== 'rest' ? nextDayOff(this.days, this.today) : null,
  );
  daysLeftLabel = $derived(
    this.inPeriod ? formatDaysLeftInCover(this.period.end, this.today) : null,
  );

  exitTestMode() {
    this.testMode = false;
  }

  useRealNow() {
    const live = new Clock(calendar);
    this.spoofedDate = live.realToday();
    this.spoofedTime = live.realTime();
  }

  /** @param {'xp' | 'bet365'} id */
  unlockEasterEggTheme(id) {
    markEasterEggUnlocked(id);
    if (id === 'xp') this.xpUnlocked = true;
    if (id === 'bet365') this.bet365Unlocked = true;
    this.theme = id;
    this.showEasterEggToast = id;
    window.setTimeout(() => {
      this.showEasterEggToast = null;
    }, 3200);
  }
}

/** @param {ScheduleDocument} doc @param {URLSearchParams} params */
export function createScheduleLive(doc, params) {
  const live = new ScheduleLive(doc, params);

  $effect(() => {
    const mq = window.matchMedia(`(min-width: ${WIDE_LAYOUT_MIN_WIDTH}px)`);
    const update = () => {
      live.wideLayoutAvailable = mq.matches;
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  });

  $effect(() => {
    applyLayout(live.layout);
    saveLayout(live.layout);
  });

  $effect(() => {
    applyTheme(live.theme);
    saveTheme(live.theme);
  });

  $effect(() => {
    return attachEasterEggListeners((id) => live.unlockEasterEggTheme(id));
  });

  $effect(() => {
    if (live.testMode) return;
    const fastTick = live.inPeriod && (live.busyNow || live.nextShift != null);
    const intervalMs = fastTick ? 1_000 : 30_000;
    const id = window.setInterval(() => {
      live.nowMs = Date.now();
    }, intervalMs);
    return () => window.clearInterval(id);
  });

  $effect(() => {
    live.nowMs;
    live.testMode;
    live.spoofedDate;
    live.spoofedTime;
    document.title = buildPageTitle({
      inPeriod: live.inPeriod,
      busyNow: live.busyNow,
      todayKind: live.todayKind,
      shiftEnd: live.shiftEnd,
      nextShift: live.nextShift,
      title: live.schedule.meta.title,
    });
  });

  return live;
}
