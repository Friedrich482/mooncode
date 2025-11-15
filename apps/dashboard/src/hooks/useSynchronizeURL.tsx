import { useEffect } from "react";
import { useSearchParams } from "react-router";

import convertToISODate from "@repo/common/convertToISODate";

import { usePeriodStore } from "./store/periodStore";

const useSynchronizeURL = () => {
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const groupBy = usePeriodStore((state) => state.groupBy);

  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (period !== "Custom Range") {
      if (groupBy && groupBy !== "days") {
        setSearchParams({ period, groupBy });
        return;
      }
      setSearchParams({ period });
      return;
    }

    if (groupBy && groupBy !== "days") {
      setSearchParams({
        start: convertToISODate(customRange.start),
        end: convertToISODate(customRange.end),
        groupBy,
      });
      return;
    }
    setSearchParams({
      start: convertToISODate(customRange.start),
      end: convertToISODate(customRange.end),
    });
  }, [period, customRange.start, customRange.end, groupBy]);
};

export default useSynchronizeURL;
