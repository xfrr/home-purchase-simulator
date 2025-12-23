import React, { ReactNode } from "react";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";

interface SectionProps {
  title: string;
  icon: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

interface InputGroupProps {
  label: string;
  suffix?: ReactNode;
  prefix?: ReactNode;
  type?: string;
  placeholder?: string;
  subLabel?: string;
  value?: number | string;
  onChange: (value: string) => void;
}

interface ToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

interface SegmentOption {
  label: string;
  value: string;
}

interface SegmentControlProps {
  options: SegmentOption[];
  active: string;
  onChange: (value: string) => void;
}

export const Section: React.FC<SectionProps> = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
}) => (
  <div className="border-b border-slate-100 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-200 group"
    >
      <div className="flex items-center gap-3 text-slate-700 font-medium">
        <div
          className={`p-2 rounded-lg transition-colors ${
            isOpen
              ? "bg-indigo-50 text-indigo-600"
              : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
          }`}
        >
          <Icon size={18} />
        </div>
        <span>{title}</span>
      </div>
      {isOpen ? (
        <ChevronUp size={16} className="text-slate-400" />
      ) : (
        <ChevronDown size={16} className="text-slate-400" />
      )}
    </button>

    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-200 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="p-4 pt-0 space-y-4">{children}</div>
    </div>
  </div>
);

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  suffix,
  prefix,
  type = "number",
  placeholder,
  subLabel,
  value,
  onChange,
}) => (
  <div className="space-y-1">
    <div className="flex justify-between items-baseline">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {subLabel && (
        <span className="text-[10px] text-slate-400 italic">{subLabel}</span>
      )}
    </div>
    <div className="relative flex items-center group">
      {prefix && (
        <span className="absolute left-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value === undefined || value === null ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-2.5 outline-none transition-all ${
          prefix ? "pl-9" : ""
        } ${suffix ? "pr-9" : ""}`}
        placeholder={placeholder}
      />
      {suffix && (
        <span className="absolute right-3 text-slate-400">{suffix}</span>
      )}
    </div>
  </div>
);

export const Toggle: React.FC<ToggleProps> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-slate-600 font-medium">{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        enabled ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`${
          enabled ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  </div>
);

export const SegmentControl: React.FC<SegmentControlProps> = ({
  options,
  active,
  onChange,
}) => (
  <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
          active === opt.value
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);
