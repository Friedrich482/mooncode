import { ArrowUpDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Button } from "@repo/ui/components/ui/button";
import Icon from "@repo/ui/components/ui/Icon";
import { cn } from "@repo/ui/lib/utils";
import formatDuration from "@repo/common/formatDuration";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";
import getLanguageName from "@repo/ui/utils/getLanguageName";
import useFiles from "@/hooks/projects/files/useFiles";
import { useState } from "react";

const Files = ({
  languagesToFetch,
  isGrouped,
  amount,
  isSortedDesc,
}: {
  languagesToFetch: string[] | undefined;
  isGrouped: boolean;
  isSortedDesc: boolean;
  amount: number | undefined;
}) => {
  const { files, groups } = useFiles(languagesToFetch, amount, isSortedDesc);

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

  return (
    <ul className={cn("flex flex-col", isGrouped && "space-y-16")}>
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
              <ul
                key={languageSlug}
                className={cn(
                  "relative rounded-md rounded-l-none border-t-[1px]",
                  !isLanguageCollapsed && "border p-4",
                )}
                style={{ borderColor: languageColor }}
              >
                <div className="absolute -left-[1px] -top-11 flex w-full justify-between">
                  <div>
                    <span
                      className="inline-block h-full rounded-tr-md p-2 text-primary-foreground"
                      style={{
                        backgroundColor: languageColor,
                      }}
                    >
                      {getLanguageName(languageSlug)}
                    </span>
                    <span className="p-2 text-primary">
                      {formatDuration(totalTimeSpentOnLanguage)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      className="flex items-center gap-4"
                      variant="secondary"
                      onClick={() => handleSortButtonClick(languageSlug)}
                      aria-label={`Sort files ${isLanguageAscSorted ? "descending" : "ascending"}`}
                      title={`Currently sorted ${isLanguageAscSorted ? "ascending" : "descending"}`}
                    >
                      <p>Sort {isLanguageAscSorted ? "↑" : "↓"}</p>
                      <ArrowUpDown />
                    </Button>
                    <Icon
                      Icon={
                        isLanguageCollapsed ? ChevronsUpDown : ChevronsDownUp
                      }
                      onClick={() => handleCollapseButtonClick(languageSlug)}
                      aria-label="collapse language"
                      title={!isLanguageCollapsed ? "collapse" : "extend"}
                    />
                  </div>
                </div>
                {!isLanguageCollapsed && (
                  <TooltipProvider>
                    {sortedGroupedFiles.map(
                      ({ filePath, name, totalTimeSpent }) => (
                        <li key={filePath}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-block min-h-9 space-x-4">
                                <span className="min-h-9 w-full overflow-hidden text-ellipsis whitespace-nowrap font-extrabold">
                                  &bull; {name}
                                </span>
                                <span className="whitespace-nowrap font-extralight">
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
            );
          },
        )
      ) : (
        <TooltipProvider>
          {files.map(([filePath, { name, totalTimeSpent }]) => (
            <li key={filePath}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block min-h-9 space-x-4">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap font-extrabold">
                      &bull; {name}
                    </span>
                    <span className="whitespace-nowrap font-extralight">
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
};

export default Files;
