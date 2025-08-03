import { ArrowUpDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import Icon from "@repo/ui/components/ui/Icon";
import formatDuration from "@repo/common/formatDuration";
import getLanguageName from "@repo/ui/utils/getLanguageName";

const FilesGroupHeader = ({
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
  // eslint-disable-next-line no-unused-vars
  handleSortButtonClick: (languageSlug: string) => void;
  // eslint-disable-next-line no-unused-vars
  handleCollapseButtonClick: (languageSlug: string) => void;
}) => (
  <div className="flex w-full justify-between">
    <div className="">
      <span
        className="inline-block rounded-tr-md p-2 text-primary-foreground"
        style={{
          backgroundColor: languageColor,
        }}
      >
        {getLanguageName(languageSlug)}
      </span>
      <span className="p-2 text-primary max-[34.375rem]:hidden">
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
export default FilesGroupHeader;
