import { useLoaderData } from "react-router";

import { PERIODS_CONFIG } from "@/constants";
import { Entry } from "@/types-schemas";
import projectLoader from "@/utils/loader/projectLoader";
import { useTRPC } from "@/utils/trpc";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";
import getLanguageName from "@repo/ui/utils/getLanguageName";
import { useSuspenseQuery } from "@tanstack/react-query";

import { usePeriodStore } from "./store/periodStore";

const useLanguagesDropDown = ({
  selectedEntries,
  setSelectedEntries,
}: {
  selectedEntries: Entry[];
  setSelectedEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
}) => {
  const { projectName: name } = useLoaderData<typeof projectLoader>();

  const trpc = useTRPC();
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);

  const { data: fetchedData } = useSuspenseQuery(
    trpc.filesStats.getProjectLanguagesTimeOnPeriod.queryOptions(
      period === "Custom Range"
        ? { name, start: customRange.start, end: customRange.end }
        : {
            name,
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
          },
    ),
  );

  const languagesToDisplay: Entry[] = fetchedData.map((entry) => ({
    languageName: getLanguageName(entry.languageSlug),
    color: getLanguageColor(entry.languageSlug),
    languageSlug: entry.languageSlug,
  }));

  const handleCheck = (entry: Entry) =>
    setSelectedEntries((prev) => {
      const isEntryExisting = prev.some(
        (elt) => elt.languageSlug === entry.languageSlug,
      );

      return isEntryExisting
        ? prev.filter((elt) => elt.languageSlug !== entry.languageSlug)
        : [...prev, entry];
    });

  const isChecked = (entry: Entry) =>
    selectedEntries.some((elt) => elt.languageSlug === entry.languageSlug);

  return { handleCheck, isChecked, languagesToDisplay };
};

export default useLanguagesDropDown;
