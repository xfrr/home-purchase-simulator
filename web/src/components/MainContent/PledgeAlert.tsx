"use client";

import { calculateScenario, ProjectionData } from "@/lib/projection";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

interface PledgeAlertProps {
  data: ProjectionData;
  calculations: ReturnType<typeof calculateScenario>;
}

export default function PledgeAlert({ data, calculations }: PledgeAlertProps) {
  const t = useTranslations("MainContent");

  if (data.pledge.amount <= 0) return null;

  return (
    <div
      className={`rounded-xl p-4 border ${
        calculations.risk.isPledgeRisk
          ? "bg-rose-50 border-rose-200"
          : "bg-indigo-50 border-indigo-200"
      } flex items-start gap-3`}
    >
      <AlertTriangle
        className={
          calculations.risk.isPledgeRisk
            ? "text-rose-600 mt-0.5"
            : "text-indigo-600 mt-0.5"
        }
      />
      <div>
        <h4
          className={`font-bold text-sm ${
            calculations.risk.isPledgeRisk ? "text-rose-700" : "text-indigo-700"
          }`}
        >
          {t("Pledge.statusTitle")}{" "}
          {calculations.risk.isPledgeRisk
            ? t("Pledge.risk")
            : t("Pledge.healthy")}
        </h4>
        <p
          className={`text-xs mt-1 ${
            calculations.risk.isPledgeRisk ? "text-rose-600" : "text-indigo-600"
          }`}
        >
          {t("Pledge.description", {
            current: calculations.risk.currentLTV.toFixed(1),
            limit: data.pledge.ltv,
          })}{" "}
          {calculations.risk.isPledgeRisk && t("Pledge.warning")}
        </p>
      </div>
    </div>
  );
}
