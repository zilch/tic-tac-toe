```sh config=run
node main.js
```

```json file=/.devcontainer.json hidden=true
{
  "name": "Zilch Bot",
  "image": "mcr.microsoft.com/vscode/devcontainers/javascript-node:18",
  "postStartCommand": "./connect --welcome",
  "customizations": {
    "codespaces": {
      "openFiles": ["bot.js"]
    }
  }
}
```

```js file=/main.js hidden=true
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
    process.stderr.write(`<<zilch:move${move.x},${move.y}>>`);
    return;
  }

  // "e" for "end"
  if (command === "e") {
    await bot.end(payload.split("|").map((row) => row.split(",")));
    return;
  }
});

process.stderr.write("<<zilch:ready>>");
```

```js file=/bot.js
class Bot {
  constructor(config) {
    this.config = config;
    console.log("Hello world", this.config);
  }

  move(board) {
    console.log(board);
    return { x: 0, y: 0 };
  }

  end() {
    console.log("Good game!");
  }
}

module.exports.Bot = Bot;
```
