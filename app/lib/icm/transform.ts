import { IcmFormValues } from "./form-schema";
import { IcmInput } from "./types";

export function transformFormToIcmInput(
  values: IcmFormValues,
): IcmInput {
  return {
    players: values.players.map((player) => ({
      seat: player.seat,
      stack: Number(player.stack),
    })),

    payouts: values.payouts.map((payout) => ({
      place: payout.place,
      amount: Number(payout.amount),
    })),
  };
}