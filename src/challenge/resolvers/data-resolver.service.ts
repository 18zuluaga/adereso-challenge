import { Injectable } from "@nestjs/common";
import axios from "axios";
import { Pokemon, StarWarsCharacter, StarWarsPlanet } from "../interface";

@Injectable()
export class ResolverService {
  async resolveExpression(expression: string): Promise<number> {
    try {
      console.log("📝 Expresión a resolver:", expression);
      const pattern = /"([^"]+)"\.(\w+)/g;
      const matches = [...expression.matchAll(pattern)];

      let evaluatedExpression = expression;
      for (const match of matches) {
        const [fullMatch, objectName, attribute] = match;
        // 2. Obtener el valor desde la API correspondiente
        const value: number | string = await this.getAttributeValue(
          objectName,
          attribute,
        );

        // 3. Reemplazar en la expresión
        evaluatedExpression = evaluatedExpression.replace(
          fullMatch,
          value.toString(),
        );
      }

      // 4. Evaluar la expresión matemática
      const result = eval(evaluatedExpression);
      console.log("📝 Resultado:", result, evaluatedExpression);
      if (typeof result === "number" && Number.isFinite(result)) {
        return result;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error("No se pudo resolver la expresión");
    }
  }

  private async getAttributeValue(
    objectName: string,
    attribute: string,
  ): Promise<number | string> {
    const normalizedName = objectName.toLowerCase();
    // 1. Intentamos buscar primero en PokéAPI
    console.log(normalizedName);
    try {
      const { data } = await axios.get<Pokemon>(
        `https://pokeapi.co/api/v2/pokemon/${normalizedName}`,
      );
      if (data && attribute in data) {
        return data[attribute as keyof Pokemon];
      }
    } catch (error) {
      console.log(attribute, objectName);
    }

    // 2. Si no está en PokéAPI, intentamos con SWAPI (Personajes)
    try {
      const { data } = await axios.get<{ results: StarWarsCharacter[] }>(
        `https://swapi.py4e.com/api/people/?search=${normalizedName}`,
      );

      const character = data?.results[0];
      if (character && attribute in character) {
        return character[attribute as keyof StarWarsCharacter];
      }
    } catch (error) {
      console.log(attribute, objectName);
    }

    // 3. Intentamos buscar en SWAPI (Planetas)
    try {
      const { data } = await axios.get<{ results: StarWarsPlanet[] }>(
        `https://swapi.py4e.com/api/planets/?search=${normalizedName}`,
      );
      const planet = data?.results[0];

      // Aseguramos que el planeta existe y contiene el atributo
      if (planet && attribute in planet) {
        console.log(planet);
        console.log(planet[attribute as keyof StarWarsPlanet]);	
        return planet[attribute as keyof StarWarsPlanet];
      }
    } catch (error) {
      console.log(attribute, objectName);
    }

    return 0;
  }
}
