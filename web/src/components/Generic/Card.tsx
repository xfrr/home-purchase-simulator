import { Info } from "lucide-react";
import { Tooltip } from "./Tooltip";

const Card = ({
  title,
  tooltipContent,
  children,
  className = "",
  headerRight,
}: {
  title?: React.ReactNode;
  tooltipContent?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}
  >
    {(title || headerRight) && (
      <div className="flex items-start justify-between gap-4">
        {title && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0">{title}</div>

            {tooltipContent && (
              <Tooltip content={tooltipContent ?? <span>Más información</span>}>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  aria-label="Más información"
                >
                  <Info size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        )}

        {headerRight && <div className="shrink-0">{headerRight}</div>}
      </div>
    )}

    {children}
  </div>
);

export default Card;
