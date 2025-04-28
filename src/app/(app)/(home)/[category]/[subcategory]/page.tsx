import React from "react";

interface Props {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}
const CategoryPage = async ({ params }: Props) => {
  const { category, subcategory } = await params;

  return (
    <div>
      CategoryPage: {category}
      <br />
      SubCategoryPage: {subcategory}
    </div>
  );
};

export default CategoryPage;
