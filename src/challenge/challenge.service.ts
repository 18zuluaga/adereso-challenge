import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PromptInterpreterService } from "./interpreters/prompt-interpreter.service";
import { ResolverService } from "./resolvers/data-resolver.service";

@Injectable()
export class ChallengeService implements OnModuleInit {
  private readonly BASE_URL = "https://recruiting.adere.so/challenge/start";
  private readonly SOLUTION_URL = "https://recruiting.adere.so/challenge/solution";
  private endTime = 0;

  constructor(
    private configService: ConfigService,
    private promptInterpreterService: PromptInterpreterService,
    private resolverService: ResolverService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.endTime = 1; // 3 minutos desde ahora
    await this.processChallenge();
  }

  private async processChallenge(): Promise<void> {
    if (!this.endTime) {
      console.log("⏱️ Tiempo finalizado. Desafío detenido.");
      return;
    }
    try {
      const { data } = await axios.get(this.BASE_URL, {
        headers: {
          Authorization: `Bearer ${this.configService.get("ADERESO_TOKEN")}`,
        },
      });
      console.log(data)
      const problemDescription: string = data?.problem || "";
      const operationId: string = data?.id || "";

      const expression =
        await this.promptInterpreterService.interpretProblem(
          problemDescription,
        );

      console.log("📝 Expresión:", expression);

      const rawSolution =
        await this.resolverService.resolveExpression(expression);

      console.log("📝 Solución:", rawSolution);
      const solution = parseFloat(rawSolution.toFixed(10)); 
      await this.sendSolution(operationId, solution);

    } catch (error) {
      console.error("❌ Error al procesar el desafío:", error);
    }

    await this.processChallenge();
  }

  private async sendSolution(operationId: string, solution: number): Promise<void> {
    try {
      console.log("📝 Solución:", solution, operationId);
      const response = await axios.post(
        this.SOLUTION_URL,
        {
          problem_id: operationId,
          answer: solution,
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get("ADERESO_TOKEN")}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("✅ Solución enviada:", response.data);
      if (!response.data.next_problem) {
        console.log("⏱️ Tiempo finalizado. Desafío detenido.");
        this.endTime = 0;
      }
    } catch (error) {
      console.error("❌ Error al enviar la solución:", error.message);
    }
  }
}
