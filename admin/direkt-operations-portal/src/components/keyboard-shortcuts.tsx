'use client';

import { useEffect, useState } from 'react';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.matches('input, textarea, select, [contenteditable="true"]');
}

export function KeyboardShortcuts() {
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHelpOpen(false);
        return;
      }
      if (isEditableTarget(event.target)) return;

      if (event.key === '?') {
        event.preventDefault();
        setHelpOpen((current) => !current);
        return;
      }

      if (event.key === '/') {
        const filter = document.querySelector<HTMLElement>('[data-operations-filter]');
        if (filter) {
          event.preventDefault();
          filter.focus();
        }
        return;
      }

      if (!['j', 'k'].includes(event.key.toLowerCase())) return;
      const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-queue-row]'));
      if (rows.length === 0) return;
      const activeIndex = rows.indexOf(document.activeElement as HTMLElement);
      const direction = event.key.toLowerCase() === 'j' ? 1 : -1;
      const nextIndex =
        activeIndex < 0 ? 0 : Math.min(rows.length - 1, Math.max(0, activeIndex + direction));
      event.preventDefault();
      rows[nextIndex]?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="keyboard-shortcuts">
      <button
        type="button"
        className="shortcut-button"
        aria-expanded={helpOpen}
        aria-controls="keyboard-shortcut-help"
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
