import { BotOutcome, Engine, Game } from "zilch-game-engine";
import type { Config } from "./config";
import type { State } from "./state";
import chalk from "chalk";

interface Move {
  x: number;
  y: number;
}

export async function* play(game: Game<Config>): Engine<State> {
  let turn = game.config.initialTurn;
  const state: State = {
    board: game.config.initialBoard,
  };

  while (true) {
    const outcome = getOutcomeAndWinningLine(state)?.outcome ?? null;

    if (outcome !== null) {
      return outcome;
    }

    const botIndex = turn % 2 === 0 ? 0 : 1;
    const bot = game.bots[botIndex];

    const payload = createMovePayload(state);

    bot.writeln(chalk.dim(`Start turn`));
    const move = await bot.move(payload).then(parseMoveResponse);
    bot.writeln(chalk.dim(`⤷ x=${move.x} y=${move.y}`));

    const spotValue = state.board[move.x][move.y];

    if (typeof spotValue === "number") {
      state.board[move.x][move.y] = [spotValue, turn];
      bot.writeln(
        chalk.red(`\nSpot { x: ${move.x}, y: ${move.y} } already occupied.`)
      );

      yield state;

      return [
        botIndex === 0 ? BotOutcome.Error : BotOutcome.None,
        botIndex === 1 ? BotOutcome.Error : BotOutcome.None,
      ];
    } else {
      state.board[move.x][move.y] = turn;
      yield state;
    }

    turn++;
  }
}

function parseMoveResponse(response: string): Move {
  const [x, y] = response.split(",").map((value) => {
    if (/(0|1|2)/.test(value)) {
      return parseInt(value);
    }
  });

  if (x === undefined || y === undefined) {
    throw new Error(`Response invalid: "${response}"`);
  }

  return { x, y };
}

function createMovePayload(state: State) {
  const board = state.board.map((row) => {
    return row.map((turn) => {
      if (turn === null) {
        return "empty" as const;
      } else if (Array.isArray(turn) ? turn[0] % 2 === 0 : turn % 2 === 0) {
        return "x" as const;
      } else {
        return "o" as const;
      }
    });
  });

  return board.map((row) => row.join(",")).join("|");
}

function getOutcomeAndWinningLine(
  state: State
): { outcome: BotOutcome[]; winningLine?: Move[] } | null {
  const topLeft: Move = { x: 0, y: 0 };
  const topCenter: Move = { x: 0, y: 1 };
  const topRight: Move = { x: 0, y: 2 };

  const centerLeft: Move = { x: 1, y: 0 };
  const centerCenter: Move = { x: 1, y: 1 };
  const centerRight: Move = { x: 1, y: 2 };

  const bottomLeft: Move = { x: 2, y: 0 };
  const bottomCenter: Move = { x: 2, y: 1 };
  const bottomRight: Move = { x: 2, y: 2 };

  const winningLines: Move[][] = [
    [topLeft, topCenter, topRight],
    [centerLeft, centerCenter, centerRight],
    [bottomLeft, bottomCenter, bottomRight],

    [topLeft, centerLeft, bottomLeft],
    [topCenter, centerCenter, bottomCenter],
    [topRight, centerRight, bottomRight],

    [topLeft, centerCenter, bottomRight],
    [bottomLeft, centerCenter, topRight],
  ];

  for (const player of [0, 1] as const) {
    const winningLine = winningLines.find((line) =>
      line.every((position) => {
        let value = state.board[position.x]?.[position.y];
        if (value === null) {
          return false;
        }

        if (Array.isArray(value)) {
          value = value[0] ?? 0;
        }

        return value % 2 === player;
      })
    );

    if (winningLine) {
      return {
        winningLine,
        outcome: [
          player === 0 ? BotOutcome.Victory : BotOutcome.Defeat,
          player === 1 ? BotOutcome.Victory : BotOutcome.Defeat,
        ],
      };
    }
  }

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (state.board[x][y] === null) {
        return null;
      }
    }
  }

  return {
    outcome: [BotOutcome.Draw, BotOutcome.Draw],
  };
}
