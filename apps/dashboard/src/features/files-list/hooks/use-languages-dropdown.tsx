import { useLoaderData } from "react-router";

import { projectLoader } from "@/loaders/project-loader";
import { useBranchesStore } from "@/stores/branches/branches-store";
import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
import { getLanguageColor } from "@repo/ui/utils/get-language-color";
import { getLanguageName } from "@repo/ui/utils/get-language-name";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Entry } from "../types-schemas";

export const useLanguagesDropDown = () => {
  const { projectName: name } = useLoaderData<typeof projectLoader>();

  const trpc = useTRPC();
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const branches = useBranchesStore((state) => state.branches);

  const { data: fetchedData } = useSuspenseQuery(
    trpc.analytics.projects.getProjectLanguagesTimeOnPeriod.queryOptions(
      period === "Custom Range"
        ? { name, start: customRange.start, end: customRange.end, branches }
        : {
            name,
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            branches,
          },
    ),
  );

  const languagesToDisplay: Entry[] = fetchedData.map((entry) => ({
    languageName: getLanguageName(entry.languageSlug),
    color: getLanguageColor(entry.languageSlug),
    languageSlug: entry.languageSlug,
  }));

  return languagesToDisplay;
};
