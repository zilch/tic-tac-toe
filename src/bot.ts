import type { StartBotParams } from "zilch-game-engine";

Zilch.Bot = class Bot {
  params: StartBotParams;

  constructor(params: StartBotParams) {
    this.params = params;
  }

  static start(params: StartBotParams) {
    return new Bot(params);
  }

  move(payload: string): string {
    const board = payload.split("|").map((row) => row.split(","));
    const player = this.params.botIndex === 0 ? "x" : "o";

    const availableMoves: { x: number; y: number }[] = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (board[x]![y] === "empty") {
          availableMoves.push({ x, y });
        }
      }
    }

    const randomMove =
      availableMoves[Math.floor(availableMoves.length * Math.random())];

    if (!randomMove) {
      return "0,0";
    }

    if (this.params.type === "practice") {
      return randomMove.x + "," + randomMove.y;
    }

    // Easy bot just blocks...
    if (this.params.type === "boss-easy" || this.params.type === "boss-hard") {
      const winningMove = availableMoves.find(({ x, y }) => {
        board[x]![y] = player;
        const result = this.hasVictory(board, player);
        board[x]![y] = "empty";
        return result;
      });

      if (winningMove) {
        return winningMove.x + "," + winningMove.y;
      }
    }

    // Medium bot just looks to win...
    // Hard bot does both
    if (
      this.params.type === "boss-medium" ||
      this.params.type === "boss-hard"
    ) {
      const otherPlayer = player === "x" ? "o" : "x";
      const savingMove = availableMoves.find(({ x, y }) => {
        board[x]![y] = otherPlayer;
        const result = this.hasVictory(board, otherPlayer);
        board[x]![y] = "empty";
        return result;
      });

      if (savingMove) {
        return savingMove.x + "," + savingMove.y;
      }
    }

    return randomMove.x + "," + randomMove.y;
  }

  hasVictory(board: string[][], player: string) {
    const topLeft = { x: 0, y: 0 };
    const topCenter = { x: 0, y: 1 };
    const topRight = { x: 0, y: 2 };

    const centerLeft = { x: 1, y: 0 };
    const centerCenter = { x: 1, y: 1 };
    const centerRight = { x: 1, y: 2 };

    const bottomLeft = { x: 2, y: 0 };
    const bottomCenter = { x: 2, y: 1 };
    const bottomRight = { x: 2, y: 2 };

    const winningLines = [
      [topLeft, topCenter, topRight],
      [centerLeft, centerCenter, centerRight],
      [bottomLeft, bottomCenter, bottomRight],

      [topLeft, centerLeft, bottomLeft],
      [topCenter, centerCenter, bottomCenter],
      [topRight, centerRight, bottomRight],

      [topLeft, centerCenter, bottomRight],
      [bottomLeft, centerCenter, topRight],
    ];

    return winningLines.some((line) =>
      line.every((position) => board[position.x]![position.y] === player)
    );
  }

  end() {
    this.params.println("Good game!");
  }
};
