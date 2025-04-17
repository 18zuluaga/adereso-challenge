// src/challenge/interpreters/prompt-interpreter.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class PromptInterpreterService {
  private readonly API_URL = "https://recruiting.adere.so/chat_completion";
  private readonly model = "gpt-4o-mini";

  constructor(private configService: ConfigService) {}

  async interpretProblem(problemDescription: string): Promise<string> {
    try {
      const messages = [
        {
          role: "system",
          content: `
      Eres un modelo experto en transformar problemas de lenguaje natural en fórmulas matemáticas computables. Tu tarea es devolver solo una expresión matemática computable, clara, precisa y en una sola línea.
      
      🚨 Reglas estrictas:
      1. Devuelve únicamente una expresión en una sola línea. No incluyas ninguna explicación o comentario.
      2. Interpreta **el significado lógico** de las frases, no solo el orden en que aparecen las palabras.
         - Por ejemplo:
           - "X decide multiplicar Y por Z" → la expresión correcta es: Y * Z (siendo Y el primer término mencionado en la operación).
           - "X decide restar Y de Z" → la expresión correcta es: Z - Y.
           - "X decide dividir Y por Z" → la expresión correcta es: Y / Z.
      3. **Respeta el orden de las operaciones según el enunciado**. Las acciones como "multiplicar", "sumar", "restar" o "dividir" dictan el orden de las operaciones, no el orden en que los nombres aparecen.
      4. Usa exactamente este formato para cada término: "NombreExacto".atributo
         - Respeta mayúsculas, minúsculas, espacios y símbolos especiales tal como aparecen en el enunciado.
         - No traduzcas, acortes ni modifiques los nombres.
      5. Atributos válidos: rotation_period, orbital_period, diameter, surface_water, population, height, mass, homeworld, base_experience, weight.
         - Si un atributo no está en la lista, selecciona el más semánticamente cercano (ej. experiencia → base_experience).
      6. Operadores válidos: +, -, *, /, **
      
      🧪 Ejemplo válido:
      "Owen Lars".height / "Glee Anselm".surface_water - "Stewjon".diameter * "Dooku".height
      
      📌 Responde solamente con la expresión computacional, en una sola línea.`,
        },
        {
          role: "user",
          content: `Convierte el siguiente enunciado en una expresión computacional estricta. Devuélveme solo la expresión:
      
      ${problemDescription}`,
        },
      ];
      
      

      const response = await axios.post(
        this.API_URL,
        {
          model: this.model,
          messages: messages,
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get("ADERESO_TOKEN")}`,
          },
        },
      );

      const solution: string = response.data.choices[0]?.message?.content || "";
      return solution;
    } catch (error) {
      console.error("❌ Error al interpretar el enunciado:", error);
      throw new Error("Error al conectar con la API de OpenAI");
    }
  }
}
