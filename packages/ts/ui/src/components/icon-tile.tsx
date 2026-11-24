import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../cn";

/**
 * Small square (or circle) that holds one icon. Monochrome by design.
 * Need a colour? Add a token in theme.css and a tone here.
 */
const iconTileVariants = cva(
  "flex size-9 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      tone: {
        muted: "bg-muted text-foreground",
        primary: "bg-primary text-primary-foreground",
        outline: "border border-border bg-background text-foreground",
      },
      shape: {
        square: "rounded-lg",
        round: "rounded-full",
      },
    },
    defaultVariants: {
      tone: "muted",
      shape: "square",
    },
  },
);

function IconTile({
  className,
  tone,
  shape,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof iconTileVariants>) {
  return (
    <span
      data-slot="icon-tile"
      className={cn(iconTileVariants({ tone, shape }), className)}
      {...props}
    />
  );
}

export { IconTile };
