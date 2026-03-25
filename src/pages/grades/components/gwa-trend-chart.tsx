import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { GRADE_SCALE } from '@/utils/constants'
import { getGwaTrendData, type SemesterInfo } from '@/utils/calculate-gwa'

interface GwaTrendChartProps {
  semesters: SemesterInfo[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-md)]">
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p className="font-display text-lg font-bold text-[var(--color-text-primary)]">
        {payload[0].value.toFixed(2)}
      </p>
    </div>
  )
}

export function GwaTrendChart({ semesters }: GwaTrendChartProps) {
  const data = getGwaTrendData(semesters)

  if (data.length < 2) {
    return (
      <Card>
        <h3 className="mb-2 font-display text-lg font-semibold text-[var(--color-text-primary)]">
          GWA Trend
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          GWA trend chart will appear after completing at least 2 semesters.
        </p>
      </Card>
    )
  }

  const lastGwa = data[data.length - 1]?.gwa

  return (
    <Card>
      <h3 className="mb-4 font-display text-lg font-semibold text-[var(--color-text-primary)]">
        GWA Trend
      </h3>
      <div
        className="h-64 w-full"
        role="img"
        aria-label={`GWA trend chart showing performance across ${data.length} semesters. Most recent GWA: ${lastGwa?.toFixed(2) ?? 'N/A'}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              reversed
              domain={[GRADE_SCALE.HIGHEST, GRADE_SCALE.PASSING]}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickCount={5}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={1.5}
              stroke="var(--color-accent)"
              strokeDasharray="4 4"
              label={{
                value: "Dean's List",
                position: 'right',
                fontSize: 10,
                fill: 'var(--color-accent)',
              }}
            />
            <Line
              type="monotone"
              dataKey="gwa"
              stroke="#0D1B3E"
              strokeWidth={2.5}
              dot={{
                r: 5,
                fill: '#0D1B3E',
                stroke: '#FFFFFF',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: '#F5A623',
                stroke: '#0D1B3E',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-xs text-[var(--color-text-secondary)]">
        Lower GWA is better (1.0 = highest, 3.0 = passing)
      </p>
    </Card>
  )
}
