import { Category } from "@/payload-types";
import { CategoryDropdown } from "./category-dropdown";
import { CustomCategory } from "../types";

interface CategoriesProps {
  data: CustomCategory[];
}
export const Categories = ({ data }: CategoriesProps) => {
  return (
    <div className="relative w-full">
      <div className="flex flex-nowrap items-center">
        {data.map((category) => (
          <div className="" key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={false} // TODO: Implement active state
              isNavigationHover={false} // TODO: Implement hover state
            />
          </div>
        ))}
      </div>
    </div>
  );
};
