"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";

export const FadeContent = ({
  direction = "up",
  children,
  className = "",
  staggerChildren = 0.1,
  as = "div",
}: {
  direction?: "up" | "down";
  children: React.ReactNode;
  className?: string;
  staggerChildren?: number;
  as?: keyof typeof motion;
}) => {
  const fadeVariants = {
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
    hidden: { opacity: 0, y: direction === "down" ? -18 : 18 },
  } as const;

  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  const Container = motion[as] as typeof motion.div;

  return (
    <Container
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
          },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Use the child's own element type to avoid extra wrapper divs
        const childType = typeof child.type === "string" ? child.type : "div";
        const MotionChild = motion.create(childType) as typeof motion.div;

        const {
          children: childChildren,
          className,
          ...childProps
        } = child.props as React.ComponentProps<typeof motion.div>;

        return (
          <MotionChild
            variants={fadeVariants}
            className={className}
            {...childProps}
          >
            {childChildren}
          </MotionChild>
        );
      })}
    </Container>
  );
};
