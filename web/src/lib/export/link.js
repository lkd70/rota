import { copyText } from './download.js';

/** @param {string} [date='today'] */
export function buildScheduleLink(date = 'today') {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('date', date);
  return url.toString();
}

/** @param {string} [date='today'] */
export async function copyScheduleLink(date = 'today') {
  await copyText(buildScheduleLink(date));
}
