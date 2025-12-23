import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Placement = "top" | "right" | "bottom" | "left";

type TooltipProps = {
  /** The element that triggers the tooltip */
  children: React.ReactElement<any>;
  /** Tooltip content */
  content: React.ReactNode;
  /** Preferred placement (it can auto-flip if it would overflow) */
  placement?: Placement;
  /** Distance between trigger and tooltip */
  offset?: number;
  /** Delay before showing (ms) */
  openDelay?: number;
  /** Delay before hiding (ms) */
  closeDelay?: number;
  /** Optional max width (Tailwind classes or CSS value) */
  maxWidthClassName?: string;
  /** Disable tooltip entirely */
  disabled?: boolean;
  /** Additional classes for the tooltip bubble */
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function opposite(p: Placement): Placement {
  switch (p) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "left":
      return "right";
    case "right":
      return "left";
  }
}

export function Tooltip({
  children,
  content,
  placement = "top",
  offset = 10,
  openDelay = 120,
  closeDelay = 80,
  maxWidthClassName = "max-w-[min(22rem,calc(100vw-2rem))]",
  disabled,
  className = "",
}: TooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [finalPlacement, setFinalPlacement] = useState<Placement>(placement);

  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const show = () => {
    if (disabled) return;
    clearTimers();
    openTimer.current = window.setTimeout(() => setOpen(true), openDelay);
  };

  const hide = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpen(false), closeDelay);
  };

  const computePosition = (preferred: Placement) => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;

    const t = trigger.getBoundingClientRect();
    const b = tip.getBoundingClientRect();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Candidate positions (centered)
    const candidates: Record<Placement, { x: number; y: number }> = {
      top: {
        x: t.left + t.width / 2 - b.width / 2,
        y: t.top - b.height - offset,
      },
      bottom: {
        x: t.left + t.width / 2 - b.width / 2,
        y: t.bottom + offset,
      },
      left: {
        x: t.left - b.width - offset,
        y: t.top + t.height / 2 - b.height / 2,
      },
      right: {
        x: t.right + offset,
        y: t.top + t.height / 2 - b.height / 2,
      },
    };

    const fits = (p: Placement) => {
      const c = candidates[p];
      return (
        c.x >= 8 &&
        c.y >= 8 &&
        c.x + b.width <= vw - 8 &&
        c.y + b.height <= vh - 8
      );
    };

    // Auto-flip if preferred doesn't fit
    let p: Placement = preferred;
    if (!fits(p) && fits(opposite(p))) p = opposite(p);

    // Clamp within viewport (still looks good even if it can't fully fit)
    const c = candidates[p];
    const x = clamp(c.x, 8, vw - b.width - 8);
    const y = clamp(c.y, 8, vh - b.height - 8);

    setFinalPlacement(p);
    setCoords({ x, y });
  };

  // Recompute when opened and on resize/scroll
  useLayoutEffect(() => {
    if (!open) return;
    computePosition(placement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, placement, content]);

  useEffect(() => {
    if (!open) return;

    const onReflow = () => computePosition(placement);
    window.addEventListener("resize", onReflow, { passive: true });
    window.addEventListener("scroll", onReflow, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, placement]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Arrow positioning classes
  const arrow = useMemo(() => {
    const base = "absolute h-2 w-2 rotate-45 bg-inherit border border-white/10";
    switch (finalPlacement) {
      case "top":
        return `${base} left-1/2 top-full -translate-x-1/2 -translate-y-1/2`;
      case "bottom":
        return `${base} left-1/2 bottom-full -translate-x-1/2 translate-y-1/2`;
      case "left":
        return `${base} top-1/2 left-full -translate-y-1/2 -translate-x-1/2`;
      case "right":
        return `${base} top-1/2 right-full -translate-y-1/2 translate-x-1/2`;
    }
  }, [finalPlacement]);

  // Enhance child with aria (avoid injecting `ref` via cloneElement since not all elements accept it)
  const child = React.Children.only(children) as React.ReactElement<any>;

  const existingDescribedBy = (child.props as any)?.["aria-describedby"] as
    | string
    | undefined;

  const mergedDescribedBy =
    !disabled && open
      ? [existingDescribedBy, id].filter(Boolean).join(" ")
      : existingDescribedBy;

  const childWithAria = React.cloneElement(child, {
    "aria-describedby": mergedDescribedBy || undefined,
  });

  return (
    <>
      <span
        ref={(node) => {
          triggerRef.current = node;
        }}
        onMouseEnter={() => {
          show();
        }}
        onMouseLeave={() => {
          hide();
        }}
        onFocus={() => {
          show();
        }}
        onBlur={() => {
          hide();
        }}
        className="inline-flex"
      >
        {childWithAria}
      </span>

      {/* Tooltip layer */}
      {!disabled && (
        <div
          ref={tipRef}
          id={id}
          role="tooltip"
          aria-hidden={!open}
          style={{
            position: "fixed",
            left: coords.x,
            top: coords.y,
            zIndex: 50,
            pointerEvents: "none",
          }}
          className={[
            "transition-all duration-200 ease-out",
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-1 scale-[0.98]",
            // subtle GPU friendliness
            "will-change-transform",
          ].join(" ")}
        >
          <div
            className={[
              // bubble
              "relative rounded-2xl px-3 py-2 text-sm leading-snug",
              // fancy look
              "bg-slate-950/90 text-slate-50 backdrop-blur-md",
              "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10",
              // slight gradient sheen
              "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
              "before:bg-[radial-gradient(120%_120%_at_20%_0%,rgba(255,255,255,0.16),transparent_55%)]",
              maxWidthClassName,
              className,
            ].join(" ")}
          >
            <span className="relative">{content}</span>
            <span className={arrow} />
          </div>
        </div>
      )}
    </>
  );
}
