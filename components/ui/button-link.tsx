import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "dark";
};

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-12 items-center justify-center border px-6 text-sm font-black transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700",
        variant === "primary"
          ? "border-emerald-950 bg-emerald-950 text-white hover:bg-emerald-800"
          : variant === "dark"
            ? "border-emerald-950 bg-emerald-950 text-white hover:bg-white hover:text-emerald-950"
            : "border-emerald-950/25 bg-transparent text-emerald-950 hover:border-emerald-950",
        className,
      )}
      {...props}
    />
  );
}
