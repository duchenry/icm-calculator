import { HeroDealAnalysis, HeroDealRating, IcmResult } from "./types";

export function calculateHeroDealAnalysis(
  result: IcmResult,
  heroSeat: number,
): HeroDealAnalysis {
  const hero = result.players.find(
    (player) => player.seat === heroSeat,
  );

  if (!hero) {
    throw new Error(`Hero seat ${heroSeat} was not found`);
  }

  const chipChop =
    result.totalPayout * hero.chipPercentage;

  const difference =
    hero.equity - chipChop;

  const differencePercentage =
    chipChop > 0
      ? difference / chipChop
      : 0;

  return {
    seat: hero.seat,
    stack: hero.stack,
    chipPercentage: hero.chipPercentage,

    icmDeal: hero.equity,
    chipChop,

    difference,
    differencePercentage,

    rating: getHeroDealRating(
      differencePercentage,
    ),
  };
}

function getHeroDealRating(
  differencePercentage: number,
): HeroDealRating {
  if (differencePercentage >= 0.05) {
    return "very_good";
  }

  if (differencePercentage >= 0.02) {
    return "good";
  }

  if (differencePercentage > -0.02) {
    return "fair";
  }

  if (differencePercentage > -0.05) {
    return "weak";
  }

  return "poor";
}