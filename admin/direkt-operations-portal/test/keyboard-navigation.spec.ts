import { describe, expect, it } from 'vitest';
import { nextQueueRowIndex, resolveKeyboardAction } from '../src/components/keyboard-shortcuts';

describe('Stage 7F keyboard navigation decisions', () => {
  it.each([
    ['Escape', false, 'close_help'],
    ['?', false, 'toggle_help'],
    ['/', false, 'focus_filter'],
    ['j', false, 'queue_next'],
    ['J', false, 'queue_next'],
    ['k', false, 'queue_previous'],
    ['K', false, 'queue_previous'],
    ['x', false, 'none'],
    ['?', true, 'none'],
    ['j', true, 'none'],
  ] as const)('maps %s with editable=%s to %s', (key, editable, expected) => {
    expect(resolveKeyboardAction(key, editable)).toBe(expected);
  });

  it('always allows Escape to close help from an editable target', () => {
    expect(resolveKeyboardAction('Escape', true)).toBe('close_help');
  });

  it.each([
    [-1, 3, 'next', 0],
    [-1, 3, 'previous', 0],
    [0, 3, 'previous', 0],
    [0, 3, 'next', 1],
    [1, 3, 'next', 2],
    [2, 3, 'next', 2],
    [2, 3, 'previous', 1],
    [0, 0, 'next', null],
  ] as const)(
    'moves active=%s count=%s direction=%s to %s',
    (activeIndex, rowCount, direction, expected) => {
      expect(nextQueueRowIndex(activeIndex, rowCount, direction)).toBe(expected);
    },
  );
});
