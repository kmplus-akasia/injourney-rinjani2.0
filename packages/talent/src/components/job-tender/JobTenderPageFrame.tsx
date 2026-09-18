import type { ReactNode } from "react";
import { Layout } from "@/components/shell/Layout";
import { cn } from "@/components/ui/utils";

export function JobTenderPageFrame({
  children,
  className,
  maxWidthClassName = "max-w-[var(--layout-max-width-workspace)]",
}: {
  children: ReactNode;
  className?: string;
  maxWidthClassName?: string;
}) {
  return (
    <Layout>
      <div className={cn("mx-auto space-y-6 px-4 pb-10 pt-8 md:px-6 lg:px-8", maxWidthClassName, className)}>
        {children}
      </div>
    </Layout>
  );
}
