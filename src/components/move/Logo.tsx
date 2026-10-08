import { cn } from "@/lib/utils";

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold tracking-tight", className)}>
      <span className="relative grid h-7 w-7 place-items-center rounded-md bg-signal text-signal-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18 L10 6 L14 14 L20 4" />
        </svg>
      </span>
      <span className={inverted ? "text-navy-foreground" : "text-foreground"}>
        A Ponto <span className="text-signal">MOVE</span>
      </span>
    </span>
  );
}
