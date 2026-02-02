import { ArrowUpDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";

import { formatDuration } from "@repo/common/format-duration";
import { Button } from "@repo/ui/components/ui/button";
import { Icon } from "@repo/ui/components/ui/icon";
import { getLanguageName } from "@repo/ui/utils/get-language-name";

export const FilesGroupHeader = ({
  languageColor,
  languageSlug,
  isLanguageAscSorted,
  isLanguageCollapsed,
  totalTimeSpentOnLanguage,
  handleSortButtonClick,
  handleCollapseButtonClick,
}: {
  languageColor: string;
  languageSlug: string;
  totalTimeSpentOnLanguage: number;
  isLanguageCollapsed: boolean;
  isLanguageAscSorted: boolean;
  handleSortButtonClick: (languageSlug: string) => void;
  handleCollapseButtonClick: (languageSlug: string) => void;
}) => (
  <div className="flex w-full justify-between">
    <div className="">
      <span
        className="text-primary-foreground inline-block rounded-tr-md p-2"
        style={{
          backgroundColor: languageColor,
        }}
      >
        {getLanguageName(languageSlug)}
      </span>
      <span className="text-primary p-2 max-[34.375rem]:hidden">
        {formatDuration(totalTimeSpentOnLanguage)}
      </span>
    </div>

    <div className="flex items-center justify-center gap-2">
      <Button
        className="flex items-center gap-4 max-[23rem]:hidden"
        variant="secondary"
        onClick={() => handleSortButtonClick(languageSlug)}
        aria-label={`Sort files ${isLanguageAscSorted ? "descending" : "ascending"}`}
        title={`Click to sort ${isLanguageAscSorted ? "descending" : "ascending"}`}
      >
        <p>Sort {isLanguageAscSorted ? "↑" : "↓"}</p>
        <ArrowUpDown />
      </Button>
      <Icon
        Icon={isLanguageCollapsed ? ChevronsUpDown : ChevronsDownUp}
        onClick={() => handleCollapseButtonClick(languageSlug)}
        aria-label="collapse language"
        title={!isLanguageCollapsed ? "collapse" : "extend"}
        className="size-9 max-[25rem]:hidden"
      />
    </div>
  </div>
);
