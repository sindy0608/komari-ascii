import { useEffect, useState } from "react";
import { formatBytes, getSpeedColor } from "@/utils";

interface AsciiFooterProps {
  upSpeed: number;
  downSpeed: number;
}

function CurrentTime() {
  const [timeString, setTimeString] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour12: false })
  );

  useEffect(() => {
    const update = () => {
      setTimeString(
        new Date().toLocaleTimeString("en-GB", { hour12: false })
      );
    };
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>Current time: {timeString}</div>;
}

export function AsciiFooter({ upSpeed, downSpeed }: AsciiFooterProps) {
  return (
    <div className="mt-2 sm:mt-4 text-[10px] sm:text-xs text-[var(--ascii-muted)] flex flex-col sm:flex-row sm:justify-between">
      <CurrentTime />
      {/* 上/下网速各占定宽 + tabular-nums，数值随单位跳变时这段宽度恒定，
          不再撑动右侧 Dashboard/GitHub 链接的位置 */}
      <div className="whitespace-nowrap tabular-nums">
        Network Speed:{" "}
        <span
          className="inline-block w-[8rem]"
          style={{ color: getSpeedColor(upSpeed) }}
        >
          ↑ {formatBytes(upSpeed, true)}
        </span>
        <span
          className="inline-block w-[8rem]"
          style={{ color: getSpeedColor(downSpeed) }}
        >
          ↓ {formatBytes(downSpeed, true)}
        </span>
      </div>
      <a href="/admin" className="underline hover:text-[var(--ascii-primary)]">
        Dashboard
      </a>
      <a
        href="https://github.com/facl/komari-ascii"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--ascii-primary)]">
        GitHub
      </a>
    </div>
  );
}
