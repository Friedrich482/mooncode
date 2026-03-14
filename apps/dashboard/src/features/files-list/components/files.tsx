import { memo, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";

import { usePeriodStore } from "@/stores/period/period-store";
import { formatDuration } from "@repo/common/format-duration";
import { Icon } from "@repo/ui/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { getLanguageColor } from "@repo/ui/utils/get-language-color";

import { useFiles } from "../hooks/use-files";
import { FilesGroupHeader } from "./files-group-header";

export const Files = memo(function Files({
  languagesToFetch,
  searchTerm,
  isGrouped,
  isSortedDesc,
}: {
  languagesToFetch: string[] | undefined;
  searchTerm: string;
  isGrouped: boolean;
  isSortedDesc: boolean;
}) {
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);

  const [page, setPage] = useState(1);
  const handlePreviousPageButtonClick = () => setPage((prev) => prev - 1);
  const handleNextPageButtonClick = () => setPage((prev) => prev + 1);
  const handleGoBackToFirstPageButtonClick = () => setPage(1);

  useEffect(() => {
    setPage(1);
  }, [
    period,
    customRange.start,
    customRange.end,
    languagesToFetch,
    searchTerm,
  ]);

  const { files, groups, hasNext } = useFiles(
    languagesToFetch,
    page,
    searchTerm,
    isSortedDesc,
  );

  const [collapsedLanguages, setCollapsedLanguages] = useState<string[]>([]);
  const getIsLanguageCollapsed = (languageSlug: string) =>
    collapsedLanguages.includes(languageSlug);
  const handleCollapseButtonClick = (languageSlug: string) => {
    setCollapsedLanguages(
      getIsLanguageCollapsed(languageSlug)
        ? collapsedLanguages.filter((entry) => entry !== languageSlug)
        : [...collapsedLanguages, languageSlug],
    );
  };

  const [ascSortedLanguages, setAscSortedLanguages] = useState<string[]>([]);
  const getIsLanguageAscSorted = (languageSlug: string) =>
    ascSortedLanguages.includes(languageSlug);
  const handleSortButtonClick = (languageSlug: string) => {
    setAscSortedLanguages(
      getIsLanguageAscSorted(languageSlug)
        ? ascSortedLanguages.filter((entry) => entry !== languageSlug)
        : [...ascSortedLanguages, languageSlug],
    );
  };

  if (files.length === 0 || groups.length === 0) {
    return (
      <div className="h-24 w-full content-center text-center">
        No files found
      </div>
    );
  }

  return (
    <>
      <ul className={cn("flex w-full flex-col", isGrouped && "gap-y-4")}>
        {isGrouped
          ? groups.map(
              ([{ languageSlug, totalTimeSpentOnLanguage }, groupedFiles]) => {
                const languageColor = getLanguageColor(languageSlug);
                const isLanguageCollapsed =
                  getIsLanguageCollapsed(languageSlug);
                const isLanguageAscSorted =
                  getIsLanguageAscSorted(languageSlug);
                const sortedGroupedFiles = isLanguageAscSorted
                  ? [...groupedFiles].reverse()
                  : groupedFiles;

                return (
                  <div key={languageSlug} className="flex w-full flex-col">
                    <FilesGroupHeader
                      languageColor={languageColor}
                      languageSlug={languageSlug}
                      isLanguageAscSorted={isLanguageAscSorted}
                      isLanguageCollapsed={isLanguageCollapsed}
                      totalTimeSpentOnLanguage={totalTimeSpentOnLanguage}
                      handleCollapseButtonClick={handleCollapseButtonClick}
                      handleSortButtonClick={handleSortButtonClick}
                    />
                    <ul
                      className={cn(
                        "rounded-md rounded-l-none border-t",
                        !isLanguageCollapsed && "border p-4",
                      )}
                      style={{ borderColor: languageColor }}
                    >
                      {!isLanguageCollapsed &&
                        sortedGroupedFiles.map(
                          ({ filePath, name, totalTimeSpent }) => (
                            <li key={filePath}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="grid h-9 grid-cols-2 gap-4 truncate">
                                    <span className="min-w-0 truncate font-extrabold">
                                      &bull; {name}
                                    </span>
                                    <span className="min-w-0 truncate font-extralight">
                                      {formatDuration(totalTimeSpent)}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{filePath}</TooltipContent>
                              </Tooltip>
                            </li>
                          ),
                        )}
                    </ul>
                  </div>
                );
              },
            )
          : files.map(([filePath, { name, totalTimeSpent }]) => (
              <li key={filePath}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="grid h-9 grid-cols-2 gap-4 truncate">
                      <span className="min-w-0 truncate font-extrabold">
                        &bull; {name}
                      </span>
                      <span className="min-w-0 truncate font-extralight">
                        {formatDuration(totalTimeSpent)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{filePath}</TooltipContent>
                </Tooltip>
              </li>
            ))}
      </ul>

      {/* Pagination buttons */}
      <div className="mt-auto flex items-center justify-start gap-2">
        {page !== 1 && (
          <Icon
            Icon={ChevronsLeft}
            onClick={handleGoBackToFirstPageButtonClick}
            title="Go back to first Page"
          />
        )}
        <Icon
          Icon={ChevronLeft}
          onClick={handlePreviousPageButtonClick}
          disabled={page === 1}
          title="Previous Page"
          className="disabled:cursor-not-allowed"
        />
        <Icon
          Icon={ChevronRight}
          onClick={handleNextPageButtonClick}
          disabled={!hasNext}
          title="Next Page"
          className="disabled:cursor-not-allowed"
        />
      </div>
    </>
  );
});
