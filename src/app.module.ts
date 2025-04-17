import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChallengeModule } from './challenge/challenge.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChallengeModule,
  ],
})
export class AppModule {}
