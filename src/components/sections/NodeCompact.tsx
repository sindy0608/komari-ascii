import {
  formatBytes,
  formatUptime,
  getOSImage,
  getUsageColor,
  getExpiryColor,
} from "@/utils";
import type { NodeData } from "@/types/node";
import { Link } from "react-router-dom";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { useLocale } from "@/config/hooks";
import { cn } from "@/utils";

interface NodeCompactContainerProps {
  nodes: NodeData[];
}

export const NodeCompactContainer = ({ nodes }: NodeCompactContainerProps) => {
  return (
    <div className="theme-card-style overflow-hidden">
      <NodeCompactHeader />
      <div className="flex flex-col">
        {nodes.map((node) => (
          <NodeCompact key={node.uuid} node={node} />
        ))}
      </div>
    </div>
  );
};

interface NodeCompactProps {
  node: NodeData;
}

// 用固定列轨 grid 保证所有行的同一列严格垂直对齐 —— 这是“账册式”列表的核心。
export const NodeCompact = ({ node }: NodeCompactProps) => {
  const {
    stats,
    isOnline,
    tagList,
    cpuUsage,
    memUsage,
    diskUsage,
    expired_at,
    daysLeft,
  } = useNodeCommons(node);
  const { t } = useLocale();
  const na = t("node.notAvailable");
  const muted = "text-secondary-foreground";

  return (
    <div
      className={cn(
        "node-row border-b border-[color-mix(in_srgb,var(--serif-accent)_30%,transparent)] last:border-b-0 transition-colors duration-200 hover:bg-[var(--serif-card-bg-hover)]",
        !isOnline && "striped-bg-red-translucent-diagonal"
      )}>
      <div className="grid items-center gap-x-4 px-4 py-2.5 [grid-template-columns:minmax(11rem,1.6fr)_2.5rem_2.5rem_2.5rem_minmax(6.5rem,1fr)_minmax(7rem,1.1fr)_minmax(7.5rem,1fr)]">
        {/* 1. 名称 + 标签（纵向两行，紧凑） */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "size-1.5 rounded-full flex-shrink-0 self-center",
              isOnline ? "bg-[var(--serif-accent)]" : "bg-[var(--destructive)]"
            )}
            title={isOnline ? t("node.online") : t("node.offline")}
          />
          <Flag flag={node.region} size="4" />
          <img
            src={getOSImage(node.os)}
            alt={node.os}
            className="size-4 object-contain flex-shrink-0 self-center"
            loading="lazy"
          />
          <div className="flex flex-col min-w-0 leading-tight">
            <Link
              to={`/instance/${node.uuid}`}
              className="serif-display text-[0.95rem] truncate hover:text-[var(--serif-accent)] transition-colors"
              title={node.name}>
              {node.name}
            </Link>
            {tagList.length > 0 && (
              <div className="overflow-hidden">
                <Tag className="w-auto" tags={tagList} />
              </div>
            )}
          </div>
        </div>

        {/* 2. CPU */}
        <span
          className="tabular text-sm text-center font-medium"
          style={{ color: isOnline ? getUsageColor(cpuUsage) : undefined }}
          >
          {isOnline ? `${cpuUsage.toFixed(0)}%` : <span className={muted}>{na}</span>}
        </span>

        {/* 3. 内存 */}
        <span
          className="tabular text-sm text-center font-medium"
          style={{ color: isOnline ? getUsageColor(memUsage) : undefined }}
          >
          {isOnline ? `${memUsage.toFixed(0)}%` : <span className={muted}>{na}</span>}
        </span>

        {/* 4. 磁盘 */}
        <span
          className="tabular text-sm text-center font-medium"
          style={{ color: isOnline ? getUsageColor(diskUsage) : undefined }}
          >
          {isOnline ? `${diskUsage.toFixed(0)}%` : <span className={muted}>{na}</span>}
        </span>

        {/* 5. 网络 */}
        <div className="flex items-center justify-center gap-2 min-w-0">
          <span className="flex items-center gap-1">
            <span className="small-caps text-[var(--secondary-foreground)]">
              {t("node.uploadPrefix")}
            </span>
            <span
              className={cn(
                "tabular text-xs",
                isOnline ? "text-foreground" : muted
              )}>
              {stats && isOnline ? formatBytes(stats.net_out, true) : na}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="small-caps text-[var(--secondary-foreground)]">
              {t("node.downloadPrefix")}
            </span>
            <span
              className={cn(
                "tabular text-xs",
                isOnline ? "text-foreground" : muted
              )}>
              {stats && isOnline ? formatBytes(stats.net_in, true) : na}
            </span>
          </span>
        </div>

        {/* 6. 累计流量（上行 / 下行总流量，横向并排） */}
        <div className="flex items-center justify-center gap-3 min-w-0">
          <span className="flex items-center gap-1">
            <span className="small-caps text-[var(--secondary-foreground)]">
              {t("node.uploadPrefix")}
            </span>
            <span
              className={cn(
                "tabular text-xs",
                isOnline ? "text-foreground" : muted
              )}>
              {stats && isOnline ? formatBytes(stats.net_total_up) : na}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="small-caps text-[var(--secondary-foreground)]">
              {t("node.downloadPrefix")}
            </span>
            <span
              className={cn(
                "tabular text-xs",
                isOnline ? "text-foreground" : muted
              )}>
              {stats && isOnline ? formatBytes(stats.net_total_down) : na}
            </span>
          </span>
        </div>

        {/* 7. 到期 / 运行 */}
        <div className="flex items-center justify-center gap-2 min-w-0">
          <span className="flex flex-col items-center leading-tight">
            <span className="small-caps text-[var(--secondary-foreground)]">
              {t("node.expiredAt")}
            </span>
            <span
              className="tabular text-xs font-medium whitespace-nowrap"
              style={{ color: getExpiryColor(daysLeft) }}>
              {expired_at}
            </span>
          </span>
          <span className="h-6 w-px bg-[var(--border)] flex-shrink-0" />
          <span className="flex flex-col items-center leading-tight">
            <span className="small-caps text-[var(--secondary-foreground)]">
              {t("node.uptime")}
            </span>
            <span className="serif-body text-xs text-foreground whitespace-nowrap">
              {isOnline && stats
                ? formatUptime(stats.uptime, {
                    days: (n) => t("node.uptimeDays", { count: n }),
                    hours: (n) => t("node.uptimeHours", { count: n }),
                    minutes: (n) => t("node.uptimeMinutes", { count: n }),
                    justNow: t("node.uptimeJustNow"),
                  })
                : t("node.offline")}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * 列标题行：小型大写字母 + 金色，与每行列轨完全一致，构成对齐的“账册”表头。
 * 桌面端显示；窄屏隐藏（行内自带语义标签）。
 */
export const NodeCompactHeader = () => {
  const { t } = useLocale();
  return (
    <div className="hidden md:grid items-center gap-x-4 px-4 py-2 border-b border-[var(--border)] [grid-template-columns:minmax(11rem,1.6fr)_2.5rem_2.5rem_2.5rem_minmax(6.5rem,1fr)_minmax(7rem,1.1fr)_minmax(7.5rem,1fr)]">
      <span className="small-caps text-[var(--serif-accent)]">{t("node.name")}</span>
      <span className="small-caps text-[var(--serif-accent)] text-center">{t("node.cpu")}</span>
      <span className="small-caps text-[var(--serif-accent)] text-center">{t("node.mem")}</span>
      <span className="small-caps text-[var(--serif-accent)] text-center">{t("node.disk")}</span>
      <span className="small-caps text-[var(--serif-accent)] text-center">{t("node.network")}</span>
      <span className="small-caps text-[var(--serif-accent)] text-center">{t("node.traffic")}</span>
      <span className="small-caps text-[var(--serif-accent)] text-center">{t("node.uptime")}</span>
    </div>
  );
};
