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

      <a
        href="/admin"
        className="shrink-0 border border-[var(--ascii-primary)] px-2 py-1 font-semibold text-[var(--ascii-primary)] hover:bg-[var(--ascii-primary)] hover:text-[var(--ascii-background)] sm:px-3"
      >
        Admin
      </a>
    </nav>
  );
}