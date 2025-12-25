import { Badge } from "@/components/ui/badge";
import { HealthStatus } from "@/api/types/enums";
import { healthStatusLabels, healthStatusColors } from "@/utils/enumTranslations";
import { cn } from "@/lib/utils";

interface HealthStatusBadgeProps {
  status: HealthStatus;
  className?: string;
}

export function HealthStatusBadge({ status, className }: HealthStatusBadgeProps) {
  const label = healthStatusLabels[status];
  const colorClass = healthStatusColors[status];

  return (
    <Badge
      variant="outline"
      className={cn(colorClass, className)}
    >
      {label}
    </Badge>
  );
}
