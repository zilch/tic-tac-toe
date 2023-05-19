import { FromSchema, JSONSchema } from "json-schema-to-ts";

/**
 * User facing config schema
 */
type RawConfig = FromSchema<typeof configSchema>;

/**
 * Schema for the JSON users can input as part of
 * game setup.
 */
export const configSchema = {
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

/**
 * Preset configuration values
 */
export const configPresets = [
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
];

export type Config = ReturnType<typeof parseConfig>;

/**
 * Convert user setup JSON into a game config object. Errors thrown here
 * will be displayed to the user.
 */
export function parseConfig(rawConfig: RawConfig) {
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
}

/**
 * Serialize the game config object for consumption by bots.
 */
export function serializeConfig(config: Config): string {
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
}

/**
 * Summarize the game config object
 */
export function summarizeConfig(config: Config): string {
  if (config.initialTurn === 0) {
    return "standard starting position";
  } else {
    return "custom starting position";
  }
}
