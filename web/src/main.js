import { mount } from 'svelte';
import './styles/index.css';
import App from './App.svelte';
import { initPreferences } from '$lib/prefs/preferences.js';

if (import.meta.env.DEV) {
  await import('$lib/data/assertSchedule.dev.js');
}

initPreferences();

mount(App, { target: document.getElementById('app') });
