"use client";

import { useRef, useState } from "react";
import {
  Download,
  LoaderCircle,
  Trophy,
} from "lucide-react";
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
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] =
    useState(false);

  async function handleExportPng() {
    if (!exportRef.current || isExporting) {
      return;
    }

    try {
      setIsExporting(true);

      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#020617",
        cacheBust: true,
      });

      const link = document.createElement("a");

      link.download = `${createFileName(title)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error(
        "Failed to export ICM result:",
        error,
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="mt-4 sm:mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            ICM Results
          </h2>

          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Equity and finish probabilities
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportPng}
          disabled={isExporting}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
        >
          {isExporting ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
            />
          ) : (
            <Download size={17} />
          )}

          <span className="hidden sm:inline">
            {isExporting
              ? "Exporting..."
              : "Export PNG"}
          </span>

          <span className="sm:hidden">
            {isExporting ? "Exporting" : "PNG"}
          </span>
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-5">
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

      <div className="space-y-3 lg:hidden">
        {result.players.map((player) => (
          <article
            key={player.seat}
            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                  <Trophy
                    size={17}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Seat {player.seat}
                  </p>

                  <p className="text-xs text-slate-500">
                    Stack{" "}
                    {numberFormatter.format(
                      player.stack,
                    )}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">
                  ICM equity
                </p>

                <p className="text-lg font-bold text-emerald-400">
                  {numberFormatter.format(
                    player.equity,
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-800 border-b border-slate-800">
              <Metric
                label="Chip share"
                value={`${formatPercentage(
                  player.chipPercentage,
                )}%`}
              />

              <Metric
                label="Equity share"
                value={`${formatPercentage(
                  player.equityPercentage,
                )}%`}
              />
            </div>

            <div className="p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Finish probability
              </p>

              <div className="grid grid-cols-3 gap-2">
                {player.finishProbabilities.map(
                  ({ place, probability }) => (
                    <div
                      key={place}
                      className="rounded-lg bg-slate-950 px-2 py-3 text-center"
                    >
                      <p className="text-xs text-slate-500">
                        {place}
                        {getOrdinalSuffix(place)}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {formatPercentage(
                          probability,
                        )}
                        %
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 lg:block">
        <div className="overflow-x-auto">
          <ResultsTable result={result} />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-[-10000px] top-0 w-[1200px]"
      >
        <ExportLayout
          ref={exportRef}
          result={result}
          title={title}
        />
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
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-4 sm:rounded-2xl sm:px-5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 truncate text-base font-bold text-white sm:text-xl">
        {value}
      </p>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({
  label,
  value,
}: MetricProps) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

interface ResultsTableProps {
  result: IcmResult;
}

function ResultsTable({
  result,
}: ResultsTableProps) {
  return (
    <table className="min-w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wide text-slate-500">
          <th className="px-4 py-4">Seat</th>

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
        {result.players.map((player) => (
          <tr
            key={player.seat}
            className="border-b border-slate-800 last:border-0"
          >
            <td className="px-4 py-5 font-semibold text-white">
              Seat {player.seat}
            </td>

            <td className="px-4 py-5 text-right text-slate-300">
              {numberFormatter.format(
                player.stack,
              )}
            </td>

            <td className="px-4 py-5 text-right text-slate-300">
              {formatPercentage(
                player.chipPercentage,
              )}
              %
            </td>

            <td className="px-4 py-5 text-right text-lg font-bold text-emerald-400">
              {numberFormatter.format(
                player.equity,
              )}
            </td>

            <td className="px-4 py-5 text-right text-slate-300">
              {formatPercentage(
                player.equityPercentage,
              )}
              %
            </td>

            {player.finishProbabilities.map(
              ({ place, probability }) => (
                <td
                  key={place}
                  className="px-4 py-5 text-right text-slate-400"
                >
                  {formatPercentage(probability)}%
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface ExportLayoutProps {
  result: IcmResult;
  title: string;
}

const ExportLayout = ({
  result,
  title,
  ref,
}: ExportLayoutProps & {
  ref: React.Ref<HTMLDivElement>;
}) => {
  return (
    <div
      ref={ref}
      className="bg-slate-950 p-8 text-white"
    >
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <div className="flex items-start justify-between gap-8 border-b border-slate-800 px-8 py-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Poker Tournament ICM
            </p>

            <h2 className="mt-2 text-3xl font-bold">
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

        <ResultsTable result={result} />

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
  );
};

function formatPercentage(value: number): string {
  return percentageFormatter.format(value * 100);
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