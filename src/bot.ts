import type { StartBotParams } from "zilch-game-engine";

Zilch.Bot = class Bot {
  params: StartBotParams;

  constructor(params: StartBotParams) {
    this.params = params;
  }

  static start(params: StartBotParams) {
    return new Bot(params);
  }

  move(payload: string) {
    // Actual implementation of this bot is private. Wouldn't be very fun if you
    // could just copy/paste the boss bot's code!
    return "no-op";
  }

  end(payload: string) {}
};
