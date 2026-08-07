import { useState, useEffect } from "react";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useAppConfig } from "@/config";
import type { PingHistoryResponse } from "@/types/node";
import { calculateTaskStats } from "@/utils/RecordHelper";

interface ServerPingPanelProps {
  uuid: string;
}

export function ServerPingPanel({ uuid }: ServerPingPanelProps) {
  const { getPingHistory } = useNodeData();
  const { pingChartTimeInPreview } = useAppConfig();
  const [pingHistory, setPingHistory] = useState<PingHistoryResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPingHistory(uuid, pingChartTimeInPreview).then((data) => {
      if (cancelled) return;
      setPingHistory(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [uuid, getPingHistory, pingChartTimeInPreview]);

  if (loading) {
    return (
      <div className="text-[var(--ascii-muted)]">
        [Latency] Fetching ping tasks...
      </div>
    );
  }

  if (!pingHistory?.tasks?.length) {
    return (
      <div className="text-[var(--ascii-muted)]">
        [Latency] No ping tasks configured.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="font-bold text-[var(--ascii-primary)]">Latency Check</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {pingHistory.tasks.map((task) => {
          const { loss, latestValue, latestTime } = calculateTaskStats(
            pingHistory.records || [],
            task.id,
            null
          );
          const latestMs =
            latestValue !== null && latestValue >= 0
              ? `${latestValue.toFixed(1)} ms`
              : "Offline";
          const colorClass =
            latestValue === null || latestValue < 0
              ? "text-[var(--ascii-destructive)]"
              : "text-[var(--ascii-success)]";

          return (
            <div key={task.id} className="min-w-[120px]">
              <span className="text-[var(--ascii-muted)]">{task.name}:</span>
              <span className={`ml-1 ${colorClass}`}>{latestMs}</span>
              <span className="ml-1 text-[var(--ascii-muted)]">
                ({loss.toFixed(1)}% loss)
              </span>
              {latestTime && (
                <span className="ml-1 text-[var(--ascii-muted)]">
                  @ {new Date(latestTime).toLocaleTimeString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
