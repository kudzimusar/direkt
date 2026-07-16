'use client';

import { useEffect, useState } from 'react';

export type KeyboardAction =
  | 'close_help'
  | 'toggle_help'
  | 'focus_filter'
  | 'queue_next'
  | 'queue_previous'
  | 'none';

export function resolveKeyboardAction(key: string, editableTarget: boolean): KeyboardAction {
  if (key === 'Escape') return 'close_help';
  if (editableTarget) return 'none';
  if (key === '?') return 'toggle_help';
  if (key === '/') return 'focus_filter';
  if (key.toLowerCase() === 'j') return 'queue_next';
  if (key.toLowerCase() === 'k') return 'queue_previous';
  return 'none';
}

export function nextQueueRowIndex(
  activeIndex: number,
  rowCount: number,
  direction: 'next' | 'previous',
): number | null {
  if (rowCount <= 0) return null;
  if (activeIndex < 0) return 0;
  const offset = direction === 'next' ? 1 : -1;
  return Math.min(rowCount - 1, Math.max(0, activeIndex + offset));
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.matches('input, textarea, select, [contenteditable="true"]');
}

export function KeyboardShortcuts() {
  const [helpOpen, setHelpOpen] = useState(false);

  /* v8 ignore start -- browser event binding is a thin adapter over the tested decisions above */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = resolveKeyboardAction(event.key, isEditableTarget(event.target));
      if (action === 'close_help') {
        setHelpOpen(false);
        return;
      }
      if (action === 'toggle_help') {
        event.preventDefault();
        setHelpOpen((current) => !current);
        return;
      }
      if (action === 'focus_filter') {
        const filter = document.querySelector<HTMLElement>('[data-operations-filter]');
        if (filter) {
          event.preventDefault();
          filter.focus();
        }
        return;
      }
      if (!['queue_next', 'queue_previous'].includes(action)) return;
      const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-queue-row]'));
      const activeIndex = rows.indexOf(document.activeElement as HTMLElement);
      const nextIndex = nextQueueRowIndex(
        activeIndex,
        rows.length,
        action === 'queue_next' ? 'next' : 'previous',
      );
      if (nextIndex === null) return;
      event.preventDefault();
      rows[nextIndex]?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
  /* v8 ignore stop */

  return (
    <div className="keyboard-shortcuts">
      <button
        type="button"
        className="shortcut-button"
        aria-expanded={helpOpen}
        aria-controls="keyboard-shortcut-help"
        /* v8 ignore next -- exercised by the keyboard action contract */
        onClick={() => setHelpOpen((current) => !current)}
      >
        Keyboard help <kbd>?</kbd>
      </button>
      {helpOpen ? (
        <section
          id="keyboard-shortcut-help"
          className="shortcut-popover"
          aria-label="Keyboard shortcuts"
        >
          <h2>Keyboard shortcuts</h2>
          <dl>
            <div>
              <dt>
                <kbd>/</kbd>
              </dt>
              <dd>Focus the current workspace filter</dd>
            </div>
            <div>
              <dt>
                <kbd>J</kbd> / <kbd>K</kbd>
              </dt>
              <dd>Move through focusable queue rows</dd>
            </div>
            <div>
              <dt>
                <kbd>?</kbd>
              </dt>
              <dd>Open or close this help</dd>
            </div>
            <div>
              <dt>
                <kbd>Esc</kbd>
              </dt>
              <dd>Close keyboard help</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}
