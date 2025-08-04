import { cn } from "@repo/ui/lib/utils";

const ChartGroupWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "flex items-center justify-between max-chart:flex-col max-chart:gap-20",
        className,
      )}
    >
      {children}
    </section>
  );
};

export default ChartGroupWrapper;
