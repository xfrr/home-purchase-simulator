"use client";

import Card from "@/components/Generic/Card";
import { calculateScenario, ProjectionData } from "@/lib/projection";
import { Banknote, Wallet } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

interface CostAnalysisProps {
  data: ProjectionData;
  calculations: ReturnType<typeof calculateScenario>;
}

export default function CostAnalysis({
  data,
  calculations,
}: CostAnalysisProps) {
  const t = useTranslations("MainContent");
  const format = useFormatter();
  const [viewTerm, setViewTerm] = useState<5 | 10 | 15 | 30>(10);

  const snapshot =
    calculations.projections[Math.min(viewTerm, data.mortgage.term) - 1] ||
    calculations.projections[0];

  return (
    <Card tooltipContent={t("Costs.tooltip")}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">{t("Costs.title")}</h3>
        <div className="flex bg-slate-100 rounded-lg p-1">
          {[5, 10, 15, 30].map((term) => (
            <button
              key={term}
              onClick={() => setViewTerm(term as 5 | 10 | 15 | 30)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewTerm === term
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {term === 30 ? t("Costs.fullTerm") : `${term}Y`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Banknote size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">
                {t("Costs.interestPaid")}
              </p>
              <p className="text-sm text-slate-400">
                {t("Costs.interestDesc")}
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-slate-700">
            {format.number(snapshot.totalInterest, {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">
                {t("Costs.cashOutlay")}
              </p>
              <p className="text-sm text-slate-400">{t("Costs.outlayDesc")}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-slate-700">
            {format.number(snapshot.cashOutlay, {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}
