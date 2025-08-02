import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";

const FiltersSection = ({
  limitInput,
  isGrouped,
  handleLimitInputChange,
  handleCheckChange,
}: {
  limitInput: string;
  isGrouped: boolean;
  // eslint-disable-next-line no-unused-vars
  handleLimitInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckChange: () => void;
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
  </>
);

export default FiltersSection;
