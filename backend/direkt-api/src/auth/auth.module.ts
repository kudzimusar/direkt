import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { FirebaseIdTokenVerifier } from './firebase-id-token-verifier';
import { FirebaseSessionRepository } from './firebase-session.repository';
import { PilotInvitationController } from './pilot-invitation.controller';
import { PilotInvitationService } from './pilot-invitation.service';
import { SyntheticChallengeService } from './synthetic-challenge.service';
import { TokenService } from './token.service';

@Module({
  controllers: [AuthController, PilotInvitationController],
  providers: [
    AuthRepository,
    AuthService,
    FirebaseIdTokenVerifier,
    FirebaseSessionRepository,
    PilotInvitationService,
    SyntheticChallengeService,
    TokenService,
  ],
  exports: [AuthRepository, TokenService],
})
export class AuthModule {}
