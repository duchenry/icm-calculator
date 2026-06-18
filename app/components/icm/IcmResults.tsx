"use client";

import { useRef, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { toPng } from "html-to-image";
import { IcmResult } from "@/app/lib/icm/types";

interface IcmResultsProps {
  result: IcmResult;
  title: string;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function IcmResults({
  result,
  title,
}: IcmResultsProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportPng() {
    if (!resultRef.current || isExporting) {
      return;
    }

    try {
      setIsExporting(true);

      const dataUrl = await toPng(resultRef.current, {
        pixelRatio: 2,
        backgroundColor: "#020617",
        cacheBust: true,
      });

      const link = document.createElement("a");

      link.download = `${createFileName(title)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export ICM result:", error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="mt-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleExportPng}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <Download size={18} />
          )}

          {isExporting ? "Exporting..." : "Export PNG"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl">
        <div
          ref={resultRef}
          className="min-w-[1000px] bg-slate-950 p-8 text-white"
        >
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="border-b border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-cyan-500/10 px-8 py-7">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                    Poker Tournament ICM
                  </p>

                  <h2 className="text-3xl font-bold tracking-tight">
                    {title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Independent Chip Model results
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <SummaryCard
                    label="Total chips"
                    value={numberFormatter.format(
                      result.totalChips,
                    )}
                  />

                  <SummaryCard
                    label="Total payout"
                    value={numberFormatter.format(
                      result.totalPayout,
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-4">
                      Seat
                    </th>

                    <th className="px-4 py-4 text-right">
                      Stack
                    </th>

                    <th className="px-4 py-4 text-right">
                      Chip %
                    </th>

                    <th className="px-4 py-4 text-right">
                      ICM equity
                    </th>

                    <th className="px-4 py-4 text-right">
                      Equity %
                    </th>

                    {result.players[0]?.finishProbabilities.map(
                      ({ place }) => (
                        <th
                          key={place}
                          className="px-4 py-4 text-right"
                        >
                          {place}
                          {getOrdinalSuffix(place)}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {result.players.map(
                    (player, index) => (
                      <tr
                        key={player.seat}
                        className={
                          index ===
                          result.players.length - 1
                            ? ""
                            : "border-b border-slate-800"
                        }
                      >
                        <td className="px-4 py-5">
                          <div className="inline-flex h-10 min-w-20 items-center justify-center rounded-xl bg-slate-800 px-3 font-bold text-white">
                            Seat {player.seat}
                          </div>
                        </td>

                        <td className="px-4 py-5 text-right font-medium text-slate-300">
                          {numberFormatter.format(
                            player.stack,
                          )}
                        </td>

                        <td className="px-4 py-5 text-right text-slate-300">
                          {percentageFormatter.format(
                            player.chipPercentage * 100,
                          )}
                          %
                        </td>

                        <td className="px-4 py-5 text-right text-lg font-bold text-emerald-400">
                          {numberFormatter.format(
                            player.equity,
                          )}
                        </td>

                        <td className="px-4 py-5 text-right font-medium text-slate-300">
                          {percentageFormatter.format(
                            player.equityPercentage *
                              100,
                          )}
                          %
                        </td>

                        {player.finishProbabilities.map(
                          ({
                            place,
                            probability,
                          }) => (
                            <td
                              key={place}
                              className="px-4 py-5 text-right text-slate-400"
                            >
                              {percentageFormatter.format(
                                probability * 100,
                              )}
                              %
                            </td>
                          ),
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 px-8 py-5 text-xs text-slate-500">
              <span>
                Calculated using the Independent Chip Model
              </span>

              <span>
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                }).format(new Date())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="min-w-40 rounded-2xl border border-slate-700 bg-slate-950/70 px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function getOrdinalSuffix(place: number): string {
  const lastTwoDigits = place % 100;

  if (
    lastTwoDigits >= 11 &&
    lastTwoDigits <= 13
  ) {
    return "th";
  }

  switch (place % 10) {
    case 1:
      return "st";

    case 2:
      return "nd";

    case 3:
      return "rd";

    default:
      return "th";
  }
}

function createFileName(title: string): string {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedTitle
    ? `${normalizedTitle}-icm-results`
    : "icm-results";
}