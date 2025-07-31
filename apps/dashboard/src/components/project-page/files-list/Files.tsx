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
      {isGrouped
        ? groups.map(([languageSlug, files]) => (
            <ul
              key={languageSlug}
              className="relative rounded-md rounded-l-none border p-4"
              style={{ borderColor: getLanguageColor(languageSlug) }}
            >
              <span
                className="text-normal absolute -left-[1px] -top-11 rounded-tr-md p-2"
                style={{ backgroundColor: getLanguageColor(languageSlug) }}
              >
                {getLanguageName(languageSlug)}
              </span>
              {files.map(({ filePath, name, totalTimeSpent }) => (
                <li key={filePath} className="flex gap-x-3" title={filePath}>
                  <span className="whitespace-nowrap font-light">
                    {formatDuration(totalTimeSpent)}
                  </span>
                  <span className="min-h-9 w-full overflow-hidden text-ellipsis whitespace-nowrap font-bold">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          ))
        : files.map(([filePath, { name, totalTimeSpent }]) => (
            <li key={filePath} className="flex gap-x-3" title={filePath}>
              <span className="whitespace-nowrap font-light">
                {formatDuration(totalTimeSpent)}
              </span>
              <span className="min-h-9 w-full overflow-hidden text-ellipsis whitespace-nowrap font-bold">
                {name}
              </span>
            </li>
          ))}
    </ul>
  );
};

export default Files;
