import { createTemplate, file } from "zilch-game-engine";

export const templates = [
  createTemplate({
    id: "javascript.node",
    run: "node main.js",
    files: {
      "bot.js": file`
        class Bot {
          constructor(config) {
            this.config = config;
            console.log(this.config);
          }
        
          move(board) {
            console.log(board);
        
            const availableSpots = [];
        
            for (let x = 0; x < 3; x++) {
              for (let y = 0; y < 3; y++) {
                if (board[x][y] === "empty") {
                  availableSpots.push({ x, y });
                }
              }
            }
        
            return availableSpots[Math.floor(Math.random() * availableSpots.length)];
          }
        }
        
        module.exports.Bot = Bot;
      `,
      "main.js": file`
        const { Bot } = require("./bot");

        let bot;
        
        process.stdin.on("data", async (data) => {
          const input = data.toString();
          const command = input.slice(0, 1);
          const payload = input.slice(1);
        
          // "s" for "start"
          if (command === "s") {
            const standardCustomConfigSplit = payload.indexOf(".");
            const standardConfigParts = payload
              .slice(0, standardCustomConfigSplit)
              .split(",");
        
            const config = {
              gameTimeLimit: parseInt(standardConfigParts[0]),
              turnTimeLimit: parseInt(standardConfigParts[1]),
              player: standardConfigParts[2] === "0" ? "x" : "o",
              startingPosition: payload
                .slice(standardCustomConfigSplit + 1)
                .split("|")
                .map((row) => row.split(",")),
            };
        
            bot = new Bot(config);
        
            process.stderr.write("<<zilch:started>>");
        
            return;
          }
        
          // "m" for "move"
          if (command === "m") {
            const move = await bot.move(
              payload.split("|").map((row) => row.split(","))
            );
            process.stderr.write(\`<<zilch:move\${move.x},\${move.y}>>\`);
            return;
          }
        });
        
        process.stderr.write("<<zilch:ready>>");
      `,
    },
  }),
];
