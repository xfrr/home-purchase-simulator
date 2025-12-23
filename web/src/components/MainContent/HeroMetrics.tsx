"use client";

import Badge from "@/components/Generic/Badge";
import Card from "@/components/Generic/Card";
import { Tooltip } from "@/components/Generic/Tooltip";
import { calculateScenario, ProjectionData } from "@/lib/projection";
import { Info, Wallet } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

interface HeroMetricsProps {
  data: ProjectionData;
  calculations: ReturnType<typeof calculateScenario>;
}

export default function HeroMetrics({ data, calculations }: HeroMetricsProps) {
  const t = useTranslations("MainContent");
  const format = useFormatter();

  const monthlyIncome = data.profile?.netIncome ?? 0;
  const dtiRatio =
    monthlyIncome > 0
      ? calculations.payments.totalMonthlyOutflow / monthlyIncome
      : 0;
  const runwayMonths =
    calculations.payments.totalMonthlyOutflow > 0
      ? monthlyIncome / calculations.payments.totalMonthlyOutflow
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Monthly Payment Hero */}
      <Card
        className="md:col-span-2 relative overflow-hidden group"
        title={
          <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider flex items-center gap-2">
            {t("Hero.monthlyCommitment")}
            {data.mortgage.type === "variable" && (
              <Badge type="warning">{t("Hero.variable")}</Badge>
            )}
          </h3>
        }
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet size={120} />
        </div>
        <div className="flex flex-col h-full justify-between relative z-10">
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900">
              {format.number(calculations.payments.monthly, {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="text-slate-400 font-medium">
              / {t("Hero.monthShort")}
            </span>
          </div>

          <div className="flex flex-row mt-2 pt-2 pb-2 border-t border-slate-100 gap-6 text-sm">
            {/* Expenses Maintenance + IBI + Insurance */}
            <div className="flex-1">
              <span className="block text-slate-400 text-xs mb-1">
                {t("Hero.totalMonthlyPropertyExpenses")}
              </span>
              <span className="font-semibold text-slate-700">
                {format.number(
                  calculations.payments.totalMonthlyPropertyExpenses,
                  {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }
                )}
              </span>
            </div>

            {/* Total Outflow */}
            <div>
              <span className="block text-slate-400 text-xs mb-1">
                {t("Hero.totalOutflow")}
              </span>
              <span className="font-semibold text-slate-700">
                {format.number(calculations.payments.totalMonthlyOutflow, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>

            {data.mortgage.type === "variable" && (
              <div>
                <span className="block text-slate-400 text-xs mb-1">
                  <Tooltip content={t("Hero.tooltips.stressTest")}>
                    <Info size={12} className="inline-block mr-1" />
                  </Tooltip>
                  {t("Hero.stressTest")}
                </span>
                <span className="font-semibold text-rose-600">
                  {format.number(calculations.payments.stress, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Safety / Runway */}
      <Card
        className="flex flex-col justify-between"
        tooltipContent={t("Safety.tooltip")}
        headerRight={
          <ShieldAlert
            className={
              dtiRatio < 0.35
                ? "text-emerald-500"
                : dtiRatio > 0.35 && dtiRatio <= 0.4
                ? "text-amber-500"
                : "text-rose-600"
            }
            size={20}
          />
        }
        title={
          <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">
            {t("Safety.title")}
          </h3>
        }
      >
        <div className="space-y-4 mt-4">
          {/* Income Display (from Profile) */}
          <div className="flex justify-between items-center text-sm">
            <label className="text-slate-500">{t("Safety.netIncome")}</label>
            <div className="flex items-center">
              <span className="font-semibold text-slate-700">
                {format.number(monthlyIncome, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>

          {/* DTI Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{t("Safety.dti")}</span>
              <span
                className={`font-bold ${
                  dtiRatio < 0.35
                    ? "text-slate-700"
                    : dtiRatio > 0.35 && dtiRatio <= 0.4
                    ? "text-amber-500"
                    : "text-rose-600"
                }`}
              >
                {Math.round(dtiRatio * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  dtiRatio < 0.35
                    ? "bg-emerald-500"
                    : dtiRatio > 0.35 && dtiRatio <= 0.4
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{
                  width: `${Math.min(dtiRatio * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Runway Logic */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={14} />
            <span>
              {t("Safety.runway")}{" "}
              <strong className="text-slate-700">
                {Math.round(runwayMonths * 10) / 10} {t("Safety.months")}
              </strong>{" "}
              {t("Safety.buffer")}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { Clock, ShieldAlert } from "lucide-react";
