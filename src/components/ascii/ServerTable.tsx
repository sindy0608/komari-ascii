import { ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatBytes } from "@/utils";
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
    <div className="border border-[var(--ascii-border)] rounded overflow-x-auto">
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
      <table className="w-full text-left text-[10px] sm:text-xs whitespace-nowrap">
        <thead>
          <tr className="bg-[var(--ascii-primary)]/10">
            <th className="p-1 sm:p-2 min-w-[140px]">Server</th>
            <th className="p-1 sm:p-2">CPU</th>
            <th className="p-1 sm:p-2">Memory</th>
            <th className="p-1 sm:p-2">Storage</th>
            <th className="p-1 sm:p-2">Network</th>
            <th className="p-1 sm:p-2">Uptime</th>
            <th className="p-1 sm:p-2">Load</th>
            <th className="p-1 sm:p-2">Status</th>
            <th className="p-1 sm:p-2">Expiry</th>
            <th className="p-1 sm:p-2 min-w-[140px]">Tags</th>
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
                  <td className="p-1 sm:p-2 min-w-[140px]">
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" />
                      )}
                      <ServerFlag country_code={server.country_code} />
                      <span className="truncate">{server.name}</span>
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    <div className="flex items-center gap-1">
                      <AsciiProgress value={server.cpu} className="w-14" />
                      <span
                        className={`w-[35px] text-right ${
                          server.cpu > 80
                            ? "text-[var(--ascii-destructive)]"
                            : "text-[var(--ascii-primary)]"
                        }`}
                      >
                        {server.cpu.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    <div className="flex items-center gap-1">
                      <AsciiProgress value={server.mem} className="w-14" />
                      <span
                        className={`w-[35px] text-right ${
                          server.mem > 80
                            ? "text-[var(--ascii-destructive)]"
                            : "text-[var(--ascii-primary)]"
                        }`}
                      >
                        {server.mem.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    <div className="flex items-center gap-1">
                      <AsciiProgress value={server.stg} className="w-14" />
                      <span
                        className={`w-[35px] text-right ${
                          server.stg > 80
                            ? "text-[var(--ascii-destructive)]"
                            : "text-[var(--ascii-primary)]"
                        }`}
                      >
                        {server.stg.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-1 sm:p-2">
                    <div className="flex flex-col leading-tight whitespace-nowrap">
                      {/* 固定宽度：上/下网速各占定宽列，数值右对齐，
                          避免数值随单位跳变（KB/s↔MB/s、2.9↔2.75）时整列拉伸 */}
                      <span className="flex">
                        <span className="inline-block w-[7.5rem] text-right tabular-nums">
                          ↑ {formatSpeed(server.up)}
                        </span>
                        <span className="inline-block w-[7.5rem] text-right tabular-nums">
                          ↓ {formatSpeed(server.down)}
                        </span>
                      </span>
                      <span className="text-[var(--ascii-muted)] tabular-nums">
                        {formatBytes(server.net_out_transfer + server.net_in_transfer)}
                      </span>
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
                  <td className="p-1 sm:p-2 min-w-[140px]">
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
