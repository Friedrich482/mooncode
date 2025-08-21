import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Bubble } from "@/types-schemas";
import { bubblesColors } from "@/constants";
import formatDuration from "@repo/common/formatDuration";
import { memo } from "react";

const LeafSVG = memo(function ({
  bubble,
  index,
  maxValue,
  handleBubbleClick,
}: {
  bubble: Bubble;
  index: number;
  maxValue: number;
  // eslint-disable-next-line no-unused-vars
  handleBubbleClick: (index: number) => void;
}) {
  return (
    <g transform={`translate(${bubble.x}, ${bubble.y})`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <circle
            cx={0}
            cy={0}
            r={bubble.r}
            fill={bubblesColors[index]}
            className="w-full cursor-pointer"
            onClick={() => {
              handleBubbleClick(index);
            }}
          />
        </TooltipTrigger>

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
        <TooltipContent>{bubble.data.key}</TooltipContent>
      </Tooltip>
    </g>
  );
});

export default LeafSVG;
