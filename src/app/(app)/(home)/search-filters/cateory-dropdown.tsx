import React from "react";
import { Category } from "@/payload-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  category: Category;
  isActive?: boolean;
  isNavigationHover?: boolean;
}

export const CategoryDropdown = ({
  category,
  isActive,
  isNavigationHover,
}: Props) => {
  return (
    <Button
      variant="elevated"
      className={cn(
        "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
        isActive && !isNavigationHover && "bg-white border-primary"
      )}
    >
      {category.name}
    </Button>
  );
};
