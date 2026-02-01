import { memo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { getLanguageColor } from "@repo/ui/utils/get-language-color";

import { Bubble } from "../types-schemas";

export const NodeSVG = memo(function ({ bubble }: { bubble: Bubble }) {
  return (
    <g key={bubble.data.key} transform={`translate(${bubble.x}, ${bubble.y})`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <circle
            cx={0}
            cy={0}
            r={bubble.r}
            fill={getLanguageColor(bubble.data.key)}
            fillOpacity={0.5}
            stroke={getLanguageColor(bubble.data.key)}
            strokeWidth={2}
            className="cursor-pointer"
            tabIndex={0}
            role="img"
            aria-label={bubble.data.name}
          />
        </TooltipTrigger>
        <TooltipContent>{bubble.data.name}</TooltipContent>
      </Tooltip>
    </g>
  );
});
