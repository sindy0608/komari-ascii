import { useState, useMemo, useEffect, useRef } from "react";
import { HeaderStats } from "@/components/ascii/HeaderStats";
import { ServerTable } from "@/components/ascii/ServerTable";
import { AsciiFooter } from "@/components/ascii/AsciiFooter";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useLiveData } from "@/contexts/LiveDataContext";
import { formatNezhaInfo } from "@/utils/nezha-ascii/formatInfo";
import type { NodeData } from "@/types/node";

interface AsciiDashboardProps {
  searchTerm: string;
  filteredNodes?: (NodeData & { stats?: any })[];
}

export default function AsciiDashboard({
  searchTerm,
  filteredNodes: propFilteredNodes,
}: AsciiDashboardProps) {
  const { nodes, loading } = useNodeData();
  const { liveData } = useLiveData();
  const [expandedServers, setExpandedServers] = useState<string[]>([]);
  const [expandAll, setExpandAll] = useState(false);
  const prevExpandAll = useRef(expandAll);

  const servers = useMemo(() => {
    const list = propFilteredNodes ?? nodes;
    if (!list) return [];
    return list.map((node) =>
      formatNezhaInfo(node, liveData ? liveData[node.uuid] : null)
    );
  }, [propFilteredNodes, nodes, liveData]);

  const searchedServers = useMemo(() => {
    if (!searchTerm.trim()) return servers;
    const term = searchTerm.toLowerCase();
    return servers.filter((s) => s.name.toLowerCase().includes(term));
  }, [servers, searchTerm]);

  useEffect(() => {
    if (expandAll) {
      setExpandedServers(searchedServers.map((s) => s.uuid));
    } else if (prevExpandAll.current !== expandAll) {
      setExpandedServers([]);
    }
    prevExpandAll.current = expandAll;
  }, [expandAll, searchedServers]);

  const totalServers = searchedServers.length;
  const onlineServers = searchedServers.filter((s) => s.online).length;
  const offlineServers = totalServers - onlineServers;
  const upTotal = searchedServers.reduce(
    (acc, s) => acc + (s.online ? s.net_out_transfer : 0),
    0
  );
  const downTotal = searchedServers.reduce(
    (acc, s) => acc + (s.online ? s.net_in_transfer : 0),
    0
  );
  const upSpeed = searchedServers.reduce(
    (acc, s) => acc + (s.online ? s.up : 0),
    0
  );
  const downSpeed = searchedServers.reduce(
    (acc, s) => acc + (s.online ? s.down : 0),
    0
  );

  const handleToggleServer = (id: string) => {
    setExpandedServers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
    setExpandAll(false);
  };

  const handleToggleExpandAll = () => {
    setExpandAll((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--ascii-background)] text-[var(--ascii-primary)] p-1 sm:p-2 font-mono text-xs">
        Loading...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[var(--ascii-background)] text-[var(--ascii-primary)] p-1 sm:p-2 font-mono text-xs">
      <HeaderStats
        totalServers={totalServers}
        onlineServers={onlineServers}
        offlineServers={offlineServers}
        upTotal={upTotal}
        downTotal={downTotal}
      />
      <ServerTable
        servers={searchedServers}
        expandedServers={expandedServers}
        onToggleServer={handleToggleServer}
        expandAll={expandAll}
        onToggleExpandAll={handleToggleExpandAll}
      />
      <AsciiFooter upSpeed={upSpeed} downSpeed={downSpeed} />
    </div>
  );
}
