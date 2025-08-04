import { Pause, Play, RotateCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import Icon from "@repo/ui/components/ui/Icon";
import { Tree } from "@/types-schemas";
import { bubblesColors } from "@/constants";
import formatDuration from "@repo/common/formatDuration";
import useAnimateChart from "@/hooks/useAnimateChart";

export const CircularPacking = ({
  data,
  parentDivRef,
}: {
  data: Tree;
  parentDivRef: React.RefObject<HTMLDivElement>;
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
      <div className="flex w-28 items-center justify-end gap-5 self-end rounded-md border p-1">
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
                fill="hsl(var(--muted-foreground))"
              >
                {bubble.data.name}
              </tspan>
              <tspan
                x={0}
                dy="1.2em"
                fill="hsl(var(--muted-foreground))"
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
