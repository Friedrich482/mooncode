import { RefObject, useEffect, useState } from "react";
import OptionsSection from "./OptionsSection";
import { Tree } from "@/types-schemas";
import { bubblesColors } from "@/constants";
import formatDuration from "@repo/common/formatDuration";
import useAnimateChart from "@/hooks/useAnimateChart";

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
  } = useAnimateChart(data, width, height);

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

  return (
    <>
      <OptionsSection
        isAnimating={isAnimating}
        isGrouped={isGrouped}
        handleToggleAnimationButtonClick={handleToggleAnimationButtonClick}
        handleResetButtonClick={handleResetButtonClick}
        handleGroupCheckboxChange={handleGroupCheckboxChange}
      />
      <svg width={width} height={height} className="-translate-x-3">
        {bubbles.map((bubble, index) => (
          <g
            key={bubble.data.key}
            transform={`translate(${bubble.x}, ${bubble.y})`}
          >
            <circle
              cx={0}
              cy={0}
              r={bubble.r}
              fill={bubblesColors[index]}
              className="w-full cursor-pointer"
              onClick={() => handleBubbleClick(index)}
            />
            <text
              x={0}
              y={0}
              fontSize={Math.max((bubble.data.value / maxValue) * 20, 10)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="cursor-pointer"
            >
              <tspan
                x={0}
                className="font-extrabold"
                fill="var(--muted-foreground)"
              >
                {bubble.data.name}
              </tspan>
              <tspan
                x={0}
                dy="1.2em"
                fill="var(--muted-foreground)"
                className="font-light"
              >
                {formatDuration(bubble.data.value)}
              </tspan>
            </text>
          </g>
        ))}
      </svg>
    </>
  );
};

export default CircularPacking;
