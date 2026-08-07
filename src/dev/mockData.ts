/**
 * Dev-only mock layer.
 *
 * 拦截 apiService 的关键方法，返回假数据，让前端在没有 Komari 后端时也能预览。
 * 仅在 dev 模式（import.meta.env.DEV）下通过 main.tsx 调用 installMock() 生效，
 * 生产构建里这段代码会被 tree-shake 掉（main.tsx 中用 import.meta.env.DEV 守卫）。
 *
 * 注意：禁止在脚本顶层调用 Date.now()/Math.random()——这里是在浏览器运行时调用，不受限制。
 */
import type { NodeData, NodeStats, PublicInfo } from "@/types/node";
import type {
  RpcNodeStatus,
  RpcNodeStatusMap,
} from "@/types/rpc";
import type { SiteStatus } from "@/config/default";
import { convertNodeStatsToRpcNodeStatus } from "@/utils/converters";
import { apiService, getWsService } from "@/services/api";

// ---------- 假节点（静态配置） ----------
const MOCK_NODES: NodeData[] = [
  {
    uuid: "mock-1",
    name: "东京 / Tokyo",
    cpu_name: "Intel Xeon E5-2680v4",
    virtualization: "KVM",
    arch: "x86_64",
    cpu_cores: 2,
    os: "Debian 12",
    kernel_version: "6.1.0",
    gpu_name: "",
    region: "JP",
    mem_total: 4 * 1024 ** 3,
    swap_total: 2 * 1024 ** 3,
    disk_total: 80 * 1024 ** 3,
    weight: 1,
    price: 5.5,
    billing_cycle: 30,
    currency: "$",
    expired_at: new Date(Date.now() + 120 * 864e5).toISOString(),
    auto_renewal: true,
    group: "亚洲",
    tags: "轻量;CN2",
    public_remark: "",
    hidden: false,
    traffic_limit: 1024 * 1024 ** 3,
    traffic_limit_type: "sum",
    created_at: "",
    updated_at: "",
  },
  {
    uuid: "mock-2",
    name: "新加坡 / Singapore",
    cpu_name: "AMD EPYC 7763",
    virtualization: "KVM",
    arch: "x86_64",
    cpu_cores: 4,
    os: "Ubuntu 22.04",
    kernel_version: "5.15.0",
    gpu_name: "",
    region: "SG",
    mem_total: 8 * 1024 ** 3,
    swap_total: 0,
    disk_total: 160 * 1024 ** 3,
    weight: 2,
    price: 12.0,
    billing_cycle: 30,
    currency: "$",
    expired_at: new Date(Date.now() + 6 * 864e5).toISOString(),
    auto_renewal: false,
    group: "亚洲",
    tags: "高配",
    public_remark: "",
    hidden: false,
    traffic_limit: 2 * 1024 * 1024 ** 3,
    traffic_limit_type: "sum",
    created_at: "",
    updated_at: "",
  },
  {
    uuid: "mock-3",
    name: "法兰克福 / Frankfurt",
    cpu_name: "Intel Xeon Gold 6248",
    virtualization: "KVM",
    arch: "x86_64",
    cpu_cores: 8,
    os: "Rocky Linux 9",
    kernel_version: "5.14.0",
    gpu_name: "",
    region: "DE",
    mem_total: 16 * 1024 ** 3,
    swap_total: 4 * 1024 ** 3,
    disk_total: 480 * 1024 ** 3,
    weight: 3,
    price: 28.0,
    billing_cycle: 30,
    currency: "€",
    expired_at: new Date(Date.now() + 400 * 864e5).toISOString(),
    auto_renewal: true,
    group: "欧洲",
    tags: "独享;高带宽",
    public_remark: "",
    hidden: false,
    traffic_limit: 4 * 1024 * 1024 ** 3,
    traffic_limit_type: "sum",
    created_at: "",
    updated_at: "",
  },
  {
    uuid: "mock-4",
    name: "洛杉矶 / Los Angeles",
    cpu_name: "Intel Core i9-9900K",
    virtualization: "KVM",
    arch: "x86_64",
    cpu_cores: 2,
    os: "Arch Linux",
    kernel_version: "6.6.0",
    gpu_name: "",
    region: "US",
    mem_total: 4 * 1024 ** 3,
    swap_total: 1 * 1024 ** 3,
    disk_total: 60 * 1024 ** 3,
    weight: 4,
    price: 0,
    billing_cycle: 0,
    currency: "",
    expired_at: null,
    auto_renewal: false,
    group: "美洲",
    tags: "自建",
    public_remark: "",
    hidden: false,
    traffic_limit: 0,
    traffic_limit_type: "max",
    created_at: "",
    updated_at: "",
  },
  {
    uuid: "mock-5",
    name: "香港 / Hong Kong (离线)",
    cpu_name: "Intel Xeon E3-1230v6",
    virtualization: "KVM",
    arch: "x86_64",
    cpu_cores: 4,
    os: "CentOS 7",
    kernel_version: "3.10.0",
    gpu_name: "",
    region: "HK",
    mem_total: 8 * 1024 ** 3,
    swap_total: 2 * 1024 ** 3,
    disk_total: 120 * 1024 ** 3,
    weight: 5,
    price: 9.9,
    billing_cycle: 30,
    currency: "$",
    expired_at: new Date(Date.now() - 3 * 864e5).toISOString(),
    auto_renewal: false,
    group: "亚洲",
    tags: "已停机",
    public_remark: "",
    hidden: false,
    traffic_limit: 1 * 1024 * 1024 ** 3,
    traffic_limit_type: "sum",
    created_at: "",
    updated_at: "",
  },
];

// 每个节点的运行时状态基线（会在 tick 中被抖动）
interface NodeRuntime {
  online: boolean;
  uptime: number;
  cpu: number;
  ram: number;
  swap: number;
  disk: number;
  load: number;
  load5: number;
  load15: number;
  net_out: number; // 实时速度 B/s
  net_in: number;
  net_total_up: number; // 累计字节
  net_total_down: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const runtimes: Record<string, NodeRuntime> = {};
MOCK_NODES.forEach((n, i) => {
  const offline = n.name.includes("离线");
  runtimes[n.uuid] = {
    online: !offline,
    uptime: (i + 1) * 86400 * 3 + 3600 * 7,
    cpu: offline ? 0 : 10 + ((i * 7) % 30),
    ram: offline ? 0 : 20 + ((i * 13) % 50),
    swap: offline ? 0 : 5 + ((i * 5) % 30),
    disk: offline ? 0 : 35 + ((i * 17) % 50),
    load: offline ? 0 : 0.3 + ((i * 0.4) % 1.5),
    load5: offline ? 0 : 0.3 + ((i * 0.35) % 1.3),
    load15: offline ? 0 : 0.3 + ((i * 0.3) % 1.1),
    net_out: offline ? 0 : 50_000 + i * 30_000,
    net_in: offline ? 0 : 120_000 + i * 40_000,
    net_total_up: offline ? 0 : (i + 1) * 40 * 1024 ** 3,
    net_total_down: offline ? 0 : (i + 1) * 90 * 1024 ** 3,
  };
});

// 把 runtime 转成 NodeStats（旧 API 形态），再经现成的转换器变成 RpcNodeStatus
const buildRpcStatus = (uuid: string): RpcNodeStatus => {
  const node = MOCK_NODES.find((n) => n.uuid === uuid)!;
  const rt = runtimes[uuid];
  const stats: NodeStats = {
    cpu: { usage: rt.cpu },
    ram: { total: node.mem_total, used: (rt.ram / 100) * node.mem_total },
    swap: { total: node.swap_total, used: (rt.swap / 100) * node.swap_total },
    disk: { total: node.disk_total, used: (rt.disk / 100) * node.disk_total },
    network: {
      up: rt.net_out,
      down: rt.net_in,
      totalUp: rt.net_total_up,
      totalDown: rt.net_total_down,
    },
    load: { load1: rt.load, load5: rt.load5, load15: rt.load15 },
    uptime: rt.uptime,
    process: 80 + (uuid.length % 40),
    connections: { tcp: 30, udp: 5 },
    message: "",
    updated_at: new Date().toISOString(),
  };
  return convertNodeStatsToRpcNodeStatus(stats, uuid, rt.online);
};

const buildLiveDataMap = (): RpcNodeStatusMap => {
  const map: RpcNodeStatusMap = {};
  MOCK_NODES.forEach((n) => {
    map[n.uuid] = buildRpcStatus(n.uuid);
  });
  return map;
};

// 抖动：让 CPU/网速等轻微变化，模拟实时
const jitter = (v: number, delta: number, min: number, max: number) =>
  clamp(v + (Math.random() - 0.5) * 2 * delta, min, max);

const tick = () => {
  MOCK_NODES.forEach((n) => {
    const rt = runtimes[n.uuid];
    if (!rt.online) return;
    rt.cpu = jitter(rt.cpu, 4, 2, 95);
    rt.ram = jitter(rt.ram, 2, 5, 92);
    rt.swap = jitter(rt.swap, 1, 0, 60);
    rt.load = jitter(rt.load, 0.15, 0.05, 4);
    rt.load5 = jitter(rt.load5, 0.1, 0.05, 3.5);
    rt.load15 = jitter(rt.load15, 0.08, 0.05, 3);
    rt.net_out = jitter(rt.net_out, 20_000, 5_000, 50_000_000);
    rt.net_in = jitter(rt.net_in, 30_000, 5_000, 50_000_000);
    rt.net_total_up += (rt.net_out / 8) * 2; // 2s 间隔累计
    rt.net_total_down += (rt.net_in / 8) * 2;
    rt.uptime += 2;
  });
};

// ---------- 假 PublicInfo（让配置走 DEFAULT_CONFIG，但默认视图设为 compact） ----------
const MOCK_PUBLIC_INFO: PublicInfo = {
  allow_cors: true,
  custom_body: "",
  custom_head: "",
  description: "Komari Monitor (mock 预览)",
  disable_password_login: false,
  oauth_enable: false,
  oauth_provider: null,
  ping_record_preserve_time: 168,
  private_site: false,
  record_enabled: true,
  record_preserve_time: 720,
  sitename: "Komari",
  theme: "komari-painting",
  theme_settings: {
    selectedDefaultView: "compact", // 打开即横条
    selectMobileDefaultView: "compact",
  } as object,
};

let mockTimer: ReturnType<typeof setInterval> | null = null;

/**
 * 安装 mock：拦截 apiService，并周期性向 WebSocket 订阅者推送假 liveData。
 * 重复调用安全（会先清理旧的定时器）。
 */
export function installMock() {
  if (mockTimer) clearInterval(mockTimer);

  // 1) 拦截静态数据 & 站点状态
  apiService.getNodes = async () => [...MOCK_NODES].sort((a, b) => a.weight - b.weight);
  apiService.getPublicSettings = async () => MOCK_PUBLIC_INFO;
  apiService.getUserInfo = async () => ({ logged_in: false, username: "" });
  apiService.getVersion = async () => ({ version: "1.0.7", hash: "mock" });
  apiService.checkSiteStatus = async () => ({
    status: "public" as SiteStatus,
    publicInfo: MOCK_PUBLIC_INFO,
  });

  // 2) 节点详情 / 历史也返回空壳，避免展开时报错
  apiService.getNodeRecentStats = async () => [];
  apiService.getLoadHistory = async () => ({ count: 0, records: [] });
  apiService.getPingHistory = async () => ({ count: 0, records: [], tasks: [] });

  // 3) 模拟 WebSocket：每 2s 抖动并推送 liveData
  //    直接调用 wsService 的 subscribe 监听器不现实，改为覆盖 connect/subscribe 行为：
  //    这里通过让 LiveDataProvider 走真实 ws，但 ws 连不上后端——
  //    所以改为在 wsService 上挂一个假推送。
  const wsService = getWsService();
  // 强制走旧 API 形态（convertNodeStatsToRpcNodeStatus 已处理）
  wsService.useRpc = false;

  // 用一个假 WebSocket 替换 connect 逻辑：直接定时调 listeners
  wsService.connect = () => {
    if (mockTimer) clearInterval(mockTimer);
    // 立即推一次
    (wsService as unknown as { listeners: Set<(d: any) => void> }).listeners.forEach(
      (fn) => fn(buildLiveDataMap())
    );
    mockTimer = setInterval(() => {
      tick();
      (wsService as unknown as { listeners: Set<(d: any) => void> }).listeners.forEach(
        (fn) => fn(buildLiveDataMap())
      );
    }, 2000);
  };
  wsService.disconnect = () => {
    if (mockTimer) {
      clearInterval(mockTimer);
      mockTimer = null;
    }
  };

  console.info(
    "%c[Mock] Komari mock data installed — 5 个假节点，每 2s 刷新实时数据",
    "color:#b8860b;font-weight:bold"
  );
}
