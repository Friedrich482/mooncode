import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import formatDuration from "@repo/common/formatDuration";
import getLanguageColor from "@repo/ui/utils/getLanguageColor";
import getLanguageName from "@repo/ui/utils/getLanguageName";
import useFiles from "@/hooks/projects/useFiles";

const Files = ({
  languagesToFetch,
  isGrouped,
}: {
  languagesToFetch: string[] | undefined;
  isGrouped: boolean;
}) => {
  const { files, groups } = useFiles(languagesToFetch);

  return (
    <ul className={cn("flex flex-col", isGrouped && "space-y-16")}>
      {isGrouped ? (
        groups.map(([{ languageSlug, totalTimeSpentOnLanguage }, files]) => (
          <ul
            key={languageSlug}
            className="relative rounded-md rounded-l-none border p-4"
            style={{ borderColor: getLanguageColor(languageSlug) }}
          >
            <span
              className="text-normal absolute -left-[1px] -top-11 rounded-tr-md p-2"
              style={{ backgroundColor: getLanguageColor(languageSlug) }}
            >
              {getLanguageName(languageSlug)}{" "}
              {formatDuration(totalTimeSpentOnLanguage)}
            </span>

            <TooltipProvider>
              {files.map(({ filePath, name, totalTimeSpent }) => (
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
          </ul>
        ))
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
