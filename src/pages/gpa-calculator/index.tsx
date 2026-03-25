import { useState, useMemo } from 'react'
import { Calculator, Target, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type CalcMode = 'gwa' | 'target'

/** Philippine grading scale entries */
const PH_SCALE = [
  { grade: 1.0, desc: 'Excellent' },
  { grade: 1.25, desc: 'Excellent' },
  { grade: 1.5, desc: 'Very Good' },
  { grade: 1.75, desc: 'Very Good' },
  { grade: 2.0, desc: 'Good' },
  { grade: 2.25, desc: 'Good' },
  { grade: 2.5, desc: 'Satisfactory' },
  { grade: 2.75, desc: 'Satisfactory' },
  { grade: 3.0, desc: 'Passing' },
  { grade: 5.0, desc: 'Failed' },
]

interface SubjectRow {
  id: number
  name: string
  units: string
  grade: string
}

let nextId = 1

function createRow(): SubjectRow {
  return { id: nextId++, name: '', units: '3', grade: '' }
}

export default function GpaCalculatorPage() {
  const [mode, setMode] = useState<CalcMode>('gwa')

  return (
    <div className="space-y-6">
      <div>
        <h1>GPA Calculator</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Calculate your GWA or find out what grade you need
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'gwa' ? 'primary' : 'secondary'}
          onClick={() => setMode('gwa')}
        >
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Calculate GWA
        </Button>
        <Button
          variant={mode === 'target' ? 'primary' : 'secondary'}
          onClick={() => setMode('target')}
        >
          <Target className="h-4 w-4" aria-hidden="true" />
          Target Grade
        </Button>
      </div>

      {mode === 'gwa' ? <GwaCalculator /> : <TargetCalculator />}

      {/* Grading Scale Reference */}
      <Card>
        <h3 className="mb-3 font-display text-sm font-bold text-[var(--color-text-primary)]">
          Philippine Grading Scale Reference
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PH_SCALE.map((item) => (
            <div
              key={item.grade}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-center"
            >
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {item.grade.toFixed(2)}
              </p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function GwaCalculator() {
  const [rows, setRows] = useState<SubjectRow[]>([createRow(), createRow(), createRow()])

  const addRow = () => setRows((prev) => [...prev, createRow()])
  const removeRow = (id: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))

  const updateRow = (id: number, field: keyof SubjectRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const result = useMemo(() => {
    let totalWeighted = 0
    let totalUnits = 0
    let validCount = 0

    for (const row of rows) {
      const units = parseFloat(row.units)
      const grade = parseFloat(row.grade)
      if (isNaN(units) || isNaN(grade) || units <= 0) continue
      if (grade < 1.0 || grade > 5.0) continue
      totalWeighted += grade * units
      totalUnits += units
      validCount++
    }

    if (validCount === 0 || totalUnits === 0) return null
    const gwa = totalWeighted / totalUnits
    return { gwa, totalUnits, validCount }
  }, [rows])

  const gwaColor =
    result === null
      ? ''
      : result.gwa <= 1.75
        ? 'text-green-700'
        : result.gwa <= 2.5
          ? 'text-blue-700'
          : result.gwa <= 3.0
            ? 'text-amber-700'
            : 'text-red-700'

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-4 font-display text-sm font-bold text-[var(--color-text-primary)]">
          Enter Your Grades
        </h3>

        {/* Header */}
        <div className="mb-2 grid grid-cols-[1fr_80px_80px_40px] gap-2 text-xs font-semibold text-[var(--color-text-secondary)]">
          <span>Subject</span>
          <span>Units</span>
          <span>Grade</span>
          <span />
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_80px_80px_40px] gap-2">
              <input
                type="text"
                placeholder="Subject name"
                value={row.name}
                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
              <input
                type="number"
                min="1"
                max="6"
                step="1"
                value={row.units}
                onChange={(e) => updateRow(row.id, 'units', e.target.value)}
                className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm text-center text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
              <input
                type="number"
                min="1.0"
                max="5.0"
                step="0.25"
                placeholder="1.0"
                value={row.grade}
                onChange={(e) => updateRow(row.id, 'grade', e.target.value)}
                className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm text-center text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="h-9 rounded-[var(--radius-md)] text-xs text-[var(--color-error)] hover:bg-red-50 transition-colors"
                aria-label="Remove row"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <Button variant="ghost" className="mt-3" onClick={addRow}>
          + Add Subject
        </Button>
      </Card>

      {/* Result */}
      {result !== null && (
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-lighter)]">
              <TrendingUp className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Computed GWA ({result.validCount} subjects, {result.totalUnits} units)
              </p>
              <p className={`text-2xl font-bold ${gwaColor}`}>{result.gwa.toFixed(4)}</p>
            </div>
            <div className="ml-auto">
              {result.gwa <= 3.0 ? (
                <Badge variant="success" label="Passing" />
              ) : (
                <Badge variant="error" label="Below Passing" />
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function TargetCalculator() {
  const [currentGwa, setCurrentGwa] = useState('')
  const [currentUnits, setCurrentUnits] = useState('')
  const [targetGwa, setTargetGwa] = useState('')
  const [newUnits, setNewUnits] = useState('')

  const result = useMemo(() => {
    const cGwa = parseFloat(currentGwa)
    const cUnits = parseFloat(currentUnits)
    const tGwa = parseFloat(targetGwa)
    const nUnits = parseFloat(newUnits)

    if ([cGwa, cUnits, tGwa, nUnits].some(isNaN)) return null
    if (cUnits <= 0 || nUnits <= 0) return null
    if (tGwa < 1.0 || tGwa > 5.0) return null

    // Required grade = (target * totalUnits - current * currentUnits) / newUnits
    const totalUnits = cUnits + nUnits
    const required = (tGwa * totalUnits - cGwa * cUnits) / nUnits

    const achievable = required >= 1.0 && required <= 5.0
    const passing = required <= 3.0

    return { required, achievable, passing, totalUnits }
  }, [currentGwa, currentUnits, targetGwa, newUnits])

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-4 font-display text-sm font-bold text-[var(--color-text-primary)]">
          What Grade Do I Need?
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Current GWA"
            type="number"
            min="1.0"
            max="5.0"
            step="0.01"
            placeholder="e.g. 1.75"
            value={currentGwa}
            onChange={(e) => setCurrentGwa(e.target.value)}
            helperText="Your current weighted average (1.0 - 5.0)"
          />
          <Input
            label="Current Total Units"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 21"
            value={currentUnits}
            onChange={(e) => setCurrentUnits(e.target.value)}
            helperText="Total units taken so far"
          />
          <Input
            label="Target GWA"
            type="number"
            min="1.0"
            max="5.0"
            step="0.01"
            placeholder="e.g. 1.50"
            value={targetGwa}
            onChange={(e) => setTargetGwa(e.target.value)}
            helperText="The GWA you want to achieve"
          />
          <Input
            label="New Subject Units"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 18"
            value={newUnits}
            onChange={(e) => setNewUnits(e.target.value)}
            helperText="Total units you will take next"
          />
        </div>
      </Card>

      {/* Result */}
      {result !== null && (
        <Card
          className={`border-l-4 ${
            !result.achievable
              ? 'border-l-[var(--color-error)]'
              : result.passing
                ? 'border-l-green-500'
                : 'border-l-amber-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1">
              {result.achievable ? (
                <>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    You need a weighted average of:
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      result.passing ? 'text-green-700' : 'text-amber-700'
                    }`}
                  >
                    {result.required.toFixed(4)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    across your next {newUnits} units to achieve a {targetGwa} GWA
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[var(--color-error)]">
                    Not Achievable
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {result.required < 1.0
                      ? `The required grade (${result.required.toFixed(2)}) is below 1.0, which means your target is already exceeded. You are doing great!`
                      : `The required grade (${result.required.toFixed(2)}) exceeds 5.0. You would need more units or a different target GWA.`}
                  </p>
                </>
              )}
            </div>
            <div>
              {!result.achievable ? (
                result.required < 1.0 ? (
                  <Badge variant="success" label="Already Met!" />
                ) : (
                  <Badge variant="error" label="Impossible" />
                )
              ) : result.passing ? (
                <Badge variant="success" label="Achievable" />
              ) : (
                <Badge variant="warning" label="Difficult" />
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
