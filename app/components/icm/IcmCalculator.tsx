"use client";

import { useEffect, useState } from "react";
import { calculateIcm } from "@/app/lib/icm/engine";
import { defaultIcmFormValues, icmFormSchema, IcmFormValues } from "@/app/lib/icm/form-schema";
import { transformFormToIcmInput } from "@/app/lib/icm/transform";
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
import { IcmResult } from "@/app/lib/icm/types";
import IcmResults from "./IcmResults";
import { saveIcmCalculation, loadIcmCalculation, clearIcmCalculation } from "@/app/lib/icm/storage";

export default function IcmCalculator() {
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
  const [result, setResult] =
  useState<IcmResult | null>(null);

  const [resultTitle, setResultTitle] =
  useState("Final Table ICM");

  useEffect(() => {
  const savedCalculation = loadIcmCalculation();

  if (!savedCalculation) {
    return;
  }

  reset(savedCalculation.formValues);
  setResult(savedCalculation.result);
  setResultTitle(savedCalculation.formValues.title);
    }, [reset]);

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
      .filter((_, playerIndex) => playerIndex !== index)
      .map((player, playerIndex) => ({
        ...player,
        seat: playerIndex + 1,
      }));

    const nextPayouts = currentPayouts
      .filter((_, payoutIndex) => payoutIndex !== index)
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
  setResultTitle(defaultIcmFormValues.title);
    }

  function onSubmit(values: IcmFormValues) {
  const icmInput = transformFormToIcmInput(values);
  const icmResult = calculateIcm(icmInput);

  setResult(icmResult);
  setResultTitle(values.title);

  saveIcmCalculation(values, icmResult);
}

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-emerald-400">
            Poker Tournament Tool
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Final Table ICM Calculator
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Nhập stack của từng seat và payout của giải.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Players
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Từ 2 đến 10 người chơi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPlayer}
                  disabled={playerFields.length >= 10}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                  Add seat
                </button>
              </div>

              <div className="mb-2 grid grid-cols-[80px_1fr_44px] gap-3 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                <span>Seat</span>
                <span>Stack</span>
                <span />
              </div>

              <div className="space-y-3">
                {playerFields.map((field, index) => (
                  <div key={field.id}>
                    <div className="grid grid-cols-[80px_1fr_44px] gap-3">
                      <div className="flex items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-300">
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
                        placeholder="Enter stack"
                        {...register(
                          `players.${index}.stack`,
                        )}
                        className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-emerald-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemovePlayer(index)
                        }
                        disabled={playerFields.length <= 2}
                        aria-label={`Remove seat ${index + 1}`}
                        className="flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    {errors.players?.[index]?.stack && (
                      <p className="mt-1 text-sm text-red-400">
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

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Payouts
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Payout tự động khớp với số seat.
                </p>
              </div>

              <div className="mb-2 grid grid-cols-[100px_1fr] gap-3 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                <span>Place</span>
                <span>Payout</span>
              </div>

              <div className="space-y-3">
                {payoutFields.map((field, index) => (
                  <div key={field.id}>
                    <div className="grid grid-cols-[100px_1fr] gap-3">
                      <div className="flex items-center rounded-lg bg-slate-800 px-3 text-sm font-semibold text-slate-300">
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
                        placeholder="Enter payout"
                        {...register(
                          `payouts.${index}.amount`,
                        )}
                        className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-emerald-500"
                      />
                    </div>

                    {errors.payouts?.[index]?.amount && (
                      <p className="mt-1 text-sm text-red-400">
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

          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-500"
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title.message}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Calculator size={19} />
                    Calculate ICM
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-200 hover:border-red-500 hover:text-red-400"
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
      </div>
    </main>
  );
}