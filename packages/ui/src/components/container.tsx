import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@mehtrics/utils";

const containerVariants = cva(
  "h-full w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-[200px]",
  {
    variants: {
      yPadding: {
        none: "py-0",
        sm: "py-4 md:py-6",
        md: "py-8 md:py-16",
        base: "py-20 md:py-32",
      },
    },
    defaultVariants: {
      yPadding: "none",
    },
  }
);

type ContainerProps<T extends React.ElementType> = {
  as?: T;
  collapsible?: boolean;
  className?: string;
  children?: React.ReactNode;
} & VariantProps<typeof containerVariants> &
  Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">;

function Container<T extends React.ElementType = "div">({
  as,
  yPadding,
  collapsible = true,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Comp = as || "div";

  return (
    <Comp
      data-collapsible={collapsible}
      className={cn(containerVariants({ yPadding }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export {
  Container,
  containerVariants,
  type ContainerProps,
};