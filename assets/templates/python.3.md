```sh config=run
python3 -u ./main.py
```

```md file=/README.md hidden=true
Check if you have Python 3 installed on your system like this:

\`\`\`
python --version
\`\`\`

If you receive a `command not found` error follow the instructions
at https://www.python.org/ to get up and running. Once you have Python
on your system you should be good to go! Run `./connect` from the
bot directory to play.
```

```py file=/main.py hidden=true
import sys
from bot import Bot

def send(channel: str, *args):
    payload = args[0] if len(args) > 0 else None

    message = "\n<<zilch>>." + channel

    if payload is not None:
        message += "." + payload

    message += "\n"

    print(message, end="", file=sys.stderr)

def parse_board(board):
    return list(map(
        lambda row: row.split(","),
        board.split("|")
    ))

send("ready")

bot: Bot = None

while True:
    data = sys.stdin.readline().strip()
    channel, payload = data.split(".", 1)

    if channel == "start":
        standard_config, custom_config = payload.split(".", 1)
        game_time_limit, turn_time_limit, player = standard_config.split(",", 2)
        config = {
            "game_time_limit": int(game_time_limit),
            "turn_time_limit": int(turn_time_limit),
            "player": "x" if player == "0" else "o",
            "starting_position": parse_board(custom_config)
        }
        bot = Bot(config)
        send("start")
        continue

    if channel == "move":
        x, y = bot.move(parse_board(payload))
        send("move", str(x) + "," + str(y))
        continue

    if channel == "end":
        bot.end(parse_board(payload))
        continue
```

```py file=/bot.py
# 👋 Hello there! This file contains ready-to-edit bot code.
# 🟢 Open "README.md" for instructions on how to get started!
# TL;DR Run ./connect (or .\connect.cmd on Windows) to begin.

class Bot:
    def __init__(self, config):
        print("Hello World!", config)
        pass

    def move(self, board):
        print(board)  # 3x3 array with values "x" or "o" or "empty"

        # Return the spot you'd like to move here.
        # 1st value: x, should be an integer between 0 and 2
        # 2nd value: y, should be an integer between 0 and 2
        return (0, 1)

    def end(self, board):
        print("Good game!")
```
