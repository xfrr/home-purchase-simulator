"use client";

import Card from "@/components/Generic/Card";
import { calculateScenario, ProjectionData } from "@/lib/projection";
import { TrendingUp } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface NetWorthChartProps {
  data: ProjectionData;
  calculations: ReturnType<typeof calculateScenario>;
}

const colors = {
  netWorth: "#4f46e5",
  property: "#cbd5e1",
  homeEquity: "#10b981",
  investment: "#8b5cf6",
  debts: "#ef4444",
};

export default function NetWorthChart({
  data,
  calculations,
}: NetWorthChartProps) {
  const t = useTranslations("MainContent");
  const format = useFormatter();
  const [chartMode, setChartMode] = useState<"netWorth" | "components">(
    "netWorth"
  );

  return (
    <Card tooltipContent={t("Chart.tooltip")}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600" />
          {t("Chart.title")}
        </h3>
        {/* Toggle between Net Worth and Components */}
        <div className="flex justify-center">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setChartMode("netWorth")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                chartMode === "netWorth"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t("Chart.netWorth")}
            </button>
            <button
              onClick={() => setChartMode("components")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                chartMode === "components"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t("Chart.components")}
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex items-center gap-3 text-sm">
          {chartMode === "netWorth" ? (
            <>
              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.netWorth }}
                ></span>
                <span className="text-slate-600">{t("Chart.netWorth")}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.property }}
                ></span>
                <span className="text-slate-600">
                  {t("Chart.propertyValue")}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.homeEquity }}
                ></span>
                <span className="text-slate-600">{t("Chart.homeEquity")}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.investment }}
                ></span>
                <span className="text-slate-600">{t("Chart.investment")}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.debts }}
                ></span>
                <span className="text-slate-600">{t("Chart.debts")}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="h-75 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "netWorth" ? (
            <NetWorthView calculations={calculations} format={format} t={t} />
          ) : (
            <ComponentsView
              data={data}
              calculations={calculations}
              format={format}
              t={t}
            />
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function NetWorthView({
  calculations,
  format,
  t,
}: {
  calculations: ReturnType<typeof calculateScenario>;
  format: ReturnType<typeof useFormatter>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <AreaChart
      data={calculations.projections}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.netWorth} stopOpacity={0.1} />
          <stop offset="95%" stopColor={colors.netWorth} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis
        dataKey="year"
        axisLine={false}
        tickLine={false}
        tick={{ fill: "#94a3b8", fontSize: 12 }}
        tickFormatter={(val) => `Y${val}`}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: "#94a3b8", fontSize: 12 }}
        tickFormatter={(val) => `€${val / 1000}k`}
      />
      <ChartTooltip
        content={({
          active,
          payload,
          label,
        }: {
          active?: boolean;
          payload?: readonly { name: string; value: number; color: string }[];
          label?: string | number;
        }) => {
          if (!active || !payload || payload.length === 0) return null;
          return (
            <div className="bg-white rounded-lg shadow-lg p-3 border border-slate-200">
              <p className="font-semibold text-slate-800 mb-2">
                {t("Chart.year")} {label}
              </p>
              {payload.map((entry, idx: number) => (
                <p key={idx} style={{ color: entry.color }} className="text-sm">
                  <span className="font-medium">{entry.name}:</span>{" "}
                  {format.number(entry.value, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </p>
              ))}
            </div>
          );
        }}
        contentStyle={{ backgroundColor: "transparent", border: "none" }}
      />
      <Area
        type="monotone"
        dataKey="propertyValue"
        stroke={colors.property}
        fill="transparent"
        strokeDasharray="5 5"
        strokeWidth={2}
        name={t("Chart.propertyValue")}
      />
      <Area
        type="monotone"
        dataKey="netWorth"
        stroke={colors.netWorth}
        fillOpacity={1}
        fill="url(#colorNw)"
        strokeWidth={3}
        name={t("Chart.netWorth")}
      />
    </AreaChart>
  );
}

function ComponentsView({
  data,
  calculations,
  format,
  t,
}: {
  data: ProjectionData;
  calculations: ReturnType<typeof calculateScenario>;
  format: ReturnType<typeof useFormatter>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <AreaChart
      data={calculations.projections.map((p) => ({
        year: p.year,
        homeEquity: Math.max(
          0,
          p.propertyValue - p.balance - data.pledge.amount
        ),
        investment: p.investmentValue,
        debts: -(p.balance + data.pledge.amount),
      }))}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id="colorHomeEquity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.homeEquity} stopOpacity={0.8} />
          <stop offset="95%" stopColor={colors.homeEquity} stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.investment} stopOpacity={0.8} />
          <stop offset="95%" stopColor={colors.investment} stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id="colorDebts" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.debts} stopOpacity={0.8} />
          <stop offset="95%" stopColor={colors.debts} stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis
        dataKey="year"
        axisLine={false}
        tickLine={false}
        tick={{ fill: "#94a3b8", fontSize: 12 }}
        tickFormatter={(val) => `Y${val}`}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: "#94a3b8", fontSize: 12 }}
        tickFormatter={(val) => `€${val / 1000}k`}
      />
      <ChartTooltip
        content={({
          active,
          payload,
          label,
        }: {
          active?: boolean;
          payload?: readonly {
            dataKey: string;
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
                let displayName = entry.dataKey;
                if (entry.dataKey === "homeEquity")
                  displayName = t("Chart.homeEquity");
                else if (entry.dataKey === "investment")
                  displayName = t("Chart.investment");
                else if (entry.dataKey === "debts")
                  displayName = t("Chart.debts");
                return (
                  <p
                    key={idx}
                    style={{ color: entry.color }}
                    className="text-sm"
                  >
                    <span className="font-medium">{displayName}:</span>{" "}
                    {format.number(Math.abs(entry.value), {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                );
              })}
            </div>
          );
        }}
        contentStyle={{ backgroundColor: "transparent", border: "none" }}
      />
      <Area
        type="monotone"
        dataKey="homeEquity"
        stackId="1"
        stroke={colors.homeEquity}
        fill="url(#colorHomeEquity)"
        strokeWidth={2}
        name={t("Chart.homeEquity")}
      />
      <Area
        type="monotone"
        dataKey="investment"
        stackId="1"
        stroke={colors.investment}
        fill="url(#colorInvestment)"
        strokeWidth={2}
        name={t("Chart.investment")}
      />
      <Area
        type="monotone"
        dataKey="debts"
        stroke={colors.debts}
        fill="url(#colorDebts)"
        strokeWidth={2}
        name={t("Chart.debts")}
      />
    </AreaChart>
  );
}
