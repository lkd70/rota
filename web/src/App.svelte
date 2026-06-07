<script>
  import DayCard from './lib/DayCard.svelte';
  import DayIcon from './lib/DayIcon.svelte';
  import scheduleData from './lib/schedule.json';
  import {
    chunkWeeks,
    configureTestClock,
    dayKindFor,
    detailFor,
    formatDate,
    formatDayNum,
    formatShortDate,
    indexByDate,
    isBusyOnDate,
    labelFor,
    realTimeBst,
    realTodayBst,
    resetTestClock,
    timeToMinutes,
    weekRangeLabel,
  } from './lib/schedule.js';

  const { timezone, period, schedule } = scheduleData;
  const byDate = indexByDate(schedule);
  const weeks = chunkWeeks(schedule);

  const params = new URLSearchParams(window.location.search);
  const showTestUi = params.get('test') === '1';

  let showTestPanel = $state(showTestUi);
  let testMode = $state(showTestUi);
  let spoofedDate = $state(params.get('date') ?? period.start);
  let spoofedTime = $state(params.get('time') ?? realTimeBst());
  let liveToday = $state(realTodayBst());
  let scheduleEl = $state(/** @type {HTMLElement | null} */ (null));

  $effect(() => {
    if (testMode) return;
    const id = setInterval(() => {
      liveToday = realTodayBst();
    }, 60_000);
    return () => clearInterval(id);
  });

  $effect(() => {
    configureTestClock({
      enabled: testMode,
      date: spoofedDate,
      minutes: timeToMinutes(spoofedTime),
    });
  });

  const today = $derived(testMode ? spoofedDate : liveToday);
  const todayEntry = $derived(byDate[today]);
  const todayKind = $derived(dayKindFor(todayEntry));
  const inPeriod = $derived(today >= period.start && today <= period.end);
  const busyNow = $derived(isBusyOnDate(today, schedule, byDate));
  const currentWeekIndex = $derived(
    weeks.findIndex((week) => week.some((cell) => cell.date === today)),
  );

  function jumpToFocus() {
    if (!scheduleEl) return;

    let target;
    if (inPeriod) {
      target = scheduleEl.querySelector('[aria-current="date"]');
    } else if (today < period.start) {
      target = scheduleEl.querySelector('[data-cover-start]');
    }

    target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }

  $effect(() => {
    today;
    inPeriod;
    requestAnimationFrame(jumpToFocus);
  });

  function exitTestMode() {
    testMode = false;
    resetTestClock();
  }

  function useRealNow() {
    spoofedDate = liveToday;
    spoofedTime = realTimeBst();
  }
</script>

<div class="page" class:test-active={testMode}>
  {#if testMode}
    <div class="test-banner" role="status">
      Test mode — simulating <strong>{formatDate(spoofedDate)}</strong> at <strong>{spoofedTime}</strong> BST
    </div>
  {/if}

  <header class="hero">
    <p class="eyebrow">World Cup cover · {timezone}</p>
    <h1>Availability</h1>
    <p class="sub">
      {formatDate(period.start)} – {formatDate(period.end).replace(/^\w+,\s*/, '')}
    </p>
    {#if inPeriod}
      <p class="status-line" class:busy={busyNow} class:free={!busyNow}>
        {#if todayEntry?.type === 'rest'}
          Today: day off — free all day
        {:else if busyNow}
          Today: on shift right now
        {:else}
          Today: free right now
        {/if}
        {#if testMode}<span class="sim-tag">simulated</span>{/if}
      </p>
    {:else if today < period.start}
      <p class="status-line muted">Cover starts {formatDate(period.start)}</p>
    {:else}
      <p class="status-line muted">Cover period has ended</p>
    {/if}
  </header>

  {#if inPeriod && todayEntry}
    <section class="today-panel" aria-label="Today">
      <div
        class="today-strip"
        class:rest={todayKind === 'rest'}
        class:office={todayKind === 'office'}
        class:late={todayKind === 'late'}
        class:night={todayKind === 'night'}
      >
        <div class="today-icon">
          <DayIcon kind={todayKind} />
        </div>
        <div class="today-copy">
          <p class="today-date">{formatShortDate(today)}</p>
          <p class="today-label">{labelFor(todayEntry)}</p>
          <p class="today-detail">{detailFor(todayEntry)}</p>
        </div>
        <span
          class="live-pill"
          class:busy={busyNow}
          class:free={!busyNow && todayKind !== 'rest'}
          class:off={todayKind === 'rest'}
        >
          {#if todayKind === 'rest'}
            Off
          {:else if busyNow}
            On shift
          {:else}
            Free
          {/if}
        </span>
      </div>
    </section>
  {/if}

  <section class="schedule-section" aria-label="Full schedule" bind:this={scheduleEl}>
    <div class="section-head">
      <h2>Full schedule</h2>
      {#if inPeriod}
        <button type="button" class="jump-btn" onclick={jumpToFocus}>Jump to today</button>
      {:else if today < period.start}
        <button type="button" class="jump-btn" onclick={jumpToFocus}>Jump to cover start</button>
      {/if}
    </div>

    <div class="schedule-grid">
      {#each weeks as week, weekIndex (weekIndex)}
        <div class="week-block" class:current-week={weekIndex === currentWeekIndex}>
          <p class="week-label">Week {weekIndex + 1} · {weekRangeLabel(week)}</p>
          <div class="week-head" aria-hidden="true">
            {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}
              <span>{day}</span>
            {/each}
          </div>
          <div class="week-row">
            {#each week as cell (cell.date)}
              {#if cell.entry}
                <DayCard
                  entry={cell.entry}
                  mini
                  isToday={cell.date === today}
                  showLive={cell.date === today}
                  liveBusy={cell.date === today && busyNow}
                  markCoverStart={cell.date === period.start}
                />
              {:else}
                <div class="day-outside" title="Outside cover period">
                  <span class="outside-day">{formatDayNum(cell.date)}</span>
                  <span class="outside-mark" aria-hidden="true">—</span>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <footer class="legend">
    <span><DayIcon kind="rest" /> Day off</span>
    <span><DayIcon kind="office" /> Office 09–17</span>
    <span><DayIcon kind="late" /> Evening cover</span>
    <span><DayIcon kind="night" /> Overnight cover</span>
  </footer>

  {#if showTestUi}
    <section class="test-panel">
      <button
        class="test-toggle"
        type="button"
        aria-expanded={showTestPanel}
        onclick={() => (showTestPanel = !showTestPanel)}
      >
        {showTestPanel ? 'Hide test mode' : 'Test mode'}
      </button>

      {#if showTestPanel}
        <div class="test-controls">
          <label class="test-check">
            <input type="checkbox" bind:checked={testMode} />
            Enable date/time spoofing
          </label>

          <div class="test-fields">
            <label>
              <span>Date</span>
              <input type="date" bind:value={spoofedDate} min={period.start} max={period.end} disabled={!testMode} />
            </label>
            <label>
              <span>Time (BST)</span>
              <input type="time" bind:value={spoofedTime} disabled={!testMode} />
            </label>
          </div>

          <div class="test-actions">
            <button type="button" class="test-btn" disabled={!testMode} onclick={useRealNow}>
              Use real now
            </button>
            <button type="button" class="test-btn" disabled={!testMode} onclick={exitTestMode}>
              Exit test mode
            </button>
          </div>

          <p class="test-hint">
            Tip: open with <code>?test=1&amp;date=2026-06-27&amp;time=21:00</code> to jump straight into a scenario.
          </p>
        </div>
      {/if}
    </section>
  {/if}
</div>
