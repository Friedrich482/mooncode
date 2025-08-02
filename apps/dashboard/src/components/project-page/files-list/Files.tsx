import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import Icon from "@repo/ui/components/ui/Icon";
import { cn } from "@repo/ui/lib/utils";
import formatDuration from "@repo/common/formatDuration";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";
import getLanguageName from "@repo/ui/utils/getLanguageName";
import useFiles from "@/hooks/projects/useFiles";
import { useState } from "react";

const Files = ({
  languagesToFetch,
  isGrouped,
}: {
  languagesToFetch: string[] | undefined;
  isGrouped: boolean;
}) => {
  const { files, groups } = useFiles(languagesToFetch);

  const [collapsedLanguages, setCollapsedLanguages] = useState<string[]>([]);

  const isLanguageCollapsed = (languageSlug: string) =>
    collapsedLanguages.includes(languageSlug);

  const handleCollapseButtonClick = (languageSlug: string) => {
    setCollapsedLanguages(
      isLanguageCollapsed(languageSlug)
        ? collapsedLanguages.filter((entry) => entry !== languageSlug)
        : [...collapsedLanguages, languageSlug],
    );
  };

  return (
    <ul className={cn("flex flex-col", isGrouped && "space-y-16")}>
      {isGrouped ? (
        groups.map(
          ([{ languageSlug, totalTimeSpentOnLanguage }, groupedFiles]) => (
            <ul
              key={languageSlug}
              className={cn(
                "relative rounded-md rounded-l-none border-t-[1px]",
                !isLanguageCollapsed(languageSlug) && "border p-4",
              )}
              style={{ borderColor: getLanguageColor(languageSlug) }}
            >
              <div className="absolute -left-[1px] -top-11 gap-2 space-x-2">
                <span
                  className="inline-block h-full rounded-tr-md p-2 text-primary-foreground"
                  style={{ backgroundColor: getLanguageColor(languageSlug) }}
                >
                  {getLanguageName(languageSlug)}
                </span>
                <span className="p-2 text-primary">
                  {formatDuration(totalTimeSpentOnLanguage)}
                </span>
              </div>
              <Icon
                Icon={
                  isLanguageCollapsed(languageSlug)
                    ? ChevronsUpDown
                    : ChevronsDownUp
                }
                className="absolute -top-11 right-0"
                onClick={() => handleCollapseButtonClick(languageSlug)}
                aria-label="collapse language"
                title="collapse"
              />
              {!isLanguageCollapsed(languageSlug) && (
                <TooltipProvider>
                  {groupedFiles.map(({ filePath, name, totalTimeSpent }) => (
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
                  ))}
                </TooltipProvider>
              )}
            </ul>
          ),
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
