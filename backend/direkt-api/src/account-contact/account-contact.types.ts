import type { ContactChannel } from '../auth/contact-normalizer';

export interface AccountContactReference {
  id: string;
  channel: ContactChannel;
  displayHint: string;
  verified: boolean;
  verifiedAt: string | null;
}
