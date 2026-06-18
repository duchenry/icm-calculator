export interface IcmPlayer {
  seat: number;
  stack: number;
}

export interface IcmPayout {
  place: number;
  amount: number;
}

export interface IcmInput {
  players: IcmPlayer[];
  payouts: IcmPayout[];
}

export interface IcmFinishProbability {
  place: number;
  probability: number;
}

export interface IcmPlayerResult {
  seat: number;
  stack: number;
  chipPercentage: number;
  equity: number;
  equityPercentage: number;
  finishProbabilities: IcmFinishProbability[];
}

export interface IcmResult {
  totalChips: number;
  totalPayout: number;
  players: IcmPlayerResult[];
}