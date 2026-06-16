<script>
  import DayCard from './DayCard.svelte';
  import DayOrdinal from './DayOrdinal.svelte';
  import RestGap from './RestGap.svelte';
  import ScheduleLegend from './ScheduleLegend.svelte';
  import {
    formatWeekCounts,
    formatWeekdayShort,
    isWeekend,
    restGapBetween,
    weekRangeLabel,
  } from '$lib/domain/index.js';

  /** @typedef {import('$lib/domain/types.js').WeekCell} WeekCell */
  /** @typedef {import('$lib/domain/types.js').Period} Period */

  /** @type {{
    days: import('$lib/domain/types.js').Day[],
    weeks: WeekCell[][],
    today: string,
    period: Period,
    inPeriod: boolean,
    currentWeekIndex: number,
    linkFocusDate: string | null,
    timezoneLabel: string,
  }} */
  let { days, weeks, today, period, inPeriod, currentWeekIndex, linkFocusDate, timezoneLabel } = $props();

  let scheduleEl = $state(/** @type {HTMLElement | null} */ (null));
  let initialScrollDone = $state(false);

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

  function jumpToLinkFocus(date) {
    if (!scheduleEl || !date) return;
    scheduleEl.querySelector(`[data-focus-date="${date}"]`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }

  $effect(() => {
    if (!scheduleEl || initialScrollDone) return;

    initialScrollDone = true;
    requestAnimationFrame(() => {
      if (linkFocusDate) {
        jumpToLinkFocus(linkFocusDate);
        history.replaceState(null, '', window.location.pathname + window.location.hash);
        return;
      }
      jumpToFocus();
    });
  });
</script>

<section class="schedule-section" aria-label="Full schedule" bind:this={scheduleEl}>
  <div class="section-head">
    <h2>Full schedule</h2>
    {#if inPeriod}
      <button type="button" class="jump-btn" onclick={jumpToFocus}>Jump to today</button>
    {:else if today < period.start}
      <button type="button" class="jump-btn" onclick={jumpToFocus}>Jump to cover start</button>
    {/if}
  </div>

  <ScheduleLegend {days} />

  <div class="schedule-grid">
    {#each weeks as week, weekIndex (weekIndex)}
      {@const weekCounts = formatWeekCounts(week)}
      <div class="week-block" class:current-week={weekIndex === currentWeekIndex}>
        <p class="week-label">
          Week {weekIndex + 1} · {weekRangeLabel(week)}
          {#if weekCounts}<span class="week-counts">· {weekCounts}</span>{/if}
          {#if weekIndex === currentWeekIndex}<span class="week-badge">This week</span>{/if}
        </p>
        <div class="week-head" aria-hidden="true">
          {#each week as cell (cell.date)}
            <span class:today-col={cell.date === today} class:weekend-col={isWeekend(cell.date)}>{formatWeekdayShort(cell.date)}</span>
          {/each}
        </div>
        <div class="week-row">
          {#each week as cell, cellIndex (cell.date)}
            <div class="week-cell" class:weekend-col={isWeekend(cell.date)}>
              {#if cell.day}
                <DayCard
                  day={cell.day}
                  {timezoneLabel}
                  mini
                  isToday={cell.date === today}
                  markCoverStart={cell.date === period.start}
                  markCoverEnd={cell.date === period.end}
                  linkFocus={cell.date === linkFocusDate}
                />
              {:else}
                <div class="day-outside" title="Outside cover period">
                  <span class="outside-day"><DayOrdinal date={cell.date} /></span>
                  <span class="outside-mark" aria-hidden="true">—</span>
                </div>
              {/if}
              {#if cellIndex < week.length - 1}
                {@const gap = restGapBetween(cell, week[cellIndex + 1])}
                {#if gap != null}<RestGap minutes={gap} />{/if}
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>
