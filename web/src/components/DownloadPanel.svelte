<script>
  import ModalDialog from './ModalDialog.svelte';
  import { downloadIcs } from '$lib/export/ics.js';
  import { buildScheduleJson, downloadScheduleJson } from '$lib/export/json.js';
  import { downloadScheduleCsv } from '$lib/export/csv.js';
  import { buildScheduleLink, copyScheduleLink } from '$lib/export/link.js';
  import { copyText } from '$lib/export/download.js';

  /** @type {{
    open: boolean,
    schedule: import('$lib/domain/types.js').ScheduleDocument,
    onClose: () => void,
  }} */
  let { open, schedule, onClose } = $props();

  let copied = $state(/** @type {'link' | 'json' | null} */ (null));

  /** @param {'link' | 'json'} kind */
  async function handleCopy(kind) {
    if (kind === 'link') {
      await copyScheduleLink('today');
    } else {
      await copyText(buildScheduleJson(schedule));
    }
    copied = kind;
    window.setTimeout(() => {
      copied = null;
    }, 2000);
  }
</script>

<ModalDialog {open} title="Export schedule" titleId="download-title" {onClose}>
  <ul class="download-list">
    <li>
      <button type="button" class="download-action" onclick={() => downloadIcs(schedule.days, schedule.meta)}>
        <span class="download-action__label">Calendar (.ics)</span>
        <span class="download-action__hint">Import into Google Calendar, Outlook, or Apple Calendar</span>
      </button>
    </li>
    <li>
      <button type="button" class="download-action" onclick={() => downloadScheduleJson(schedule)}>
        <span class="download-action__label">Schedule data (.json)</span>
        <span class="download-action__hint">Canonical format with meta, period, and days</span>
      </button>
    </li>
    <li>
      <button type="button" class="download-action" onclick={() => downloadScheduleCsv(schedule)}>
        <span class="download-action__label">Spreadsheet (.csv)</span>
        <span class="download-action__hint">One row per day with type, hours, and notes</span>
      </button>
    </li>
    <li>
      <button type="button" class="download-action" onclick={() => handleCopy('json')}>
        <span class="download-action__label">{copied === 'json' ? 'Copied JSON' : 'Copy JSON'}</span>
        <span class="download-action__hint">Paste into docs, chat, or another tool</span>
      </button>
    </li>
    <li>
      <button type="button" class="download-action" onclick={() => handleCopy('link')}>
        <span class="download-action__label">{copied === 'link' ? 'Copied link' : 'Copy link to today'}</span>
        <span class="download-action__hint">{buildScheduleLink('today')}</span>
      </button>
    </li>
  </ul>
</ModalDialog>
