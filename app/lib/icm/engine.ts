import { IcmInput, IcmPlayerResult, IcmResult } from "./types";


export function calculateIcm(input: IcmInput): IcmResult {
  const playerCount = input.players.length;

  if (playerCount < 2 || playerCount > 10) {
    throw new Error("ICM supports between 2 and 10 players");
  }

  if (input.payouts.length !== playerCount) {
    throw new Error(
      "The number of payouts must match the number of players",
    );
  }

  const stacks = input.players.map((player) => player.stack);

  const payouts = input.payouts.map(
    (payout) => payout.amount,
  );

  const totalChips = stacks.reduce(
    (total, stack) => total + stack,
    0,
  );

  const totalPayout = payouts.reduce(
    (total, payout) => total + payout,
    0,
  );

  const stateCount = 1 << playerCount;
  const fullMask = stateCount - 1;

  const stackSumByMask = new Float64Array(stateCount);

  for (let mask = 1; mask < stateCount; mask += 1) {
    const lowestBit = mask & -mask;
    const playerIndex = getBitIndex(lowestBit);
    const previousMask = mask ^ lowestBit;

    stackSumByMask[mask] =
      stackSumByMask[previousMask] + stacks[playerIndex];
  }

  const stateProbabilities = new Float64Array(stateCount);

  const finishProbabilities = Array.from(
    { length: playerCount },
    () => new Float64Array(playerCount),
  );

  stateProbabilities[fullMask] = 1;

  for (let mask = fullMask; mask > 0; mask -= 1) {
    const stateProbability = stateProbabilities[mask];

    if (stateProbability === 0) {
      continue;
    }

    const remainingPlayerCount = countBits(mask);

    const placeIndex =
      playerCount - remainingPlayerCount;

    const remainingChips = stackSumByMask[mask];

    for (
      let playerIndex = 0;
      playerIndex < playerCount;
      playerIndex += 1
    ) {
      const playerBit = 1 << playerIndex;

      if ((mask & playerBit) === 0) {
        continue;
      }

      const finishProbability =
        stateProbability *
        (stacks[playerIndex] / remainingChips);

      finishProbabilities[playerIndex][placeIndex] +=
        finishProbability;

      const nextMask = mask ^ playerBit;

      stateProbabilities[nextMask] += finishProbability;
    }
  }

  const players: IcmPlayerResult[] = input.players.map(
    (player, playerIndex) => {
      const probabilities = Array.from(
        finishProbabilities[playerIndex],
      );

      const equity = probabilities.reduce(
        (total, probability, placeIndex) =>
          total + probability * payouts[placeIndex],
        0,
      );

      return {
        seat: player.seat,
        stack: player.stack,

        chipPercentage:
          totalChips > 0
            ? player.stack / totalChips
            : 0,

        equity,

        equityPercentage:
          totalPayout > 0
            ? equity / totalPayout
            : 0,

        finishProbabilities: probabilities.map(
          (probability, placeIndex) => ({
            place: placeIndex + 1,
            probability,
          }),
        ),
      };
    },
  );

  return {
    totalChips,
    totalPayout,
    players,
  };
}

function countBits(value: number): number {
  let count = 0;
  let currentValue = value;

  while (currentValue !== 0) {
    currentValue &= currentValue - 1;
    count += 1;
  }

  return count;
}

function getBitIndex(bit: number): number {
  return 31 - Math.clz32(bit);
}