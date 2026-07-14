import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ContactChannel } from './contact-normalizer';

export interface SyntheticChallengeDelivery {
  code: string;
  delivery: 'synthetic';
}

@Injectable()
export class SyntheticChallengeService {
  private readonly mode: 'synthetic' | 'disabled';

  constructor(config: ConfigService) {
    this.mode = config.getOrThrow<'synthetic' | 'disabled'>('AUTH_CHALLENGE_MODE');
  }

  send(channel: ContactChannel, displayHint: string): SyntheticChallengeDelivery {
    if (this.mode !== 'synthetic') {
      throw new ServiceUnavailableException('Passwordless delivery is not configured.');
    }

    void channel;
    void displayHint;
    return {
      code: '246810',
      delivery: 'synthetic',
    };
  }
}
