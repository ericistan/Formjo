const STYLES = {
  card: {
    base: "text-xs font-medium px-2 py-1 rounded flex items-center gap-1",
    completed: "bg-green-500/20 text-green-600",
    pending: "bg-yellow-500/10 text-yellow-600",
    completedLabel: "✓ Completed",
    pendingLabel: "◷ In Progress",
  },
  pill: {
    base: "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
    completed: "bg-green-500/20 text-green-600",
    pending: "bg-yellow-500/20 text-yellow-600",
    completedLabel: "Completed",
    pendingLabel: "In Progress",
  },
  row: {
    base: "text-xs font-medium px-2 py-0.5 rounded-full",
    completed: "bg-green-500/20 text-green-600",
    pending: "bg-yellow-500/20 text-yellow-600",
    completedLabel: "Completed",
    pendingLabel: "Pending",
  },
  hero: {
    base: "text-xs font-medium px-2.5 py-1 rounded-full shrink-0",
    completed: "bg-green-500/30 text-green-200",
    pending: "bg-yellow-500/20 text-yellow-200",
    completedLabel: "✓ Completed",
    pendingLabel: "◷ In Progress",
  },
};

const StatusBadge = ({ status, variant = "card", className = "" }) => {
  const isCompleted = status === "completed";
  const s = STYLES[variant];
  return (
    <span className={`${s.base} ${isCompleted ? s.completed : s.pending} ${className}`.trim()}>
      {isCompleted ? s.completedLabel : s.pendingLabel}
    </span>
  );
};

export default StatusBadge;
