"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calculator,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  useFieldArray,
  useForm,
} from "react-hook-form";
import { IcmResult, HeroDealAnalysis as HeroDealAnalysisData, } from "@/app/lib/icm/types";
import { defaultIcmFormValues, icmFormSchema, IcmFormValues } from "@/app/lib/icm/form-schema";
import { clearIcmCalculation, loadIcmCalculation, saveIcmCalculation } from "@/app/lib/icm/storage";
import { transformFormToIcmInput } from "@/app/lib/icm/transform";
import { calculateIcm } from "@/app/lib/icm/engine";
import IcmResults from "./IcmResults";
import { calculateHeroDealAnalysis } from "@/app/lib/icm/hero-deal";
import HeroDealAnalysis from "./HeroDealAnalysis";

export default function IcmCalculator() {
  const [result, setResult] =
    useState<IcmResult | null>(null);

  const [resultTitle, setResultTitle] =
    useState(defaultIcmFormValues.title);

    const [heroAnalysis, setHeroAnalysis] =
  useState<HeroDealAnalysisData | null>(null);

  const {
    control,
    register,
    handleSubmit,
    getValues,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<IcmFormValues>({
    resolver: zodResolver(icmFormSchema),
    defaultValues: defaultIcmFormValues,
  });

  const {
    fields: playerFields,
    append: appendPlayer,
    replace: replacePlayers,
  } = useFieldArray({
    control,
    name: "players",
  });

  const {
    fields: payoutFields,
    append: appendPayout,
    replace: replacePayouts,
  } = useFieldArray({
    control,
    name: "payouts",
  });

  useEffect(() => {
  const savedCalculation = loadIcmCalculation();

  if (!savedCalculation) {
    return;
  }

  const heroSeat =
    savedCalculation.formValues.heroSeat ??
    defaultIcmFormValues.heroSeat;

  const restoredFormValues = {
    ...savedCalculation.formValues,
    heroSeat,
  };

  reset(restoredFormValues);

  setResult(savedCalculation.result);
  setResultTitle(restoredFormValues.title);

  setHeroAnalysis(
    calculateHeroDealAnalysis(
      savedCalculation.result,
      heroSeat,
    ),
  );
}, [reset]);

  function handleAddPlayer() {
    if (playerFields.length >= 10) {
      return;
    }

    const nextNumber = playerFields.length + 1;

    appendPlayer({
      seat: nextNumber,
      stack: "",
    });

    appendPayout({
      place: nextNumber,
      amount: "",
    });
  }

  function handleRemovePlayer(index: number) {
    if (playerFields.length <= 2) {
      return;
    }

    const currentPlayers = getValues("players");
    const currentPayouts = getValues("payouts");

    const nextPlayers = currentPlayers
      .filter(
        (_, playerIndex) => playerIndex !== index,
      )
      .map((player, playerIndex) => ({
        ...player,
        seat: playerIndex + 1,
      }));

    const nextPayouts = currentPayouts
      .slice(0, -1)
      .map((payout, payoutIndex) => ({
        ...payout,
        place: payoutIndex + 1,
      }));

    replacePlayers(nextPlayers);
    replacePayouts(nextPayouts);
  }

  function handleReset() {
    clearIcmCalculation();

    reset(defaultIcmFormValues);

    setResult(null);
    setHeroAnalysis(null);
    setResultTitle(defaultIcmFormValues.title);
  }

  function onSubmit(values: IcmFormValues) {
    const icmInput =
      transformFormToIcmInput(values);

    const icmResult = calculateIcm(icmInput);

    const dealAnalysis =
      calculateHeroDealAnalysis(
        icmResult,
        values.heroSeat,
      );

    setResult(icmResult);
    setHeroAnalysis(dealAnalysis);
    setResultTitle(values.title);

    saveIcmCalculation(values, icmResult);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 text-white sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-5 sm:mb-8">
          <p className="mb-1 text-xs font-medium text-emerald-400 sm:text-sm">
            Poker Tournament Tool
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Final Table ICM Calculator
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Nhập stack của từng seat và payout của giải.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:rounded-2xl sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-3 sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Players
                  </h2>

                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    Từ 2 đến 10 người chơi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPlayer}
                  disabled={playerFields.length >= 10}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  <Plus size={16} />
                  Add seat
                </button>
              </div>

              <div className="mb-2 grid grid-cols-[64px_minmax(0,1fr)_40px] gap-2 px-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:grid-cols-[80px_1fr_44px] sm:gap-3 sm:text-xs">
                <span>Seat</span>
                <span>Stack</span>
                <span />
              </div>

              <div className="space-y-3">
                {playerFields.map((field, index) => (
                  <div key={field.id}>
                    <div className="grid grid-cols-[64px_minmax(0,1fr)_40px] gap-2 sm:grid-cols-[80px_1fr_44px] sm:gap-3">
                      <div className="flex items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 sm:text-sm">
                        Seat {index + 1}
                      </div>

                      <input
                        type="hidden"
                        {...register(
                          `players.${index}.seat`,
                          {
                            valueAsNumber: true,
                          },
                        )}
                      />

                      <input
                        type="number"
                        min={1}
                        step={1}
                        inputMode="numeric"
                        placeholder="Enter stack"
                        {...register(
                          `players.${index}.stack`,
                        )}
                        className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemovePlayer(index)
                        }
                        disabled={
                          playerFields.length <= 2
                        }
                        aria-label={`Remove seat ${index + 1}`}
                        className="flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    {errors.players?.[index]?.stack && (
                      <p className="mt-1 pl-[72px] text-xs text-red-400 sm:pl-[92px] sm:text-sm">
                        {
                          errors.players[index]?.stack
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {errors.players?.root?.message && (
                <p className="mt-3 text-sm text-red-400">
                  {errors.players.root.message}
                </p>
              )}
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:rounded-2xl sm:p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  Payouts
                </h2>

                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Payout tự động khớp với số seat.
                </p>
              </div>

              <div className="mb-2 grid grid-cols-[76px_minmax(0,1fr)] gap-2 px-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:grid-cols-[100px_1fr] sm:gap-3 sm:text-xs">
                <span>Place</span>
                <span>Payout</span>
              </div>

              <div className="space-y-3">
                {payoutFields.map((field, index) => (
                  <div key={field.id}>
                    <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2 sm:grid-cols-[100px_1fr] sm:gap-3">
                      <div className="flex items-center rounded-lg bg-slate-800 px-2 text-xs font-semibold text-slate-300 sm:px-3 sm:text-sm">
                        Place {index + 1}
                      </div>

                      <input
                        type="hidden"
                        {...register(
                          `payouts.${index}.place`,
                          {
                            valueAsNumber: true,
                          },
                        )}
                      />

                      <input
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        placeholder="Enter payout"
                        {...register(
                          `payouts.${index}.amount`,
                        )}
                        className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                      />
                    </div>

                    {errors.payouts?.[index]?.amount && (
                      <p className="mt-1 pl-[84px] text-xs text-red-400 sm:pl-[112px] sm:text-sm">
                        {
                          errors.payouts[index]?.amount
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {errors.payouts?.root?.message && (
                <p className="mt-3 text-sm text-red-400">
                  {errors.payouts.root.message}
                </p>
              )}
            </section>
          </div>

          <section className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:mt-6 sm:rounded-2xl sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="heroSeat"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Hero seat
                </label>

                <select
                  id="heroSeat"
                  {...register("heroSeat", {
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500"
                >
                  {playerFields.map((_, index) => (
                    <option
                      key={index + 1}
                      value={index + 1}
                    >
                      Seat {index + 1}
                    </option>
                  ))}
                </select>

                {errors.heroSeat && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.heroSeat.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Calculation title
                </label>

                <input
                  id="title"
                  type="text"
                  {...register("title")}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500"
                />

                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Calculator size={19} />
                Calculate ICM
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-200 transition hover:border-red-500 hover:text-red-400 sm:w-auto"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            </div>
          </section>
        </form>

        {result && (
          <IcmResults
            result={result}
            title={resultTitle}
          />
        )}

        {heroAnalysis && (
          <HeroDealAnalysis analysis={heroAnalysis} />
        )}
      </div>
    </main>
  );
}