import { cn } from "@qlastakit/ui";

interface LogoProps {
  className?: string;
  /** Show the app name next to the mark. */
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  /** "rail": inverted mark for the dark icon rail. */
  tone?: "default" | "rail";
  /** The app name, from config through the message files. Never hardcode it here. */
  name: string;
}

const sizes = { sm: "size-7", md: "size-8", lg: "size-10" };

export function Logo({
  className,
  showText = false,
  tone = "default",
  size = "md",
  name,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          sizes[size],
          tone === "rail" ? "bg-rail-foreground text-rail" : "bg-primary text-primary-foreground",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </div>
      {showText && <span className="text-lg font-semibold text-foreground">{name}</span>}
    </div>
  );
}
