import { Category } from "@/payload-types";
import { CategoryDropdown } from "./cateory-dropdown";

interface CategoriesProps {
  data: any;
}
export const Categories = ({ data }: CategoriesProps) => {
  return (
    <div className="">
      {data.map((category: Category) => (
        <div className="" key={category.id}>
          <CategoryDropdown
            category={category}
            isActive={false} // TODO: Implement active state
            isNavigationHover={false} // TODO: Implement hover state
          />
        </div>
      ))}
    </div>
  );
};
