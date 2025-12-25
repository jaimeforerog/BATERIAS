import { Badge } from "@/components/ui/badge";
import { BatteryStatus } from "@/api/types/enums";
import { batteryStatusLabels, batteryStatusColors } from "@/utils/enumTranslations";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: BatteryStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = batteryStatusLabels[status];
  const colorClass = batteryStatusColors[status];

  return (
    <Badge
      variant="outline"
      className={cn(colorClass, className)}
    >
      {label}
    </Badge>
  );
}
