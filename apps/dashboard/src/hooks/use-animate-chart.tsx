import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  hierarchy as d3Hierarchy,
  HierarchyCircularNode,
  pack,
} from "d3-hierarchy";

import { Tree } from "@/types-schemas";
import {
  checkCollision,
  handleCollisionBetweenNodeAndLeaf,
  handleCollisionBetweenSiblings,
} from "@/utils/chart-animation";

export const useAnimateChart = (
  data: Tree,
  width: number,
  height: number,
  isGrouped: boolean,
) => {
  const [dataSet, setDataSet] = useState<HierarchyCircularNode<Tree>[]>([]);

  const maxValue = useMemo(
    () => Math.max(...dataSet.map((entry) => entry.data.value)),
    [dataSet],
  );

  const initialBubbles = useMemo(
    () =>
      dataSet.map((node) => ({
        ...node,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })),
    [dataSet],
  );

  const [bubbles, setBubbles] = useState(initialBubbles);
  const animationRef = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const boundaryMargin = useMemo(
    () => Math.min(width, height) * 0.001,
    [width, height],
  );

  // instantiate the dataSet
  useEffect(() => {
    const hierarchy = d3Hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value! - a.value!);

    const packGenerator = pack<Tree>().size([width, height]).padding(0);
    const root = packGenerator(hierarchy);
    setDataSet(root.descendants().slice(1));
  }, [width, height, data]);

  // instantiate the bubbles
  useEffect(() => {
    setBubbles(initialBubbles);
  }, [initialBubbles]);

  const animate = () => {
    if (!isAnimating) return;

    setBubbles((prevBubbles) => {
      const newBubbles = prevBubbles.map((bubble) => ({ ...bubble }));

      const centerX = width / 2;
      const centerY = height / 2;

      // Update positions
      newBubbles.forEach((bubble) => {
        // Force toward center
        const dx = centerX - bubble.x;
        const dy = centerY - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const centerForce = 0.002; // Pulls bubbles to center
          bubble.vx += (dx / distance) * centerForce;
          bubble.vy += (dy / distance) * centerForce;
        }

        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        // Keep bubbles in central area
        if (bubble.x - bubble.r <= boundaryMargin) {
          bubble.x = boundaryMargin + bubble.r;
          bubble.vx = Math.abs(bubble.vx) * 0.5;
        }
        if (bubble.x + bubble.r >= width - boundaryMargin) {
          bubble.x = width - boundaryMargin - bubble.r;
          bubble.vx = -Math.abs(bubble.vx) * 0.5;
        }
        if (bubble.y - bubble.r <= boundaryMargin) {
          bubble.y = boundaryMargin + bubble.r;
          bubble.vy = Math.abs(bubble.vy) * 0.5;
        }
        if (bubble.y + bubble.r >= height - boundaryMargin) {
          bubble.y = height - boundaryMargin - bubble.r;
          bubble.vy = -Math.abs(bubble.vy) * 0.5;
        }

        const maxVelocity = 10.5;
        const currentSpeed = Math.sqrt(
          bubble.vx * bubble.vx + bubble.vy * bubble.vy,
        );
        if (currentSpeed > maxVelocity) {
          bubble.vx = (bubble.vx / currentSpeed) * maxVelocity;
          bubble.vy = (bubble.vy / currentSpeed) * maxVelocity;
        }
      });

      // Check collisions between all pairs
      for (let i = 0; i < newBubbles.length; i++) {
        for (let j = i + 1; j < newBubbles.length; j++) {
          if (checkCollision(newBubbles[i], newBubbles[j])) {
            if (
              !isGrouped ||
              // in this case they are grouped
              // if the two bubbles are both nodes or leaves (i.e, if either both are languages or both are files)
              newBubbles[i].depth === newBubbles[j].depth
            ) {
              handleCollisionBetweenSiblings(newBubbles[i], newBubbles[j]);
              continue;
            }

            // nodes have a depth of 1 meanwhile leaves has depth 2
            else if (
              newBubbles[i].depth < newBubbles[j].depth &&
              newBubbles[j].parent?.data.key === newBubbles[i].data.key
            ) {
              handleCollisionBetweenNodeAndLeaf(newBubbles[i], newBubbles[j]);
              continue;
            } else if (
              newBubbles[i].depth > newBubbles[j].depth &&
              newBubbles[i].parent?.data.key === newBubbles[j].data.key
            ) {
              handleCollisionBetweenNodeAndLeaf(newBubbles[j], newBubbles[i]);
              continue;
            }
          }
        }
      }

      return newBubbles;
    });

    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Start/stop animation
  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, dataSet]);

  // Add random impulse on click
  const handleBubbleClick = (index: number) => {
    setBubbles((prevBubbles) => {
      const newBubbles = [...prevBubbles];
      newBubbles[index] = {
        ...newBubbles[index],
        vx: newBubbles[index].vx + (Math.random() - 0.5) * 2,
        vy: newBubbles[index].vy + (Math.random() - 0.5) * 2,
      };
      return newBubbles;
    });
  };

  const handleResetButtonClick = useCallback(
    () => setBubbles(initialBubbles),
    [initialBubbles],
  );

  const handleToggleAnimationButtonClick = useCallback(
    () => setIsAnimating((prev) => !prev),
    [isAnimating],
  );

  return {
    maxValue,
    bubbles,
    isAnimating,
    handleBubbleClick,
    handleToggleAnimationButtonClick,
    handleResetButtonClick,
  };
};
