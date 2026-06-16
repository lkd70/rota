<script>
  import Hero from './components/Hero.svelte';
  import PrefsBar from './components/PrefsBar.svelte';
  import Rota365BrandBar from './components/Rota365BrandBar.svelte';
  import ScheduleSection from './components/ScheduleSection.svelte';
  import DownloadPanel from './components/DownloadPanel.svelte';
  import StatsPanel from './components/StatsPanel.svelte';
  import TestPanel from './components/TestPanel.svelte';
  import TodayPanel from './components/TodayPanel.svelte';
  import { createScheduleLive } from '$lib/app/ScheduleLive.svelte.js';
  import { schedule } from '$lib/data/schedule.js';
  import { formatDate } from '$lib/domain/index.js';

  const params = new URLSearchParams(window.location.search);
  const live = createScheduleLive(schedule, params);
</script>

<div class:b365-app={live.theme === 'bet365'}>
  {#if live.theme === 'bet365'}
    <Rota365BrandBar />
  {/if}

  <div class="page" class:test-active={live.testMode} class:page--bet365={live.theme === 'bet365'}>
  {#if live.showEasterEggToast === 'xp'}
    <div class="easter-egg-toast" role="status">
      Welcome to <strong>Windows XP</strong> mode.
    </div>
  {:else if live.showEasterEggToast === 'bet365'}
    <div class="easter-egg-toast" role="status">
      Odds are you found <strong>rota365</strong> mode.
    </div>
  {/if}

  {#if live.testMode}
    <div class="test-banner" role="status">
      Test mode — simulating <strong>{formatDate(live.spoofedDate)}</strong> at <strong>{live.spoofedTime}</strong>
      {live.meta.timezoneLabel}
    </div>
  {/if}

  <div class="page-shell">
    <PrefsBar
      wideLayoutAvailable={live.wideLayoutAvailable}
      bind:layout={live.layout}
      bind:theme={live.theme}
      xpUnlocked={live.xpUnlocked}
      bet365Unlocked={live.bet365Unlocked}
      onOpenStats={() => (live.showStats = true)}
      onOpenDownload={() => (live.showDownload = true)}
      onUnlockEasterEgg={(id) => live.unlockEasterEggTheme(id)}
    />

    <StatsPanel open={live.showStats} stats={live.stats} onClose={() => (live.showStats = false)} />
    <DownloadPanel
      open={live.showDownload}
      schedule={live.schedule}
      onClose={() => (live.showDownload = false)}
    />

    <div class="page-top">
      <Hero
        meta={live.meta}
        period={live.period}
        inPeriod={live.inPeriod}
        today={live.today}
        daysLeftLabel={live.daysLeftLabel}
      />

      {#if live.inPeriod && live.todayDay}
        <TodayPanel
          day={live.todayDay}
          kind={live.todayKind}
          today={live.today}
          timezoneLabel={live.meta.timezoneLabel}
          busyNow={live.busyNow}
          testMode={live.testMode}
          shiftEnd={live.shiftEnd}
          nextShift={live.nextShift}
          nextOff={live.nextOff}
        />
      {/if}
    </div>

    <ScheduleSection
      days={live.days}
      weeks={live.weeks}
      today={live.today}
      period={live.period}
      inPeriod={live.inPeriod}
      currentWeekIndex={live.currentWeekIndex}
      linkFocusDate={live.linkFocusDate}
      timezoneLabel={live.meta.timezoneLabel}
    />

    {#if live.harnessEnabled}
      <TestPanel
        period={live.period}
        timezoneLabel={live.meta.timezoneLabel}
        bind:testMode={live.testMode}
        bind:spoofedDate={live.spoofedDate}
        bind:spoofedTime={live.spoofedTime}
        bind:showTestPanel={live.showTestPanel}
        onUseRealNow={live.useRealNow}
        onExitTestMode={live.exitTestMode}
      />
    {/if}
  </div>
</div>
</div>
