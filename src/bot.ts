import type { CreateBotParams } from "zilch-game-engine";

Zilch.Bot = class Bot {
  params: CreateBotParams;

  constructor(params: CreateBotParams) {
    this.params = params;
  }

  static create(params: CreateBotParams) {
    return new Bot(params);
  }

  move(payload: string) {
    // Actual implementation of this bot is private. Wouldn't be very fun if you
    // could just copy/paste the boss bot's code!
    return "no-op";
  }
};
