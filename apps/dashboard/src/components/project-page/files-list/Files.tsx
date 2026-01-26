import { memo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";

import useFiles from "@/hooks/projects/files/useFiles";
import formatDuration from "@repo/common/formatDuration";
import Icon from "@repo/ui/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";

import FilesGroupHeader from "./FilesGroupHeader";

const Files = memo(function Files({
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
  const [page, setPage] = useState(1);
  const handlePreviousPageButtonClick = () => setPage((prev) => prev - 1);
  const handleNextPageButtonClick = () => setPage((prev) => prev + 1);
  const handleGoBackToFirstPageButtonClick = () => setPage(1);

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
        {isGrouped ? (
          groups.map(
            ([{ languageSlug, totalTimeSpentOnLanguage }, groupedFiles]) => {
              const languageColor = getLanguageColor(languageSlug);
              const isLanguageCollapsed = getIsLanguageCollapsed(languageSlug);
              const isLanguageAscSorted = getIsLanguageAscSorted(languageSlug);
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
                    {!isLanguageCollapsed && (
                      <TooltipProvider>
                        {sortedGroupedFiles.map(
                          ({ filePath, name, totalTimeSpent }) => (
                            <li key={filePath}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex min-h-9 gap-4">
                                    <span className="min-h-9 overflow-hidden font-extrabold text-ellipsis whitespace-nowrap">
                                      &bull; {name}
                                    </span>
                                    <span className="overflow-hidden font-extralight text-ellipsis whitespace-nowrap">
                                      {formatDuration(totalTimeSpent)}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{filePath}</TooltipContent>
                              </Tooltip>
                            </li>
                          ),
                        )}
                      </TooltipProvider>
                    )}
                  </ul>
                </div>
              );
            },
          )
        ) : (
          <TooltipProvider>
            {files.map(([filePath, { name, totalTimeSpent }]) => (
              <li key={filePath}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex min-h-9 gap-4">
                      <span className="min-h-9 overflow-hidden font-extrabold text-ellipsis whitespace-nowrap">
                        &bull; {name}
                      </span>
                      <span className="overflow-hidden font-extralight text-ellipsis whitespace-nowrap">
                        {formatDuration(totalTimeSpent)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{filePath}</TooltipContent>
                </Tooltip>
              </li>
            ))}
          </TooltipProvider>
        )}
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

export default Files;
