import Image from "next/image";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  size?: number;
  compact?: boolean;
  showTagline?: boolean;
  className?: string;
};

export function BrandLogo({
  size = 28,
  compact = false,
  showTagline = false,
  className,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/logo.svg" alt="FlowCraft" width={size} height={size} priority unoptimized />
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-semibold text-text">FlowCraft</div>
          {showTagline ? <div className="text-xs text-muted">Workflow Builder</div> : null}
        </div>
      )}
    </div>
  );
}
