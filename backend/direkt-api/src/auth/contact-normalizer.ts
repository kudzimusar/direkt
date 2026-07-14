import { BadRequestException } from '@nestjs/common';

export type ContactChannel = 'email' | 'phone';

export interface NormalizedContact {
  channel: ContactChannel;
  value: string;
  displayHint: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizeContact(channel: ContactChannel, input: string): NormalizedContact {
  if (channel === 'email') {
    const value = input.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value) || value.length > 254) {
      throw new BadRequestException('Enter a valid email address.');
    }
    const [local = '', domain = ''] = value.split('@');
    const visible = local.slice(0, 1);
    return {
      channel,
      value,
      displayHint: `${visible}***@${domain}`,
    };
  }

  const value = input.replace(/[\s()-]/g, '');
  if (!E164_PATTERN.test(value)) {
    throw new BadRequestException('Enter a phone number in international format.');
  }
  return {
    channel,
    value,
    displayHint: `${value.slice(0, 4)}***${value.slice(-3)}`,
  };
}
