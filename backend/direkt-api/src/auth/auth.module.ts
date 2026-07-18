import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { FirebaseIdTokenVerifier } from './firebase-id-token-verifier';
import { FirebaseSessionRepository } from './firebase-session.repository';
import { SyntheticChallengeService } from './synthetic-challenge.service';
import { TokenService } from './token.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthService,
    FirebaseIdTokenVerifier,
    FirebaseSessionRepository,
    SyntheticChallengeService,
    TokenService,
  ],
  exports: [AuthRepository, TokenService],
})
export class AuthModule {}
