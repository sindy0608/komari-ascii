import { useTheme } from "@/hooks/useTheme";
import type { AppearanceType } from "@/config/default";

interface AsciiToolbarProps {
  groups: string[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}

export function AsciiToolbar({
  groups,
  selectedGroup,
  onSelectGroup,
}: AsciiToolbarProps) {
  const { rawAppearance, setAppearance } = useTheme();
  const themeModes: { value: AppearanceType; label: string }[] = [
    { value: "system", label: "自动" },
    { value: "light", label: "日间" },
    { value: "dark", label: "夜间" },
  ];

  return (
    <nav
      aria-label="Dashboard controls"
      className="mb-2 flex items-center gap-2 border border-[var(--ascii-border)] bg-[var(--ascii-card)]/50 p-1 sm:mb-4 sm:p-2"
    >
      <div
        aria-label="Server groups"
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap"
      >
        <span className="shrink-0 text-[10px] text-[var(--ascii-muted)] sm:text-xs">
          GROUP:
        </span>
        {groups.map((group) => {
          const isSelected = selectedGroup === group;
          return (
            <button
              key={group}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectGroup(group)}
              className={`shrink-0 border px-2 py-1 transition-colors ${
                isSelected
                  ? "border-[var(--ascii-primary)] bg-[var(--ascii-primary)] text-[var(--ascii-background)]"
                  : "border-[var(--ascii-border)] text-[var(--ascii-muted)] hover:border-[var(--ascii-primary)] hover:text-[var(--ascii-primary)]"
              }`}
            >
              {group}
            </button>
          );
        })}
      </div>

      <div
        aria-label="主题模式"
        className="flex shrink-0 items-center border border-[var(--ascii-border)]"
      >
        {themeModes.map(({ value, label }) => {
          const isSelected = rawAppearance === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isSelected}
              title={`${label}模式`}
              onClick={() => setAppearance(value)}
              className={`border-r border-[var(--ascii-border)] px-2 py-1 transition-colors last:border-r-0 ${
                isSelected
                  ? "bg-[var(--ascii-primary)] text-[var(--ascii-background)]"
                  : "text-[var(--ascii-muted)] hover:bg-[var(--ascii-card)] hover:text-[var(--ascii-primary)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <a
        href="/admin"
        className="shrink-0 border border-[var(--ascii-primary)] px-2 py-1 font-semibold text-[var(--ascii-primary)] hover:bg-[var(--ascii-primary)] hover:text-[var(--ascii-background)] sm:px-3"
      >
        Admin
      </a>
    </nav>
  );
}