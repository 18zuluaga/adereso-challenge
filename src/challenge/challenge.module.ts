import { Module } from "@nestjs/common";
import { ChallengeService } from "./challenge.service";
import { PromptInterpreterService } from "./interpreters/prompt-interpreter.service";
import { ResolverService } from "./resolvers/data-resolver.service";

@Module({
  providers: [ChallengeService, PromptInterpreterService, ResolverService],
})
export class ChallengeModule {}
