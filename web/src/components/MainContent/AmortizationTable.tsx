"use client";

import Card from "@/components/Generic/Card";
import { getMortgageRates } from "@/lib/math";
import {
  AmortizationEntry,
  calculateScenario,
  generateAmortizationSchedule,
  ProjectionData,
} from "@/lib/projection";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";

interface AmortizationTableProps {
  data: ProjectionData;
  calculations: ReturnType<typeof calculateScenario>;
}

export default function AmortizationTable({
  data,
  calculations,
}: AmortizationTableProps) {
  const t = useTranslations("MainContent");
  const format = useFormatter();

  const rates = getMortgageRates(data.mortgage);
  const schedule = useMemo(
    () =>
      generateAmortizationSchedule(
        data,
        calculations.payments.monthly,
        rates.monthlyRate
      ),
    [data, calculations.payments.monthly, rates.monthlyRate]
  );

  // Show first 12 months + every 12th month thereafter for readability
  const displaySchedule = useMemo(() => {
    return schedule.filter((_, idx) => idx < 12 || (idx + 1) % 12 === 0);
  }, [schedule]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {t("Amortization.schedule")}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-slate-600 font-semibold">
                {t("Amortization.month")}
              </th>
              <th className="px-4 py-3 text-right text-slate-600 font-semibold">
                {t("Amortization.payment")}
              </th>
              <th className="px-4 py-3 text-right text-slate-600 font-semibold">
                {t("Amortization.principal")}
              </th>
              <th className="px-4 py-3 text-right text-slate-600 font-semibold">
                {t("Amortization.interest")}
              </th>
              <th className="px-4 py-3 text-right text-slate-600 font-semibold">
                {t("Amortization.balance")}
              </th>
            </tr>
          </thead>
          <tbody>
            {displaySchedule.map((entry: AmortizationEntry, idx: number) => (
              <tr
                key={idx}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-2 text-slate-700">
                  {entry.month} (
                  {t("Amortization.monthYearLabel", {
                    month: entry.month,
                    year: entry.year,
                  })}
                  )
                </td>
                <td className="px-4 py-2 text-right font-medium text-slate-700">
                  {format.number(entry.payment, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-2 text-right text-indigo-600 font-semibold">
                  {format.number(entry.principal, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-2 text-right text-rose-600 font-semibold">
                  {format.number(entry.interest, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-2 text-right text-slate-700">
                  {format.number(entry.balance, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
