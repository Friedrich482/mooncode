import { ArrowUpDown } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";

export const FiltersSection = ({
  isGrouped,
  searchTerm,
  handleCheckChange,
  handleSortButtonClick,
  handleSearchInputChange,
}: {
  isGrouped: boolean;
  searchTerm: string;

  handleCheckChange: () => void;
  handleSortButtonClick: () => void;

  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <>
    <div className="flex gap-4">
      <p className="wrap-anywhere">Group</p>
      <Checkbox
        className="size-8"
        checked={isGrouped}
        onCheckedChange={handleCheckChange}
      />
    </div>

    <Button
      className="flex items-center gap-4"
      variant="secondary"
      onClick={handleSortButtonClick}
      aria-label="Sort files"
    >
      <span>Sort</span>
      <ArrowUpDown />
    </Button>

    <div>
      <Input
        value={searchTerm}
        aria-label="search file"
        placeholder="Search file..."
        onChange={handleSearchInputChange}
      />
    </div>
  </>
);
