import { z } from "zod";

import { formatDuration } from "@repo/common/format-duration";
import { getLanguageName } from "@repo/ui/utils/get-language-name";

export const CustomChartToolTip = (
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
          className="size-3 rounded-xs"
          style={{
            backgroundColor: safeColor,
          }}
        />
      ) : null}
      {languageSlug && <span>{getLanguageName(languageSlug)}</span>}
      <span className="text-muted-foreground flex-1">
        {!Number.isNaN(value) ? formatDuration(value) : "######"}{" "}
        {percentage !== undefined && `(${percentage}%)`}
      </span>
    </div>
  );
};
