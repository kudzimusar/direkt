import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import VerificationQueuePage from '../src/app/operations/verification/page';

describe('VerificationQueuePage', () => {
  it('shows scoped synthetic review data without private evidence or publication controls', () => {
    const markup = renderToStaticMarkup(<VerificationQueuePage />);

    expect(markup).toContain('Synthetic Phase 4 Repairs');
    expect(markup).toContain('Representative identity check');
    expect(markup).toContain('2 immutable metadata versions');
    expect(markup).toContain('This does not verify qualifications, safety or future workmanship');
    expect(markup).not.toContain('objectKey');
    expect(markup).not.toContain('private/');
    expect(markup).not.toContain('Download evidence');
    expect(markup).not.toContain('Publish provider');
    expect(markup).not.toContain('document number');
    expect(markup).not.toContain('private address');
  });
});