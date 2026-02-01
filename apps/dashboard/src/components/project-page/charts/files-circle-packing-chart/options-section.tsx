import { memo } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Icon } from "@repo/ui/components/ui/icon";

export const OptionsSection = memo(function ({
  isAnimating,
  isGrouped,
  handleToggleAnimationButtonClick,
  handleResetButtonClick,
  handleGroupCheckboxChange,
}: {
  isAnimating: boolean;
  isGrouped: boolean;
  handleToggleAnimationButtonClick: () => void;
  handleResetButtonClick: () => void;
  handleGroupCheckboxChange: () => void;
}) {
  return (
    <div className="flex w-64 items-center justify-end gap-4 self-end rounded-md border p-1">
      <div className="flex gap-4">
        <p>Group</p>
        <Checkbox
          className="size-8"
          checked={isGrouped}
          onCheckedChange={handleGroupCheckboxChange}
        />
      </div>
      <Icon
        Icon={isAnimating ? Pause : Play}
        onClick={handleToggleAnimationButtonClick}
        title={`${isAnimating ? "Pause" : "Play"} animation`}
        aria-label={`${isAnimating ? "Pause" : "Play"} animation`}
      />
      <Icon
        Icon={RotateCcw}
        onClick={handleResetButtonClick}
        title="Reset animation"
        aria-label="Reset animation"
      />
    </div>
  );
});
