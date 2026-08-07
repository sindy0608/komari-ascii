import { formatPrice } from "@/utils";
import type { NodeData } from "@/types/node";
import type { RpcNodeStatus } from "@/types/rpc";

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// 标签里可能含中文日期（如「2026年8月续费」），终端风统一转成英文（Aug 2026）
export const englishizeTagDates = (tag: string): string =>
  tag
    .replace(
      /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/g,
      (_m, y: string, mo: string, d: string) =>
        `${EN_MONTHS[Number(mo) - 1]} ${Number(d)}, ${y}`
    )
    .replace(
      /(\d{4})\s*年\s*(\d{1,2})\s*月/g,
      (_m, y: string, mo: string) => `${EN_MONTHS[Number(mo) - 1]} ${y}`
    );

export interface NezhaFormattedInfo {
  uuid: string;
  name: string;
  country_code: string;
  online: boolean;
  cpu: number;
  mem: number;
  swap: number;
  disk: number;
  stg: number;
  up: number;
  down: number;
  net_out_transfer: number;
  net_in_transfer: number;
  uptime: number;
  load_1: number;
  load_5: number;
  load_15: number;
  platform: string;
  platform_version: string;
  arch: string;
  cpu_info: string[];
  gpu_info: string[];
  mem_total: number;
  mem_used: number;
  swap_total: number;
  swap_used: number;
  disk_total: number;
  disk_used: number;
  version: string;
  last_active_time_string: string;
  tcp: number;
  udp: number;
  process: number;
  expired_at: string | null;
  daysLeft: number | null;
  price: string;
  tags: string[];
}

export function formatNezhaInfo(
  node: NodeData,
  stats?: RpcNodeStatus | null
): NezhaFormattedInfo {
  const online = !!stats?.online;

  const cpu = stats?.cpu ?? 0;
  const mem = stats?.ram_total ? (stats.ram / stats.ram_total) * 100 : 0;
  const swap = stats?.swap_total ? (stats.swap / stats.swap_total) * 100 : 0;
  const disk = stats?.disk_total ? (stats.disk / stats.disk_total) * 100 : 0;
  const stg = disk;

  const up = stats ? stats.net_out : 0;
  const down = stats ? stats.net_in : 0;

  const net_out_transfer = stats?.net_total_up ?? 0;
  const net_in_transfer = stats?.net_total_down ?? 0;

  const uptime = stats?.uptime ?? 0;
  const load_1 = stats?.load ?? 0;
  const load_5 = stats?.load5 ?? 0;
  const load_15 = stats?.load15 ?? 0;

  const last_active_time_string = stats?.time
    ? new Date(stats.time).toLocaleString("en-GB", { hour12: false })
    : "N/A";

  const expiryMs = node.expired_at ? new Date(node.expired_at).getTime() : NaN;
  const hasExpiry = !isNaN(expiryMs) && expiryMs > 0;
  const daysLeft = hasExpiry
    ? Math.ceil((expiryMs - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const price = formatPrice(node.price, node.currency, node.billing_cycle);

  const tags =
    typeof node.tags === "string"
      ? node.tags
          .split(";")
          .map((tag) => englishizeTagDates(tag.trim()))
          .filter(Boolean)
      : [];

  return {
    uuid: node.uuid,
    name: node.name,
    country_code: node.region,
    online,
    cpu,
    mem,
    swap,
    disk,
    stg,
    up,
    down,
    net_out_transfer,
    net_in_transfer,
    uptime,
    load_1,
    load_5,
    load_15,
    platform: node.os,
    platform_version: node.kernel_version,
    arch: node.arch,
    cpu_info: [node.cpu_name],
    gpu_info: node.gpu_name ? [node.gpu_name] : [],
    mem_total: node.mem_total,
    mem_used: stats ? stats.ram : 0,
    swap_total: node.swap_total,
    swap_used: stats ? stats.swap : 0,
    disk_total: node.disk_total,
    disk_used: stats ? stats.disk : 0,
    version: "N/A",
    last_active_time_string,
    tcp: stats?.connections ?? 0,
    udp: stats?.connections_udp ?? 0,
    process: stats?.process ?? 0,
    expired_at: node.expired_at,
    daysLeft,
    price,
    tags,
  };
}
