import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { play } from "./play";
import { Bot } from "./bot";
import { Renderer } from "./renderer";
import { Game } from "zilch-game-engine";

/**
 * User facing config schema
 */
type RawConfig = FromSchema<typeof schema>;

/**
 * Schema for the JSON users can input as part of
 * game setup.
 */
const schema = {
  type: "object",
  required: ["startingPosition"],
  properties: {
    startingPosition: {
      description: "The best description that ever there was.",
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: ["string"],
          enum: ["x", "o", "empty"],
        },
      },
    },
  },
} as const satisfies JSONSchema;

export interface Config {
  initialBoard: (number | null)[][];
  initialTurn: number;
}

export interface State {
  board: (number | [number, number] | null)[][];
}

export default {
  play,
  Bot,
  Renderer,

  config: {
    schema,

    presets: [
      {
        name: "Standard",
        value:
          `{\n` +
          `  // 3x3 matrix with values "x", "o" and "empty"\n` +
          `  "startingPosition": [\n` +
          `    ["empty", "empty", "empty"],\n` +
          `    ["empty", "empty", "empty"],\n` +
          `    ["empty", "empty", "empty"]\n` +
          `  ]\n` +
          `}\n`,
      },
    ],

    parse(rawConfig: RawConfig): Config {
      let xCount = 0;
      let oCount = 0;

      const initialBoard = rawConfig.startingPosition.map((row) => {
        return row.map((spot) => {
          if (spot === "x") {
            return xCount++ * 2;
          } else if (spot === "o") {
            return oCount++ * 2 + 1;
          } else {
            return null;
          }
        });
      });

      if (xCount - oCount !== 0 && xCount - oCount !== 1) {
        throw new Error(
          "There should be an even number of Xs and Os (or just one more X than O) in the starting position."
        );
      }

      return {
        initialBoard,
        initialTurn: oCount + xCount,
      };
    },

    serialize(config: Config): string {
      const board = config.initialBoard.map((row) => {
        return row.map((spot) => {
          if (spot === null) {
            return "empty";
          } else {
            return spot % 2 === 0 ? "x" : "o";
          }
        });
      });

      return board.map((row) => row.join(",")).join("|");
    },

    summarize(config: Config): string {
      if (config.initialTurn === 0) {
        return "standard starting position";
      } else {
        return "custom starting position";
      }
    },
  },
} satisfies Game<State, RawConfig, Config>;
