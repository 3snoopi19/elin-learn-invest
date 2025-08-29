import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  animated?: boolean;
}

export const ResponsiveContainer = ({
  children,
  className = "",
  size = "lg",
  animated = false,
}: ResponsiveContainerProps) => {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none"
  };

  const Container = animated ? motion.div : "div";

  const containerProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <Container
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...containerProps}
    >
      {children}
    </Container>
  );
};