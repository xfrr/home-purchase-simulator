"use client";

import AmortizationChart from "@/components/MainContent/AmortizationChart";
import AmortizationTable from "@/components/MainContent/AmortizationTable";
import CostAnalysis from "@/components/MainContent/CostAnalysis";
import HeroMetrics from "@/components/MainContent/HeroMetrics";
import NetWorthChart from "@/components/MainContent/NetWorthChart";
import PledgeAlert from "@/components/MainContent/PledgeAlert";
import StrategyComparison from "@/components/MainContent/StrategyComparison";
import { calculateScenario, ProjectionData } from "@/lib/projection";
import { useMemo } from "react";

interface MainContentProps {
  data: ProjectionData;
}

/**
 * Main dashboard content component
 * Orchestrates all financial metrics, charts, and analysis components
 */
export default function MainContent({ data }: MainContentProps) {
  // Scenario calculations memoized at top level
  const calculations = useMemo(() => calculateScenario(data), [data]);

  return (
    <main className="flex-1 p-6 md:px-0 overflow-y-auto bg-slate-50/50">
      <div className="max-w-5xl mx-auto">
        {/* Dashboard Content */}
        <div className="space-y-6 pb-20">
          {/* Hero Metrics: Monthly payment, Safety net, DTI */}
          <HeroMetrics data={data} calculations={calculations} />

          {/* Pledge Loan Status Alert (if applicable) */}
          <PledgeAlert data={data} calculations={calculations} />

          {/* Net Worth Projection Chart with mode toggle */}
          <NetWorthChart data={data} calculations={calculations} />

          {/* Deep Dive Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Analysis: Interest, Cash Outlay */}
            <CostAnalysis data={data} calculations={calculations} />

            {/* Strategy Comparison: Mortgage vs Investment, Pledge vs Tax */}
            <StrategyComparison data={data} calculations={calculations} />
          </div>

          {/* Mortgage Amortization (if mortgage exists) */}
          {data.mortgage.amount > 0 && (
            <>
              {/* Amortization Chart */}
              <AmortizationChart data={data} calculations={calculations} />

              {/* Amortization Schedule Table */}
              <AmortizationTable data={data} calculations={calculations} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
