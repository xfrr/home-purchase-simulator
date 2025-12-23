"use client";

import Sidebar from "@/components/Layout/Sidebar";
import { ProjectionData } from "@/lib/projection";
import {
  decodeQueryToState,
  encodeStateToQuery,
  getShareableUrl,
} from "@/lib/urlState";
import { PanelLeftClose, PanelLeftOpen, Share2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MainContent from "../../components/MainContent/MainContent";
import { useTranslations } from "next-intl";
import useWindowSize from "@/lib/windowSize";

// Initial app state
const INITIAL_STATE: ProjectionData = {
  property: {
    price: 350000,
    closingCosts: 10,
    growth: 0,
    maintenance: 800,
    taxes: 600,
  },
  mortgage: {
    amount: 200000,
    term: 30,
    type: "fixed",
    fixedRate: 2.5,
    varCurrent: 3.8,
    varExpected: 2.5,
  },
  investing: {
    return: 7.0,
    inflation: 2.5,
    investUpfront: true,
  },
  profile: {
    netIncome: 2500,
    age: 30,
    otherDebtsMonthly: 0,
  },
  pledge: {
    amount: 0,
    ltv: 50,
  },
};

export default function MainPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shareTooltip, setShareTooltip] = useState(false);

  // open by default on desktop
  const { width: windowWidth } = useWindowSize();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return windowWidth >= 768;
  });

  // Initialize state from URL or defaults
  const [scenario, setScenario] = useState<ProjectionData>(() => {
    const query = searchParams.toString();
    return decodeQueryToState(query, INITIAL_STATE);
  });

  // Update URL when scenario changes
  useEffect(() => {
    const query = encodeStateToQuery(scenario);
    router.replace(`?${query}`);
  }, [scenario, router]);

  const handlePropertyChange = useCallback(
    (
      category: keyof ProjectionData,
      field: string,
      value: number | string | boolean
    ) => {
      setScenario((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    },
    []
  );

  const handleShare = () => {
    const url = getShareableUrl(scenario);
    navigator.clipboard.writeText(url);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Overlay (slides over content) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden w-105
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          data={scenario}
          onPropertyChange={handlePropertyChange}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Desktop Sidebar (pushes content, sticky to screen) */}
      <div
        className={`hidden md:block relative z-30 h-screen overflow-hidden
          transition-[width] duration-300 ease-in-out
          ${sidebarOpen ? "md:w-90" : "md:w-0"}
        `}
      >
        <Sidebar
          data={scenario}
          onPropertyChange={handlePropertyChange}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content - scrollable area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header with Hamburger - visible on all devices */}
        <div className="shrink-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </button>
          <div className="flex flex-col w-full gap-4 sm:flex-row sm:items-center justify-between">
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-lg font-bold text-slate-800">
                {t("app.name")}
              </h1>
              <p className="text-slate-500 text-sm hidden sm:inline">
                {t("app.description")}
              </p>
            </div>
          </div>
          <div className="flex sm:justify-end">
            <button
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 sm:w-auto"
              title={t("Share.label")}
              aria-label={t("Share.label")}
            >
              <Share2 size={16} />
              <span className="whitespace-nowrap hidden sm:inline">
                {shareTooltip ? t("Share.copied") : t("Share.label")}
              </span>
            </button>
          </div>
        </div>

        {/* Content - scrollable container */}
        <div className="flex-1 overflow-y-auto">
          <MainContent data={scenario} />
        </div>
      </div>
    </div>
  );
}
