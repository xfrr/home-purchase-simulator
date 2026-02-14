"use client";

import { ProjectionData } from "@/lib/projection";
import {
  AlertTriangle,
  Briefcase,
  Euro,
  Home,
  Landmark,
  PanelLeftClose,
  Percent,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl"; // <--- Import hook
import { useState } from "react";
import { InputGroup, Section, SegmentControl, Toggle } from "./SidebarInputs";

interface SidebarProps {
  data: ProjectionData;
  onPropertyChange: (
    category: keyof ProjectionData,
    field: string,
    value: number | string | boolean,
  ) => void;
  onClose?: () => void;
}

type SectionKeys = "property" | "mortgage" | "investing" | "pledge" | "profile";

export default function Sidebar({
  data,
  onPropertyChange,
  onClose,
}: SidebarProps) {
  const t = useTranslations("Sidebar");

  // Accordion visibility
  const [sections, setSections] = useState<Record<SectionKeys, boolean>>({
    profile: true,
    property: true,
    mortgage: true,
    investing: false,
    pledge: false,
  });

  const toggleSection = (key: SectionKeys) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (
    category: keyof ProjectionData,
    field: string,
    value: string | boolean,
    type: "number" | "string" | "boolean" = "number",
  ) => {
    let finalValue: number | string | boolean = value;

    if (type === "number") {
      finalValue = value === "" ? 0 : parseFloat(value as string);
    }

    onPropertyChange(category, field, finalValue);
  };

  return (
    <aside className="w-full md:w-90 h-screen bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t("title")}</h2>
          <p className="text-xs text-slate-400">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
            <Settings size={18} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors md:hidden"
              aria-label="Toggle menu"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        {/* --- Profile --- */}
        <Section
          title={t("profile.title")}
          icon={User}
          isOpen={sections.profile}
          onToggle={() => toggleSection("profile")}
        >
          <InputGroup
            label={t("profile.netIncome")}
            prefix={<Euro size={14} />}
            placeholder="2,500"
            value={data.profile.netIncome}
            onChange={(val) => handleChange("profile", "netIncome", val)}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputGroup
              label={t("profile.age")}
              placeholder="30"
              value={data.profile.age}
              onChange={(val) => handleChange("profile", "age", val)}
            />
            <InputGroup
              label={t("profile.otherDebtsMonthly")}
              prefix={<Euro size={14} />}
              placeholder="0"
              value={data.profile.otherDebtsMonthly}
              onChange={(val) =>
                handleChange("profile", "otherDebtsMonthly", val)
              }
            />
          </div>
        </Section>

        {/* --- Property --- */}
        <Section
          title={t("property.title")}
          icon={Home}
          isOpen={sections.property}
          onToggle={() => toggleSection("property")}
        >
          <InputGroup
            label={t("property.price")}
            prefix={<Euro size={14} />}
            placeholder="350,000"
            value={data.property.price}
            onChange={(val) => handleChange("property", "price", val)}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputGroup
              label={t("property.closingCosts")}
              suffix={<Percent size={14} />}
              placeholder="10"
              value={data.property.closingCosts}
              onChange={(val) => handleChange("property", "closingCosts", val)}
            />
            <InputGroup
              label={t("property.growth")}
              suffix={<Percent size={14} />}
              placeholder="0"
              subLabel={t("property.optional")}
              value={data.property.growth}
              onChange={(val) => handleChange("property", "growth", val)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputGroup
              label={t("property.maintenance")}
              subLabel={t("property.perYear")}
              prefix={<Euro size={14} />}
              placeholder="1,200"
              value={data.property.maintenance}
              onChange={(val) => handleChange("property", "maintenance", val)}
            />
            <InputGroup
              label={t("property.taxes")}
              subLabel={t("property.perYear")}
              prefix={<Euro size={14} />}
              placeholder="450"
              value={data.property.taxes}
              onChange={(val) => handleChange("property", "taxes", val)}
            />
          </div>
        </Section>

        {/* --- Mortgage --- */}
        <Section
          title={t("mortgage.title")}
          icon={Landmark}
          isOpen={sections.mortgage}
          onToggle={() => toggleSection("mortgage")}
        >
          <InputGroup
            label={t("mortgage.amount")}
            prefix={<Euro size={14} />}
            placeholder="280,000"
            value={data.mortgage.amount}
            onChange={(val) => handleChange("mortgage", "amount", val)}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputGroup
              label={t("mortgage.term")}
              suffix={t("mortgage.yearsShort")}
              placeholder="30"
              value={data.mortgage.term}
              onChange={(val) => handleChange("mortgage", "term", val)}
            />
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                {t("mortgage.type")}
              </label>
              <SegmentControl
                active={data.mortgage.type}
                onChange={(val) =>
                  handleChange("mortgage", "type", val, "string")
                }
                options={[
                  { label: t("mortgage.fixed"), value: "fixed" },
                  { label: t("mortgage.variable"), value: "variable" },
                ]}
              />
            </div>
          </div>

          {data.mortgage.type === "fixed" ? (
            <InputGroup
              label={t("mortgage.rate")}
              suffix={<Percent size={14} />}
              placeholder="3.5"
              value={data.mortgage.fixedRate}
              onChange={(val) => handleChange("mortgage", "fixedRate", val)}
            />
          ) : (
            <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <InputGroup
                label={t("mortgage.euribor")}
                suffix={<Percent size={14} />}
                placeholder="3.8"
                value={data.mortgage.varCurrent}
                onChange={(val) => handleChange("mortgage", "varCurrent", val)}
              />
              <InputGroup
                label={t("mortgage.spread")}
                suffix={<Percent size={14} />}
                placeholder="2.5"
                subLabel={t("mortgage.longTerm")}
                value={data.mortgage.varExpected}
                onChange={(val) => handleChange("mortgage", "varExpected", val)}
              />
            </div>
          )}
        </Section>

        {/* --- Investing --- */}
        <Section
          title={t("investing.title")}
          icon={TrendingUp}
          isOpen={sections.investing}
          onToggle={() => toggleSection("investing")}
        >
          <div className="grid grid-cols-2 gap-3">
            <InputGroup
              label={t("investing.nominalReturn")}
              suffix={<Percent size={14} />}
              placeholder="7.0"
              value={data.investing.return}
              onChange={(val) => handleChange("investing", "return", val)}
            />
            <InputGroup
              label={t("investing.inflation")}
              suffix={<Percent size={14} />}
              placeholder="2.5"
              value={data.investing.inflation}
              onChange={(val) => handleChange("investing", "inflation", val)}
            />
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
            <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
              {t("investing.strategy")}
            </label>
            <Toggle
              label={t("investing.investUpfront")}
              enabled={data.investing.investUpfront}
              onChange={(val) =>
                handleChange("investing", "investUpfront", val, "boolean")
              }
            />
            <div className="text-xs text-slate-400">
              {t("investing.investUpfrontDescription")}
            </div>
          </div>
        </Section>

        {/* --- Pledge --- */}
        <Section
          title={t("pledge.title")}
          icon={Briefcase}
          isOpen={sections.pledge}
          onToggle={() => toggleSection("pledge")}
        >
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mb-3">
            <div className="flex gap-2 text-amber-700 items-start">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-tight">{t("pledge.warning")}</p>
            </div>
          </div>
          <InputGroup
            label={t("pledge.amount")}
            prefix={<Euro size={14} />}
            placeholder="50,000"
            value={data.pledge.amount}
            onChange={(val) => handleChange("pledge", "amount", val)}
          />
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">
                {t("pledge.ltvLimit")}
              </span>
              <span className="text-indigo-600 font-bold">
                {data.pledge.ltv}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={data.pledge.ltv}
              onChange={(e) => handleChange("pledge", "ltv", e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </Section>

        <div className="h-20" />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 z-20"></div>
    </aside>
  );
}
