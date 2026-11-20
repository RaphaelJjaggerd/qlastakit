import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "../cn";

function Separator({
  className,
  orientation = "horizontal",
  variant = "default",
  ...props
}: SeparatorPrimitive.Props & {
  /** "etched": engraved line (dark line + light edge) from the etched tokens. */
  variant?: "default" | "etched";
}) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      data-variant={variant}
      orientation={orientation}
      className={cn(
        "shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        variant === "etched"
          ? "bg-etched-line data-horizontal:shadow-etched-h data-vertical:shadow-etched-v"
          : "bg-border",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
