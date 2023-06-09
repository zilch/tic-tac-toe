import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { ZilchNamespace } from "zilch-game-engine";

/**
 * User facing config schema
 */
type RawConfig = FromSchema<typeof configSchema>;

export interface Config {
  initialBoard: ("x" | "o" | "empty")[][];
  initialTurn: number;
}

export interface State {
  errorEmphasisSpot: { x: number; y: number } | null;
  board: ("x" | "o" | "empty")[][];
}

declare global {
  const Zilch: ZilchNamespace<RawConfig, Config, State>;
}

/**
 * Schema for the JSON users can input as part of
 * game setup.
 */
const configSchema = {
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
Zilch.configSchema = configSchema;

Zilch.configPresets = [
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

Zilch.parseConfig = (rawConfig) => {
  let xCount = 0;
  let oCount = 0;

  const initialBoard = rawConfig.startingPosition.map((row) => {
    return row.map((spot) => {
      if (spot === "x") {
        xCount++;
        return "x" as const;
      } else if (spot === "o") {
        oCount++;
        return "o" as const;
      } else {
        return "empty" as const;
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
};

Zilch.serializeConfig = (config) => {
  return config.initialBoard.map((row) => row.join(",")).join("|");
};

Zilch.summarizeConfig = (config) => {
  if (config.initialTurn === 0) {
    return "standard starting position";
  } else {
    return "custom starting position";
  }
};
