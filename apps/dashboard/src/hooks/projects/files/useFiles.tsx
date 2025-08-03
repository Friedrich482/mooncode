import { PERIODS_CONFIG } from "@/constants";
import { ProjectParamsSchema } from "@/types-schemas";
import { usePeriodStore } from "@/hooks/store/periodStore";
import useSafeParams from "@/hooks/useSafeParams";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

const useFiles = (
  languagesToFetch: string[] | undefined,
  amount: number | undefined,
  isSortedDesc: boolean,
) => {
  const { projectName: name } = useSafeParams(ProjectParamsSchema);
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const trpc = useTRPC();

  const { data: filesData } = useSuspenseQuery(
    trpc.filesStats.getProjectFilesOnPeriod.queryOptions(
      period === "Custom Range"
        ? {
            name,
            start: customRange.start,
            end: customRange.end,
            languages: languagesToFetch,
            amount,
          }
        : {
            name,
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            languages: languagesToFetch,
            amount,
          },
    ),
  );

  const files = Object.entries(filesData);

  const groups = Object.entries(
    files.reduce(
      (
        acc: {
          [languageSlug: string]: ((typeof files)[number][1] & {
            filePath: string;
          })[];
        },
        [filePath, file],
      ) => {
        const { languageSlug } = file;

        if (!acc[languageSlug]) {
          acc[languageSlug] = [];
        }

        acc[languageSlug].push({ ...file, filePath });

        return acc;
      },
      {},
    ),
  ).map(
    ([languageSlug, rest]) =>
      [
        {
          languageSlug,
          totalTimeSpentOnLanguage: rest.reduce(
            (acc, value) => acc + value.totalTimeSpent,
            0,
          ),
        },
        rest,
        //  we need to type it as a tuple to get proper type inference
      ] as [
        {
          languageSlug: string;
          totalTimeSpentOnLanguage: number;
        },
        typeof rest,
      ],
  );

  return isSortedDesc
    ? { groups, files }
    : {
        groups: [...groups].reverse(),
        files: [...files].reverse(),
      };
};

export default useFiles;
