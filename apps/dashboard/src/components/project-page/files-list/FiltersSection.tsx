import { ArrowUpDown } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";

const FiltersSection = ({
  limitInput,
  isGrouped,
  handleLimitInputChange,
  handleCheckChange,
  handleSortButtonClick,
}: {
  limitInput: string;
  isGrouped: boolean;
  // eslint-disable-next-line no-unused-vars
  handleLimitInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckChange: () => void;
  handleSortButtonClick: () => void;
}) => (
  <>
    <div className="flex gap-4">
      <Input
        value={limitInput}
        aria-label="limit"
        placeholder="Enter a limit"
        onChange={handleLimitInputChange}
      />
    </div>
    <div className="flex gap-4">
      <p>Group</p>
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
  </>
);

export default FiltersSection;
