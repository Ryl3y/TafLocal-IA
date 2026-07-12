import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../cards/Card'
import { Loader } from '../feedback/Loader'

export interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
  isLoading?: boolean
  className?: string
}

export function ChartCard({
  title,
  description,
  children,
  action,
  isLoading = false,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader size="md" label="" />
          </div>
        ) : (
          <div className="h-48 w-full">{children}</div>
        )}
      </CardContent>
    </Card>
  )
}
