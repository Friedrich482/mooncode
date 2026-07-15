import { useRef, useState } from "react";
import { useLoaderData } from "react-router";

import { projectLoader } from "@/loaders/project-loader";
import { useBranchesStore } from "@/stores/branches/branches-store";
import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
import { getLanguageName } from "@repo/ui/utils/get-language-name";
import { useSuspenseQuery } from "@tanstack/react-query";

import { NUMBER_OF_FILES_TO_SHOW } from "../constants";
import { Tree } from "../types-schemas";
import { CircularPacking } from "./circular-packing";

export const FilesCirclePackingChart = () => {
  const { projectName: name } = useLoaderData<typeof projectLoader>();

  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);

  const branches = useBranchesStore((state) => state.branches);

  const [isGrouped, setIsGrouped] = useState(true);
  const handleGroupCheckboxChange = () => setIsGrouped((prev) => !prev);

  const trpc = useTRPC();

  const { data: fetched } = useSuspenseQuery(
    trpc.analytics.projects.getProjectFilesOnPeriod.queryOptions(
      period === "Custom Range"
        ? {
            name,
            start: customRange.start,
            end: customRange.end,
            amount: NUMBER_OF_FILES_TO_SHOW,
            type: "normal" as const,
            branches,
          }
        : {
            name,
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            amount: NUMBER_OF_FILES_TO_SHOW,
            type: "normal" as const,
            branches,
          },
    ),
  );

  const childrenArray = Object.entries(
    fetched as {
      [filePath: string]: {
        totalTimeSpent: number;
        languageSlug: string;
        name: string;
      };
    },
  );

  const groups = Object.entries(
    childrenArray.reduce(
      (
        acc: {
          [languageSlug: string]: ((typeof childrenArray)[number][1] & {
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

  const data: Tree = !isGrouped
    ? {
        type: "node",
        name: "files",
        value: 0,
        key: "mainNode",
        children: childrenArray.map(([path, { name, totalTimeSpent }]) => ({
          type: "leaf",
          name,
          value: totalTimeSpent,
          key: path,
        })),
      }
    : {
        type: "node",
        name: "files",
        value: 0,
        key: "mainNode",
        children: groups.map(
          ([{ languageSlug, totalTimeSpentOnLanguage }, entry]) => ({
            type: "node",
            name: getLanguageName(languageSlug),
            value: totalTimeSpentOnLanguage,
            key: languageSlug,
            children: entry.map(
              ({ filePath, name: fileName, totalTimeSpent }) => ({
                type: "leaf",
                name: fileName,
                key: filePath,
                value: totalTimeSpent,
              }),
            ),
          }),
        ),
      };

  const parentDivRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex min-h-96 w-full flex-col gap-y-6 self-center rounded-md border p-3 text-2xl"
      ref={parentDivRef}
    >
      <h2 className="text-center text-2xl font-bold">Most used files</h2>
      <CircularPacking
        data={data}
        isGrouped={isGrouped}
        parentDivRef={parentDivRef}
        handleGroupCheckboxChange={handleGroupCheckboxChange}
      />
    </div>
  );
};
