import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Entry } from "@/types-schemas";
import useLanguagesDropDown from "@/hooks/useLanguagesDropDown";

const LanguagesDropDown = ({
  selectedEntries,
  setSelectedEntries,
}: {
  selectedEntries: Entry[];
  setSelectedEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
}) => {
  const { handleCheck, isChecked, languagesToDisplay } = useLanguagesDropDown({
    selectedEntries,
    setSelectedEntries,
  });

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
        {languagesToDisplay.map((entry) => (
          <DropdownMenuCheckboxItem
            checked={isChecked(entry)}
            key={entry.languageSlug}
            onCheckedChange={() => handleCheck(entry)}
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
