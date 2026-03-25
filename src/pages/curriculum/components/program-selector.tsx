import type { Program } from '@/types/database'

interface ProgramSelectorProps {
  programs: Program[]
  value: string
  onChange: (code: string) => void
}

export function ProgramSelector({ programs, value, onChange }: ProgramSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select program"
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-150"
    >
      {programs.map((p) => (
        <option key={p.code} value={p.code}>
          {p.code} — {p.name}
        </option>
      ))}
    </select>
  )
}
