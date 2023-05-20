import type { CreateBotParams } from "zilch-game-engine";

export class Bot {
  params: CreateBotParams;

  constructor(params: CreateBotParams) {
    this.params = params;
  }

  move(payload: string): string {
    // Actual implementation of this bot is private. Wouldn't be very fun if you
    // could just copy/paste the boss bot's code!
    return "no-op";
  }
}
