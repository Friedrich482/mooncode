import { useEffect } from "react";

import { DATE_LOCALE } from "@repo/common/constants";
import getPeriodResolution from "@repo/common/getPeriodResolution";

import { usePeriodStore } from "./store/periodStore";

const useUpdateCustomRangeDates = (startDate: Date, endDate: Date) => {
  const customRange = usePeriodStore((state) => state.customRange);
  const setCustomRange = usePeriodStore((state) => state.setCustomRange);
  const periodResolution = getPeriodResolution(startDate, endDate);

  useEffect(
    () =>
      setCustomRange({
        start: startDate.toLocaleDateString(DATE_LOCALE),
        end: customRange.end,
        periodResolution,
      }),
    [startDate],
  );

  useEffect(
    () =>
      setCustomRange({
        start: customRange.start,
        end: endDate.toLocaleDateString(DATE_LOCALE),
        periodResolution,
      }),
    [endDate],
  );
};

export default useUpdateCustomRangeDates;
