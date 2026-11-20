import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "../cn";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        // Physical toggle: recessed track + raised thumb (switch tokens)
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent px-0.5 shadow-switch-track transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-5 data-[size=default]:w-10 data-[size=sm]:h-4 data-[size=sm]:w-8 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-switch-track-checked data-unchecked:bg-switch-track data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-switch-thumb shadow-switch-thumb ring-0 transition-transform group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-2.5 data-unchecked:translate-x-0 data-checked:shadow-switch-thumb-checked group-data-[size=default]/switch:data-checked:translate-x-[22px] rtl:group-data-[size=default]/switch:data-checked:-translate-x-[22px] group-data-[size=sm]/switch:data-checked:translate-x-[18px] rtl:group-data-[size=sm]/switch:data-checked:-translate-x-[18px]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
