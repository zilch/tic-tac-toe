```sh config=run
node main.js
```

```md file=/README.md
Check if you have Node.js installed on your system like this:

\`\`\`
node --version
\`\`\`

If you receive a `command not found` error follow the instructions
at https://nodejs.org/ to get up and running. Once you have Node.js
on your system you should be good to go! Run `./connect` from the
bot directory to play.
```

```js file=/main.js hidden=true
// ⚠️ Only modify this file if you know what you're doing!
const { Bot } = require("./bot");

function send(channel, payload) {
  process.stderr.write(
    `\n<<zilch>>.${channel}${payload ? "." + payload : ""}\n`
  );
}

function parseBoard(board) {
  return board.split("|").map((row) => row.split(","));
}

let bot;

process.stdin.on("data", async (chunk) => {
  const data = chunk.toString().trim();
  const channel = data.split(".", 1)[0];
  const payload = data.slice(channel.length + 1);

  if (channel === "start") {
    const standardCustomConfigSplit = payload.indexOf(".");
    const standardConfigParts = payload
      .slice(0, standardCustomConfigSplit)
      .split(",");

    const config = {
      gameTimeLimit: parseInt(standardConfigParts[0]),
      turnTimeLimit: parseInt(standardConfigParts[1]),
      player: standardConfigParts[2] === "0" ? "x" : "o",
      startingPosition: parseBoard(
        payload.slice(standardCustomConfigSplit + 1)
      ),
    };

    bot = new Bot(config);

    send("start", botInstanceId);
    return;
  }

  const bot = bots.get(botInstanceId);

  if (!bot) {
    throw new Error("Bot not yet initialized.");
  }

  if (channel === "move") {
    const move = await bot.move(...parseBoard(payload));
    send("move", `${move.x},${move.y}`);
    return;
  }

  if (channel === "end") {
    await bot.end(parseBoard(payload));
    return;
  }
});

send("ready");
```

```js file=/bot.js
// 👋 Hello there! This file contains ready-to-edit bot code.
// 🟢 Open "README.md" for instructions on how to get started!
// TL;DR Run ./connect (or .\connect.cmd on Windows) to begin.

class Bot {
  constructor(config) {
    this.config = config;
    console.log("Hello world!", this.config);
  }

  move(board) {
    console.log(board); // 3x3 array with values "x" or "o" or "empty"

    // Return the spot you'd like to move here.
    // x should be an integer between 0 and 2
    // y should be an integer between 0 and 2
    return { x: 0, y: 0 };
  }

  end(board) {
    console.log("Good game!");
  }
}

module.exports.Bot = Bot;
```
