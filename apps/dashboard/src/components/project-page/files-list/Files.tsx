import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { memo, useState } from "react";
import FilesGroupHeader from "./FilesGroupHeader";
import { cn } from "@repo/ui/lib/utils";
import formatDuration from "@repo/common/formatDuration";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";
import useFiles from "@/hooks/projects/files/useFiles";

const Files = memo(function Files({
  languagesToFetch,
  amount,
  searchTerm,
  isGrouped,
  isSortedDesc,
}: {
  languagesToFetch: string[] | undefined;
  amount: number | undefined;
  searchTerm: string;
  isGrouped: boolean;
  isSortedDesc: boolean;
}) {
  const { files, groups } = useFiles(
    languagesToFetch,
    amount,
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
                    "rounded-md rounded-l-none border-t-[1px]",
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
                                  <span className="min-h-9 overflow-hidden text-ellipsis whitespace-nowrap font-extrabold">
                                    &bull; {name}
                                  </span>
                                  <span className="overflow-hidden text-ellipsis whitespace-nowrap font-extralight">
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
                    <span className="min-h-9 overflow-hidden text-ellipsis whitespace-nowrap font-extrabold">
                      &bull; {name}
                    </span>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap font-extralight">
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
  );
});

export default Files;
