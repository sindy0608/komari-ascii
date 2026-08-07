import { useEffect, useState } from "react";
import { formatBytes } from "@/utils";

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
      <div>
        Network Speed: ↑ {formatBytes(upSpeed, true)} ↓ {formatBytes(downSpeed, true)}
      </div>
      <a href="/admin" className="underline hover:text-[var(--ascii-primary)]">
        Dashboard
      </a>
    </div>
  );
}
