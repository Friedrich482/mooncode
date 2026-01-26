import { ChevronDown } from "lucide-react";

import useLanguagesDropDown from "@/hooks/useLanguagesDropDown";
import { Entry } from "@/types-schemas";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

const LanguagesDropDown = ({
  selectedEntries,
  handleCheckEntry,
}: {
  selectedEntries: Entry[];
  handleCheckEntry: (entry: Entry) => void;
}) => {
  const languagesToDisplay = useLanguagesDropDown();

  const isChecked = (entry: Entry) =>
    selectedEntries.some((elt) => elt.languageSlug === entry.languageSlug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center justify-center gap-2"
        >
          <span>Languages</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-2" align="start">
        {languagesToDisplay.length === 0
          ? "No entry"
          : languagesToDisplay.map((entry) => (
              <DropdownMenuCheckboxItem
                checked={isChecked(entry)}
                key={entry.languageSlug}
                onCheckedChange={() => handleCheckEntry(entry)}
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer gap-3 rounded-md py-1 text-base"
              >
                <span
                  className="size-4 rounded-full"
                  style={{
                    backgroundColor: entry.color,
                  }}
                />
                <span>{entry.languageName}</span>
              </DropdownMenuCheckboxItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguagesDropDown;
