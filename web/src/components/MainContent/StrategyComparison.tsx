"use client";

import Card from "@/components/Generic/Card";
import { calculateScenario, ProjectionData } from "@/lib/projection";
import { ArrowRightLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface StrategyComparisonProps {
  data: ProjectionData;
  calculations: ReturnType<typeof calculateScenario>;
}

/**
 * @description Compares mortgage strategy vs investing strategy
 * @param data Projection data including mortgage and investing parameters
 * @param calculations Precomputed scenario calculations
 * @returns A card comparing mortgage strategy vs investing strategy
 */
export default function StrategyComparison({
  data,
  calculations,
}: StrategyComparisonProps) {
  const t = useTranslations("MainContent");

  return (
    <Card tooltipContent={t("Strategy.tooltip")}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">{t("Strategy.title")}</h3>
      </div>

      <div className="space-y-6">
        {/* 1. Mortgage vs Investment */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">{t("Strategy.rateVsReturn")}</span>
            <span
              className={`font-bold ${
                data.investing.return > calculations.rates.effectiveRate
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {data.investing.return > calculations.rates.effectiveRate
                ? t("Strategy.investSurplus")
                : t("Strategy.payDebt")}
            </span>
          </div>
          <div className="relative h-8 bg-slate-100 rounded-md flex overflow-hidden">
            {/* Mortgage Bar */}
            <div
              className="bg-rose-400 flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
              style={{
                width: `${
                  (calculations.rates.effectiveRate /
                    (calculations.rates.effectiveRate +
                      data.investing.return)) *
                  100
                }%`,
              }}
            >
              {t("Strategy.loan")} {calculations.rates.effectiveRate}%
            </div>
            {/* Investment Bar */}
            <div
              className="bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
              style={{
                width: `${
                  (data.investing.return /
                    (calculations.rates.effectiveRate +
                      data.investing.return)) *
                  100
                }%`,
              }}
            >
              {t("Strategy.invest")} {data.investing.return}%
            </div>
          </div>
        </div>

        {/* 2. Pledge Cost vs Tax */}
        {data.pledge.amount > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">
                {t("Strategy.pledgeVsSell")}
              </span>
              <span className="text-indigo-600 font-bold">
                {t("Strategy.leverage")}
              </span>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex-1 bg-indigo-50 border border-indigo-100 p-2 rounded text-center">
                <span className="block text-indigo-400 mb-1">
                  {t("Strategy.pledgeCost")}
                </span>
                <span className="font-bold text-indigo-700">~4.5%</span>
              </div>
              <div className="flex items-center text-slate-400">
                <ArrowRightLeft size={16} />
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-100 p-2 rounded text-center">
                <span className="block text-slate-400 mb-1">
                  {t("Strategy.taxOnSell")}
                </span>
                <span className="font-bold text-slate-600">~19-23%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
