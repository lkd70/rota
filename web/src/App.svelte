<script>
  import DayCard from './lib/DayCard.svelte';
  import DayIcon from './lib/DayIcon.svelte';
  import scheduleData from './lib/schedule.json';
  import {
    chunkWeeks,
    configureTestClock,
    detailFor,
    formatDate,
    indexByDate,
    isBusyOnDate,
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

  let showTestPanel = $state(params.get('test') === '1');
  let testMode = $state(params.get('test') === '1');
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
  const inPeriod = $derived(today >= period.start && today <= period.end);
  const busyNow = $derived(isBusyOnDate(today, schedule, byDate));
  const currentWeekIndex = $derived(weeks.findIndex((week) => week.some((d) => d.date === today)));

  function jumpToToday() {
    const el = scheduleEl?.querySelector('[aria-current="date"]');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }

  $effect(() => {
    today;
    requestAnimationFrame(jumpToToday);
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
      <DayCard
        entry={todayEntry}
        compact={false}
        isToday
        showLive
        liveBusy={busyNow}
      />
      <p class="today-detail">{detailFor(todayEntry)}</p>
    </section>
  {/if}

  <section class="schedule-section" aria-label="Full schedule" bind:this={scheduleEl}>
    <div class="section-head">
      <h2>Full schedule</h2>
      <button type="button" class="jump-btn" onclick={jumpToToday}>Jump to today</button>
    </div>

    <div class="schedule-grid">
      {#each weeks as week, weekIndex (weekIndex)}
        <div class="week-block" class:current-week={weekIndex === currentWeekIndex}>
          <p class="week-label">Week {weekIndex + 1} · {weekRangeLabel(week)}</p>
          <div class="week-row">
            {#each week as entry (entry.date)}
              <DayCard
                {entry}
                mini
                isToday={entry.date === today}
                showLive={entry.date === today}
                liveBusy={entry.date === today && busyNow}
              />
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
</div>
