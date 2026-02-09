import { Clock, CheckCircle2 } from "lucide-react";
import type { RequestStatus } from "@/lib/types";

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string; Icon: typeof Clock }
> = {
  pending: {
    label: "申請中",
    className: "bg-warning-light text-warning",
    Icon: Clock,
  },
  issued: {
    label: "発行済",
    className: "bg-success-light text-success",
    Icon: CheckCircle2,
  },
};

interface StatusBadgeProps {
  status: RequestStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
