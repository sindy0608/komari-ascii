import { formatBytes } from "@/utils";

interface Stat {
  label: string;
  value: string | number;
  color?: string;
}

interface HeaderStatsProps {
  totalServers: number;
  onlineServers: number;
  offlineServers: number;
  upTotal: number;
  downTotal: number;
}

export function HeaderStats({
  totalServers,
  onlineServers,
  offlineServers,
  upTotal,
  downTotal,
}: HeaderStatsProps) {
  const stats: Stat[] = [
    { label: "Total Servers", value: totalServers },
    {
      label: "Online",
      value: onlineServers,
      color: "text-[var(--ascii-success)]",
    },
    {
      label: "Offline",
      value: offlineServers,
      color: "text-[var(--ascii-destructive)]",
    },
    {
      label: "Network Traffic",
      value: `↑ ${formatBytes(upTotal)} ↓ ${formatBytes(downTotal)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 mb-2 sm:mb-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="border border-[var(--ascii-border)] bg-[var(--ascii-card)]/50 p-1 sm:p-2 rounded"
        >
          <div className="text-[10px] text-[var(--ascii-muted)]">
            {stat.label}
          </div>
          <div
            className={`text-sm sm:text-base ${
              stat.color || "text-[var(--ascii-foreground)]"
            } ${stat.label === "Network Traffic" ? "sm:text-sm lg:text-base" : ""}`}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
