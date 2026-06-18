
import { HeroDealAnalysis as HeroDealAnalysisData,
  HeroDealRating } from "@/app/lib/icm/types";

interface HeroDealAnalysisProps {
  analysis: HeroDealAnalysisData;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const ratingContent: Record<
  HeroDealRating,
  {
    label: string;
    className: string;
  }
> = {
  very_good: {
    label: "Very good ICM deal",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },

  good: {
    label: "Good ICM deal",
    className:
      "border-green-500/30 bg-green-500/10 text-green-400",
  },

  fair: {
    label: "Fair ICM deal",
    className:
      "border-slate-600 bg-slate-800 text-slate-300",
  },

  weak: {
    label: "Weak ICM deal",
    className:
      "border-orange-500/30 bg-orange-500/10 text-orange-400",
  },

  poor: {
    label: "Poor ICM deal",
    className:
      "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

export default function HeroDealAnalysis({
  analysis,
}: HeroDealAnalysisProps) {
  const rating = ratingContent[analysis.rating];

  const differencePrefix =
    analysis.difference > 0 ? "+" : "";

  const percentagePrefix =
    analysis.differencePercentage > 0 ? "+" : "";

  return (
    <section className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:mt-6 sm:rounded-2xl sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
            Hero Deal Analysis
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Seat {analysis.seat}
          </h2>
        </div>

        <div
          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${rating.className}`}
        >
          {rating.label}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DealMetric
          label="Hero stack"
          value={numberFormatter.format(
            analysis.stack,
          )}
        />

        <DealMetric
          label="Chip share"
          value={`${percentageFormatter.format(
            analysis.chipPercentage * 100,
          )}%`}
        />

        <DealMetric
          label="ICM deal"
          value={numberFormatter.format(
            analysis.icmDeal,
          )}
          highlight
        />

        <DealMetric
          label="Chip chop"
          value={numberFormatter.format(
            analysis.chipChop,
          )}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <DealMetric
          label="ICM premium"
          value={`${differencePrefix}${numberFormatter.format(
            analysis.difference,
          )}`}
          positive={analysis.difference > 0}
          negative={analysis.difference < 0}
        />

        <DealMetric
          label="Premium %"
          value={`${percentagePrefix}${percentageFormatter.format(
            analysis.differencePercentage * 100,
          )}%`}
          positive={
            analysis.differencePercentage > 0
          }
          negative={
            analysis.differencePercentage < 0
          }
        />
      </div>
    </section>
  );
}

interface DealMetricProps {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
}

function DealMetric({
  label,
  value,
  highlight = false,
  positive = false,
  negative = false,
}: DealMetricProps) {
  let valueClassName = "text-white";

  if (highlight || positive) {
    valueClassName = "text-emerald-400";
  }

  if (negative) {
    valueClassName = "text-red-400";
  }

  return (
    <div className="rounded-lg bg-slate-950 p-3 sm:p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-base font-bold sm:text-lg ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}