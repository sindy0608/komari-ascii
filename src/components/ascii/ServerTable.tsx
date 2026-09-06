import { ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatBytes, getSpeedColor, getUsageColor } from "@/utils";
import type { NezhaFormattedInfo } from "@/utils/nezha-ascii/formatInfo";
import { AsciiProgress } from "./AsciiProgress";
import { ServerFlag } from "./ServerFlag";
import { ServerDetails } from "./ServerDetails";

interface ServerTableProps {
  servers: NezhaFormattedInfo[];
  expandedServers: string[];
  onToggleServer: (id: string) => void;
  expandAll: boolean;
  onToggleExpandAll: () => void;
}

export function ServerTable({
  servers,
  expandedServers,
  onToggleServer,
  expandAll,
  onToggleExpandAll,
}: ServerTableProps) {
  return (
    // scrollbar-gutter:stable 始终预留滚动条空间，展开行出现/消失横向滚动条时不再抖动整页
    <div
      className="border border-[var(--ascii-border)] rounded overflow-x-auto"
      style={{ scrollbarGutter: "stable" }}
    >
      <div className="p-2 border-b border-[var(--ascii-border)] flex justify-end">
        <button
          onClick={onToggleExpandAll}
          className="flex items-center gap-1 text-[var(--ascii-primary)] hover:text-[var(--ascii-primary)]/80 transition-colors"
        >
          {expandAll ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Expand All
            </>
          )}
        </button>
      </div>
      {/* table-fixed：列宽完全由 colgroup 决定，内容跳变不再撑动列宽，避免展开行时抖动 */}
      <table className="w-full text-left text-[10px] sm:text-xs whitespace-nowrap table-fixed">
        <colgroup>
          <col className="w-[160px] min-w-[160px]" />
          <col className="w-[110px] min-w-[110px]" />
          <col className="w-[110px] min-w-[110px]" />
          <col className="w-[110px] min-w-[110px]" />
          <col className="w-[230px] min-w-[230px]" />
          <col className="w-[90px] min-w-[90px]" />
          <col className="w-[70px] min-w-[70px]" />
          <col className="w-[80px] min-w-[80px]" />
          <col className="w-[90px] min-w-[90px]" />
          <col className="w-[150px] min-w-[150px]" />
        </colgroup>
        <thead>
          <tr className="bg-[var(--ascii-primary)]/10">
            <th className="p-1 sm:p-2">Server</th>
            <th className="p-1 sm:p-2">CPU</th>
            <th className="p-1 sm:p-2">Memory</th>
            <th className="p-1 sm:p-2">Storage</th>
            <th className="p-1 sm:p-2">Network</th>
            <th className="p-1 sm:p-2">Uptime</th>
            <th className="p-1 sm:p-2">Load</th>
            <th className="p-1 sm:p-2">Status</th>
            <th className="p-1 sm:p-2">Expiry</th>
            <th className="p-1 sm:p-2">Tags</th>
          </tr>
        </thead>
        <tbody>
          {servers.map((server) => {
            const isExpanded = expandedServers.includes(server.uuid);

            return (
              <>
                <tr
                  onClick={() => onToggleServer(server.uuid)}
                  className={cn(
                    "border-t border-[var(--ascii-border)]/30 cursor-pointer hover:bg-[var(--ascii-primary)]/5",
                    isExpanded && "bg-[var(--ascii-primary)]/10"
                  )}
                >
                  <td className="p-1 sm:p-2">
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" />
                      )}
                      <span
                        aria-label={server.online ? "Online" : "Offline"}
                        title={server.online ? "Online" : "Offline"}
                        className={`status-dot ${
                          server.online ? "status-dot-online" : "status-dot-offline"
                        }`}
                      />
                      <ServerFlag country_code={server.country_code} />
                      <span className="truncate">{server.name}</span>
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    <div className="flex items-center gap-1">
                      <AsciiProgress value={server.cpu} className="w-14" />
                      <span
                        className="w-[35px] text-right"
                        style={{ color: getUsageColor(server.cpu) }}
                      >
                        {server.cpu.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    <div className="flex items-center gap-1">
                      <AsciiProgress value={server.mem} className="w-14" />
                      <span
                        className="w-[35px] text-right"
                        style={{ color: getUsageColor(server.mem) }}
                      >
                        {server.mem.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    <div className="flex items-center gap-1">
                      <AsciiProgress value={server.stg} className="w-14" />
                      <span
                        className="w-[35px] text-right"
                        style={{ color: getUsageColor(server.stg) }}
                      >
                        {server.stg.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    {/* 两段各占固定宽度 + 左对齐：↑/↓ 箭头各自钉在固定位置，
                        互不影响（auto 列会让 ↓ 随上行宽度漂移）；
                        tabular-nums 保证数字等宽，数值跳变不抖动 */}
                    <div className="flex leading-tight whitespace-nowrap tabular-nums">
                      <span
                        className="inline-block w-[6rem] text-left"
                        style={{ color: getSpeedColor(server.up) }}
                      >
                        ↑ {formatSpeed(server.up)}
                      </span>
                      <span
                        className="inline-block w-[6rem] text-left"
                        style={{ color: getSpeedColor(server.down) }}
                      >
                        ↓ {formatSpeed(server.down)}
                      </span>
                    </div>
                    <div className="text-[var(--ascii-muted)] tabular-nums">
                      total {formatBytes(server.net_out_transfer + server.net_in_transfer)}
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    {formatUptime(server.uptime)}
                  </td>
                  <td className="p-1 sm:p-2">{server.load_1.toFixed(2)}</td>
                  <td className="p-1 sm:p-2">
                    <span
                      className={
                        server.online
                          ? "text-[var(--ascii-success)]"
                          : "text-[var(--ascii-destructive)]"
                      }
                    >
                      {server.online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="p-1 sm:p-2">
                    {formatExpiry(server)}
                  </td>
                  <td className="p-1 sm:p-2">
                    <div className="flex flex-wrap gap-1">
                      {server.price && (
                        <span className="text-[var(--ascii-muted)]">{server.price}</span>
                      )}
                      {server.daysLeft !== null && (
                        <span
                          className={
                            server.daysLeft < 0 || server.daysLeft <= 7
                              ? "text-[var(--ascii-destructive)]"
                              : "text-[var(--ascii-primary)]"
                          }
                        >
                          {server.daysLeft < 0
                            ? `Expired`
                            : `${server.daysLeft}d left`}
                        </span>
                      )}
                      {server.tags.map((tag, i) => (
                        <span key={i} className="text-[var(--ascii-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-[var(--ascii-primary)]/5 border-t border-[var(--ascii-border)]/30">
                    <td colSpan={10} className="p-2">
                      <ServerDetails server={server} />
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatSpeed(value: number): string {
  return formatBytes(value, true);
}

function formatUptime(seconds: number): string {
  if (seconds / 86400 >= 1) return `${(seconds / 86400).toFixed(0)} days`;
  return `${(seconds / 3600).toFixed(0)} hours`;
}

function formatExpiry(server: NezhaFormattedInfo): string {
  if (!server.expired_at) return "N/A";
  if (server.daysLeft === null) return "N/A";
  if (server.daysLeft < 0) return "Expired";
  if (server.daysLeft > 36500) return "Long term";
  return `${server.daysLeft}d`;
}
