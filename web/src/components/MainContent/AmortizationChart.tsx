"use client";

import Card from "@/components/Generic/Card";
import { getMortgageRates } from "@/lib/math";
import {
  calculateScenario,
  generateAmortizationSchedule,
  ProjectionData,
} from "@/lib/projection";
import { Banknote } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface AmortizationChartProps {
  data: ProjectionData;
  calculations: ReturnType<typeof calculateScenario>;
}

export default function AmortizationChart({
  data,
  calculations,
}: AmortizationChartProps) {
  const t = useTranslations("MainContent");

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

  // Group by year for chart display
  const yearlyData = useMemo(() => {
    const grouped: Record<
      number,
      { year: number; principal: number; interest: number }
    > = {};

    schedule.forEach((entry) => {
      if (!grouped[entry.year]) {
        grouped[entry.year] = { year: entry.year, principal: 0, interest: 0 };
      }
      grouped[entry.year].principal += entry.principal;
      grouped[entry.year].interest += entry.interest;
    });

    return Object.values(grouped);
  }, [schedule]);

  return (
    <Card tooltipContent={t("Amortization.tooltip")}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Banknote size={20} className="text-indigo-600" />
          {t("Amortization.title")}
        </h3>
      </div>

      {/* Amortization Balance Over Time Chart */}
      <div className="h-75 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={yearlyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              label={{
                value: t("Chart.year"),
                position: "insideBottomRight",
                offset: -5,
              }}
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <ChartTooltip
              content={({
                active,
                payload,
                label,
              }: {
                active?: boolean;
                payload?: readonly {
                  name: string;
                  value: number;
                  color: string;
                }[];
                label?: string | number;
              }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="bg-white rounded-lg shadow-lg p-3 border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-2">
                      {t("Chart.year")} {label}
                    </p>
                    {payload.map((entry, idx: number) => {
                      const format_ = new Intl.NumberFormat("en-EU", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      });
                      return (
                        <p
                          key={idx}
                          style={{ color: entry.color }}
                          className="text-sm"
                        >
                          <span className="font-medium">{entry.name}:</span>{" "}
                          {format_.format(entry.value)}
                        </p>
                      );
                    })}
                  </div>
                );
              }}
              contentStyle={{ backgroundColor: "transparent", border: "none" }}
            />
            <Bar
              dataKey="principal"
              stackId="a"
              fill="url(#colorPrincipal)"
              name={t("Amortization.principal")}
            />
            <Bar
              dataKey="interest"
              stackId="a"
              fill="url(#colorInterest)"
              name={t("Amortization.interest")}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
