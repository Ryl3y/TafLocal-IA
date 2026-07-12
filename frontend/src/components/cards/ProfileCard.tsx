import { Mail, MapPin } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './Card'

export interface ProfileCardProps {
  name: string
  headline?: string
  location?: string
  email?: string
  avatarUrl?: string
  skills?: string[]
  employabilityScore?: number
  onEdit?: () => void
  onView?: () => void
  isLoading?: boolean
  className?: string
}

export function ProfileCard({
  name,
  headline,
  location,
  email,
  avatarUrl,
  skills = [],
  employabilityScore,
  onEdit,
  onView,
  isLoading = false,
  className,
}: ProfileCardProps) {
  return (
    <Card
      hoverable
      className={cn('text-center sm:text-left', isLoading && 'opacity-70', className)}
      aria-busy={isLoading}
    >
      <CardHeader className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar src={avatarUrl} alt={name} fallback={name} size="xl" />
        <div className="flex-1">
          <CardTitle>{name}</CardTitle>
          {headline && <p className="mt-1 text-sm text-muted">{headline}</p>}
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-muted sm:justify-start">
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {location}
              </span>
            )}
            {email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {email}
              </span>
            )}
          </div>
          {employabilityScore !== undefined && (
            <Badge variant="primary" className="mt-3">
              Score employabilité : {employabilityScore}%
            </Badge>
          )}
        </div>
      </CardHeader>

      {skills.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}

      <CardFooter className="justify-center sm:justify-start">
        <Button variant="outline" size="sm" onClick={onView} disabled={isLoading}>
          Voir le profil
        </Button>
        <Button variant="primary" size="sm" onClick={onEdit} isLoading={isLoading}>
          Modifier
        </Button>
      </CardFooter>
    </Card>
  )
}
