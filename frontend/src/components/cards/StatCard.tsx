import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'

export interface StatCardProps {
  label: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: { value: string; positive?: boolean }
  className?: string
}

export function StatCard({ label, value, description, icon, trend, className }: StatCardProps) {
  return (
    <Card hoverable className={cn('transition-colors hover:border-primary/20', className)}>
      <CardHeader className="mb-2 !flex-row items-start justify-between">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-1 text-2xl font-bold">{value}</CardTitle>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      {(description || trend) && (
        <CardContent>
          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend.positive ? 'text-secondary' : 'text-error',
              )}
            >
              {trend.value}
            </span>
          )}
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </CardContent>
      )}
    </Card>
  )
}
