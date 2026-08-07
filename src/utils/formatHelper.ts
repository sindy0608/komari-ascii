import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to format bytes
export const formatBytes = (bytes: number, isSpeed = false, decimals = 2) => {
  if (bytes === 0) return isSpeed ? "0 B/s" : "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = isSpeed
    ? ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"]
    : ["B", "KB", "MB", "GB", "TB", "PB", "EB"];

  let i = Math.floor(Math.log(bytes) / Math.log(k));
  let value = bytes / Math.pow(k, i);

  // 如果值大于等于1000，则进位到下一个单位
  if (value >= 1000 && i < sizes.length - 1) {
    i++;
    value = bytes / Math.pow(k, i);
  }

  return parseFloat(value.toFixed(dm)) + " " + sizes[i];
};

// Helper function to format uptime
// labels 可选：传入本地化文案（天/小时/分钟/刚刚），避免硬编码中文。
// 不传时回退到中文默认值，保持对既有调用方（如 Instance 页）的向后兼容。
export interface UptimeLabels {
  days: (count: number) => string;
  hours: (count: number) => string;
  minutes: (count: number) => string;
  justNow: string;
}

export const formatUptime = (
  seconds: number,
  labels?: UptimeLabels
) => {
  if (isNaN(seconds) || seconds < 0) {
    return "N/A";
  }
  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  const hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  const mns = Math.floor(seconds / 60);

  // 未提供本地化文案时，回退到中文默认值
  const L = labels ?? {
    days: (n: number) => `${n}天`,
    hours: (n: number) => `${n}小时`,
    minutes: (n: number) => `${n}分钟`,
    justNow: "刚刚",
  };

  let uptimeString = "";
  if (days > 0) {
    uptimeString += L.days(days);
  }
  if (hrs > 0) {
    uptimeString += L.hours(hrs);
  }
  if (mns > 0 && days === 0) {
    // Only show minutes if uptime is less than a day
    uptimeString += L.minutes(mns);
  }
  if (uptimeString === "") {
    return L.justNow;
  }

  return uptimeString;
};

export const formatPrice = (
  price: number,
  currency: string,
  billingCycle: number
) => {
  if (price === -1) return "免费";
  if (price === 0) return "";
  if (!currency || !billingCycle) return "N/A";

  let cycleStr = `${billingCycle}天`;
  if (billingCycle < 0) {
    return `${currency}${price.toFixed(2)}`;
  } else if (billingCycle === 30 || billingCycle === 31) {
    cycleStr = "月";
  } else if (billingCycle >= 89 && billingCycle <= 92) {
    cycleStr = "季";
  } else if (billingCycle >= 180 && billingCycle <= 183) {
    cycleStr = "半年";
  } else if (billingCycle >= 364 && billingCycle <= 366) {
    cycleStr = "年";
  } else if (billingCycle >= 730 && billingCycle <= 732) {
    cycleStr = "两年";
  } else if (billingCycle >= 1095 && billingCycle <= 1097) {
    cycleStr = "三年";
  } else if (billingCycle >= 1825 && billingCycle <= 1827) {
    cycleStr = "五年";
  }

  return `${currency}${price.toFixed(2)}/${cycleStr}`;
};

export const formatTrafficLimit = (
  limit?: number,
  type?: "sum" | "max" | "min" | "up" | "down"
) => {
  if (!limit) return "未设置";

  const limitText = formatBytes(limit);

  const typeText =
    {
      sum: "总和",
      max: "最大值",
      min: "最小值",
      up: "上传",
      down: "下载",
    }[type || "max"] || "";

  return `总 ${limitText} (${typeText})`;
};

export const getProgressBarClass = (percentage: number) => {
  if (percentage > 90) return "bg-red-600";
  if (percentage > 50) return "bg-yellow-400";
  return "bg-green-500";
};

/**
 * 将日期格式化为固定的 YYYY-MM-DD（年-月-日）顺序，不受系统 locale 影响。
 */
export const formatYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Serif 设计系统：占用率语义颜色。
 * 低 ≤50% 鼠尾草绿、中 51–85% 琥珀、高 >85% 砖红。
 * 暗色模式各自提亮一档以保证对比度。返回 CSS 变量，亮/暗自适应。
 */
export const getUsageColor = (percentage: number): string => {
  if (percentage > 85) return "var(--usage-high)";
  if (percentage > 50) return "var(--usage-mid)";
  return "var(--usage-low)";
};

/**
 * 到期剩余天数的语义颜色。
 * 已过期或 ≤7 天 砖红、≤30 天 琥珀、长期/未设置 鼠尾草绿、其余 绿。
 */
export const getExpiryColor = (daysLeft: number | null): string => {
  if (daysLeft === null) return "var(--usage-low)";
  if (daysLeft < 0) return "var(--usage-high)";
  if (daysLeft <= 7) return "var(--usage-high)";
  if (daysLeft <= 30) return "var(--usage-mid)";
  return "var(--usage-low)";
};

