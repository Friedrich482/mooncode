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
  resetSVGDimensions,
}: {
  isAnimating: boolean;
  isGrouped: boolean;
  handleToggleAnimationButtonClick: () => void;
  handleResetButtonClick: () => void;
  handleGroupCheckboxChange: () => void;
  resetSVGDimensions: () => void;
}) {
  return (
    <div className="flex w-64 items-center justify-end gap-4 self-end rounded-md border p-1 max-[27rem]:w-full max-[26rem]:flex-wrap">
      <div className="flex gap-4">
        <span className="max-[18.75rem]:hidden">Group</span>
        <Checkbox
          className="size-8"
          checked={isGrouped}
          onCheckedChange={() => {
            handleGroupCheckboxChange();
            resetSVGDimensions();
          }}
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
