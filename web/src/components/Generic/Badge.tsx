const Badge = ({
  children,
  type = "neutral",
}: {
  children: React.ReactNode;
  type?: "success" | "warning" | "danger" | "neutral";
}) => {
  const styles = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border border-amber-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-100",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[type]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
