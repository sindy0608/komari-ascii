import { cn } from "@/utils";
import { getUsageColor } from "@/utils";

interface AsciiProgressProps {
  value?: number;
  segments?: number;
  className?: string;
}

export function AsciiProgress({
  value = 0,
  segments = 20,
  className,
}: AsciiProgressProps) {
  const segmentArray = Array.from({ length: segments }, (_, i) => {
    const segmentValue = (i + 1) * (100 / segments);
    return value >= segmentValue;
  });

  return (
    <div className={cn("flex gap-px", className)}>
      {segmentArray.map((isActive, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-0.5 transition-colors duration-200",
            !isActive && "bg-[var(--ascii-primary-muted)]"
          )}
          style={isActive ? { backgroundColor: getUsageColor(value) } : undefined}
        />
      ))}
    </div>
  );
}
