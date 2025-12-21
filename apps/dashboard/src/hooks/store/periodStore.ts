import { create } from "zustand";

import { Period } from "@/types-schemas";
import correctGroupBy from "@/utils/correctGroupBy";
import getPeriodStoreValuesFromURL from "@/utils/getPeriodStoreValuesFromURL";
import convertToISODate from "@repo/common/convertToISODate";
import type { GroupBy, PeriodResolution } from "@repo/common/types-schemas";

type Store = {
  period: Period;
  setPeriod: (state: Period) => void;

  groupBy: GroupBy;
  setGroupBy: (state: GroupBy) => void;

  customRange: {
    start: string;
    end: string;
    periodResolution: PeriodResolution;
  };
  setCustomRange: (state: {
    start: string;
    end: string;
    periodResolution: PeriodResolution;
  }) => void;
};

const { period, customRange, groupBy } = getPeriodStoreValuesFromURL();
// don't trust the groupBy from the url, it doesn't necessary fit the periodResolution
// it can be "weeks" for periods like "Last 7 days", "This week" or "Last week"
const correctedGroupBy = correctGroupBy(period, customRange, groupBy);

export const usePeriodStore = create<Store>((set, get) => ({
  period,
  setPeriod: (newPeriod) => {
    set({ period: newPeriod });
    updateURLFromState({ ...get(), period: newPeriod });
  },

  groupBy: correctedGroupBy,
  setGroupBy: (newGroupBy) => {
    set({ groupBy: newGroupBy });
    updateURLFromState({ ...get(), groupBy: newGroupBy });
  },

  customRange,
  setCustomRange: (newCustomRange) => {
    set({ customRange: newCustomRange });
    updateURLFromState({ ...get(), customRange: newCustomRange });
  },
}));

const updateURLFromState = (state: Store) => {
  const searchParams = new URLSearchParams(window.location.search);

  if (state.period !== "Custom Range") {
    searchParams.delete("start");
    searchParams.delete("end");
    searchParams.set("period", state.period);

    if (state.groupBy && state.groupBy !== "days") {
      searchParams.set("groupBy", state.groupBy);
    } else {
      searchParams.delete("groupBy");
    }
  } else {
    searchParams.delete("period");
    searchParams.set("start", convertToISODate(state.customRange.start));
    searchParams.set("end", convertToISODate(state.customRange.end));

    if (state.groupBy && state.groupBy !== "days") {
      searchParams.set("groupBy", state.groupBy);
    } else {
      searchParams.delete("groupBy");
    }
  }

  window.history.replaceState(null, "", `?${searchParams.toString()}`);
};
