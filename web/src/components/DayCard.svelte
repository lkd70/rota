<script>
  import DayIcon from './DayIcon.svelte';
  import DayOrdinal from './DayOrdinal.svelte';
  import TimeDisplay from './TimeDisplay.svelte';
  import {
    dayKindFor,
    detailFor,
    formatDate,
    formatMonthShort,
    formatWeekdayShort,
    isFirstOfMonth,
    labelFor,
  } from '$lib/domain/index.js';

  /** @type {{
    day: import('$lib/domain/types.js').Day,
    timezoneLabel?: string,
    isToday?: boolean,
    mini?: boolean,
    markCoverStart?: boolean,
    markCoverEnd?: boolean,
    linkFocus?: boolean,
  }} */
  let {
    day,
    timezoneLabel = 'BST',
    isToday = false,
    mini = false,
    markCoverStart = false,
    markCoverEnd = false,
    linkFocus = false,
  } = $props();

  const kind = $derived(dayKindFor(day));
  const label = $derived(labelFor(day));
  const tooltip = $derived(`${formatDate(day.date)} · ${detailFor(day, timezoneLabel)}`);
</script>

<article
  class="day-card"
  class:day-card--mini={mini}
  class:day-card--today={isToday}
  class:day-card--rest={kind === 'rest'}
  class:day-card--office={kind === 'office'}
  class:day-card--late={kind === 'late'}
  class:day-card--night={kind === 'night'}
  class:day-card--link-focus={linkFocus}
  aria-current={isToday ? 'date' : undefined}
  data-cover-start={markCoverStart ? '' : undefined}
  data-cover-end={markCoverEnd ? '' : undefined}
  data-focus-date={day.date}
  title={tooltip}
>
  <div class="day-card__icon">
    <DayIcon {kind} />
  </div>

  <div class="day-card__body">
    <p class="day-card__date">
      <DayOrdinal date={day.date} />
      {#if !mini}
        <span class="day-card__month">{formatMonthShort(day.date)}</span>
      {:else if isFirstOfMonth(day.date)}
        <span class="day-card__month-mini">{formatMonthShort(day.date)}</span>
      {/if}
    </p>
    {#if !mini}
      <p class="day-card__weekday">{formatWeekdayShort(day.date)}</p>
      <p class="day-card__label">{label}</p>
    {/if}

    <div class="day-card__time">
      <TimeDisplay {day} {mini} {timezoneLabel} />
    </div>
  </div>
</article>
