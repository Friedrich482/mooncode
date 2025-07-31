import formatDuration from "@repo/common/formatDuration";
import getLanguageName from "@repo/ui/utils/getLanguageName";
import { z } from "zod";

const CustomChartToolTip = (
  value: number,
  color?: unknown,
  languageSlug?: string,
  percentage?: number,
) => {
  const safeColor = (() => {
    try {
      return z.string().min(2).parse(color);
    } catch (e) {
      console.error("Invalid color:", e instanceof Error ? e.message : e);
      return "var(--color-time)";
    }
  })();

  return (
    <div className="flex flex-1 items-center justify-center gap-2 leading-none">
      {color ? (
        <div
          className="size-3 rounded-sm"
          style={{
            backgroundColor: safeColor,
          }}
        />
      ) : null}
      {languageSlug && <span>{getLanguageName(languageSlug)}</span>}
      <span className="flex-1 text-muted-foreground">
        {!Number.isNaN(value) ? formatDuration(value) : "######"}{" "}
        {percentage && `(${percentage}%)`}
      </span>
    </div>
  );
};

export default CustomChartToolTip;
