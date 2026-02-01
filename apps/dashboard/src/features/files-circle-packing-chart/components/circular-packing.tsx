import { RefObject, useEffect, useState } from "react";

import { TooltipProvider } from "@repo/ui/components/ui/tooltip";

import { useAnimateChart } from "../hooks/use-animate-chart";
import { Tree } from "../types-schemas";
import { LeafSVG } from "./leaf-svg";
import { NodeSVG } from "./node-svg";
import { OptionsSection } from "./options-section";

export const CircularPacking = ({
  data,
  parentDivRef,
  isGrouped,
  handleGroupCheckboxChange,
}: {
  data: Tree;
  parentDivRef: RefObject<HTMLDivElement | null>;
  isGrouped: boolean;
  handleGroupCheckboxChange: () => void;
}) => {
  const [width, setWidth] = useState(
    parentDivRef.current?.clientWidth ?? (window.innerWidth * 5) / 6,
  );
  const [height, setHeight] = useState((window.innerWidth * 2) / 3);

  const {
    bubbles,
    handleBubbleClick,
    isAnimating,
    maxValue,
    handleResetButtonClick,
    handleToggleAnimationButtonClick,
  } = useAnimateChart(data, width, height, isGrouped);

  const handleWindowResize = () => {
    setWidth(parentDivRef.current?.clientWidth ?? (window.innerWidth * 5) / 6);
    setHeight((window.innerWidth * 2) / 3);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const nodesBubbles = bubbles.filter((bubble) => bubble.depth === 1);
  const leavesBubbles = bubbles.filter((bubble) => bubble.depth === 2);

  return (
    <TooltipProvider>
      <OptionsSection
        isAnimating={isAnimating}
        isGrouped={isGrouped}
        handleToggleAnimationButtonClick={handleToggleAnimationButtonClick}
        handleResetButtonClick={handleResetButtonClick}
        handleGroupCheckboxChange={handleGroupCheckboxChange}
      />
      <svg width={width} height={height} className="-translate-x-3">
        {!isGrouped ? (
          bubbles.map((bubble, index) => (
            <LeafSVG
              bubble={bubble}
              index={index}
              handleBubbleClick={handleBubbleClick}
              maxValue={maxValue}
              key={bubble.data.key}
            />
          ))
        ) : (
          <>
            {nodesBubbles.map((node) => (
              <NodeSVG bubble={node} key={node.data.key} />
            ))}

            {leavesBubbles.map((leaf, index) => (
              <LeafSVG
                bubble={leaf}
                index={index}
                handleBubbleClick={handleBubbleClick}
                maxValue={maxValue}
                key={leaf.data.key}
              />
            ))}
          </>
        )}
      </svg>
    </TooltipProvider>
  );
};
