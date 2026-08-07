import { formatBytes } from "@/utils";
import type { NezhaFormattedInfo } from "@/utils/nezha-ascii/formatInfo";
import { ServerPingPanel } from "./ServerPingPanel";

interface ServerDetailsProps {
  server: NezhaFormattedInfo;
}

export function ServerDetails({ server }: ServerDetailsProps) {
  return (
    <div className="flex gap-4 sm:text-xs text-[10px] flex-wrap">
      <div className="space-y-1">
        <h3 className="font-bold text-[var(--ascii-primary)]">System Info</h3>
        <p>Platform: {server.platform || "N/A"}</p>
        <p>Kernel: {server.platform_version || "N/A"}</p>
        <p>Arch: {server.arch || "N/A"}</p>
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-[var(--ascii-primary)]">Hardware Info</h3>
        <p>CPU Model: {server.cpu_info.join(", ") || "N/A"}</p>
        <p>GPU Model: {server.gpu_info.join(", ") || "N/A"}</p>
        <p>Memory: {formatBytes(server.mem_total || 0)}</p>
        <p>Swap: {formatBytes(server.swap_total || 0)}</p>
        <p>Disk: {formatBytes(server.disk_total || 0)}</p>
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-[var(--ascii-primary)]">Usage Info</h3>
        <p>Memory: {formatBytes(server.mem_used || 0)}</p>
        <p>Swap: {formatBytes(server.swap_used || 0)}</p>
        <p>Disk: {formatBytes(server.disk_used || 0)}</p>
        <p>TCP: {server.tcp || "N/A"}</p>
        <p>UDP: {server.udp || "N/A"}</p>
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-[var(--ascii-primary)]">Agent Info</h3>
        <p>Version: {server.version || "N/A"}</p>
        <p>Last Active: {server.last_active_time_string || "N/A"}</p>
        <p>Country: {server.country_code ? server.country_code.toUpperCase() : "N/A"}</p>
      </div>
      <div className="w-full">
        <ServerPingPanel uuid={server.uuid} />
      </div>
    </div>
  );
}
