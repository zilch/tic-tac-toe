import { BotOutcome } from "zilch-game-engine";
import { Chalk } from "chalk";
import { State } from "./config";

const chalk = new Chalk({ level: 3 });

interface Move {
  x: number;
  y: number;
}

Zilch.play = async function* (game) {
  let turn = game.config.initialTurn;

  const state: State = {
    board: game.config.initialBoard,
    errorEmphasisSpot: null,
  };

  const outcome = getOutcomeAndWinningLine(state)?.outcome ?? null;

  if (outcome !== null) {
    yield { outcome, state };
  }

  while (true) {
    const botIndex = turn % 2 === 0 ? 0 : 1;
    const bot = game.bots[botIndex];

    const payload = createMovePayload(state);

    bot.writeln(chalk.dim(`Start turn`));
    const move = await bot.move(payload).then(parseMoveResponse);

    if (move instanceof Error) {
      bot.writeln(chalk.red(`Unable to parse move. ${move.message}`));
      yield {
        outcome: [
          botIndex === 0 ? BotOutcome.Error : BotOutcome.None,
          botIndex === 1 ? BotOutcome.Error : BotOutcome.None,
        ],
        state,
      };
      continue;
    }

    bot.writeln(chalk.dim(`⤷ x=${move.x} y=${move.y}`));

    const spotValue = state.board[move.x][move.y];

    let outcome: BotOutcome[] | null = null;

    if (spotValue !== "empty") {
      bot.writeln(
        chalk.red(`\nSpot { x: ${move.x}, y: ${move.y} } already occupied.`)
      );

      state.errorEmphasisSpot = move;

      outcome = [
        botIndex === 0 ? BotOutcome.Error : BotOutcome.None,
        botIndex === 1 ? BotOutcome.Error : BotOutcome.None,
      ];
    } else {
      state.board[move.x][move.y] = turn % 2 === 0 ? "x" : "o";
      outcome = getOutcomeAndWinningLine(state)?.outcome ?? null;
    }

    if (outcome !== null) {
      await Promise.all(
        game.bots.map((bot) => bot.end(createMovePayload(state)))
      );
    }

    yield { state, outcome };

    turn++;
  }
};

function parseMoveResponse(response: string): Move | Error {
  const [x, y] = response.split(",").map((value) => {
    if (/(0|1|2)/.test(value)) {
      return parseInt(value);
    }
  });

  if (x === undefined || y === undefined) {
    return new Error(`Move invalid: "${response}"`);
  }

  return { x, y };
}

function createMovePayload(state: State) {
  return state.board.map((row) => row.join(",")).join("|");
}

export function getOutcomeAndWinningLine(
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

  for (const player of ["x", "o"] as const) {
    const winningLine = winningLines.find((line) =>
      line.every((position) => {
        const value = state.board[position.x]?.[position.y];
        if (value === "empty") {
          return false;
        }

        return value === player;
      })
    );

    if (winningLine) {
      return {
        winningLine,
        outcome: [
          player === "x" ? BotOutcome.Victory : BotOutcome.Defeat,
          player === "o" ? BotOutcome.Victory : BotOutcome.Defeat,
        ],
      };
    }
  }

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (state.board[x][y] === "empty") {
        return null;
      }
    }
  }

  return {
    outcome: [BotOutcome.Draw, BotOutcome.Draw],
  };
}
