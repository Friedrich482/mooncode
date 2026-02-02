import { cn } from "@repo/ui/lib/utils";

export const ChartGroupWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "max-chart:flex-col max-chart:gap-20 flex items-center justify-between",
        className,
      )}
    >
      {children}
    </section>
  );
};
