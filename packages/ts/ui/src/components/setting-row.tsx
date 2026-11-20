import * as React from "react";

import { cn } from "../cn";

/**
 * One settings line: optional leading media (IconTile, Avatar), a title with a
 * description, and a trailing action (Switch, Button, Badge) passed as children.
 */
function SettingRow({
  className,
  media,
  title,
  description,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  media?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div data-slot="setting-row" className={cn("flex items-start gap-3", className)} {...props}>
      {media}
      <div className="min-w-0 flex-1">
        <p className="title-row text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

export { SettingRow };
