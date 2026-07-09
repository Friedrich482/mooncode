import { useLoaderData } from "react-router";

import { projectLoader } from "@/loaders/project-loader";
import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useFiles = (
  languagesToFetch: string[] | undefined,
  page: number,
  searchTerm: string,
  isSortedDesc: boolean,
) => {
  const { projectName: name } = useLoaderData<typeof projectLoader>();

  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);
  const trpc = useTRPC();

  const search = searchTerm.trim().toLowerCase();

  const { data } = useSuspenseQuery(
    trpc.analytics.projects.getProjectFilesOnPeriod.queryOptions(
      period === "Custom Range"
        ? {
            name,
            start: customRange.start,
            end: customRange.end,
            languages: languagesToFetch,
            page,
            type: "paginated",
            search: search || undefined,
          }
        : {
            name,
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            languages: languagesToFetch,
            page,
            type: "paginated",
            search: search || undefined,
          },
    ),
  );

  const { projectFilesOnPeriod: filesData, hasNext } = data as {
    projectFilesOnPeriod: {
      [filePath: string]: {
        totalTimeSpent: number;
        languageSlug: string;
        name: string;
      };
    };
    hasNext: boolean;
  };

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
  // the data initially returned by the server is in DESC order
  return isSortedDesc
    ? { groups, files, hasNext }
    : {
        groups: [...groups].reverse(),
        files: [...files].reverse(),
        hasNext,
      };
};
