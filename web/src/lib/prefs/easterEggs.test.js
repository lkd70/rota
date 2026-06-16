import { describe, expect, it } from 'vitest';
import {
  advanceUnlockBuffer,
  isBlissSequence,
  matchEasterEggSequence,
} from './easterEggs.js';

describe('easter egg unlock sequences', () => {
  it('matches bliss for XP', () => {
    let buffer = '';
    for (const key of 'bliss') {
      buffer = advanceUnlockBuffer(buffer, key);
    }
    expect(isBlissSequence(buffer)).toBe(true);
    expect(matchEasterEggSequence(buffer)).toBe('xp');
  });

  it('matches bet365', () => {
    let buffer = '';
    for (const key of 'xxbet365') {
      buffer = advanceUnlockBuffer(buffer, key);
    }
    expect(matchEasterEggSequence(buffer)).toBe('bet365');
  });

  it('does not match partial input', () => {
    expect(matchEasterEggSequence(advanceUnlockBuffer('', 'b'))).toBe(null);
    expect(matchEasterEggSequence(advanceUnlockBuffer('bet36', '4'))).toBe(null);
  });
});
