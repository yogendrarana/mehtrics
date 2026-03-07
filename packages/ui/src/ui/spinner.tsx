import { Loader } from "lucide-react";

import { cn } from "@mehtrics/utils/cn";

function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader>) {
  return (
    <Loader
      aria-label="Loading"
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
