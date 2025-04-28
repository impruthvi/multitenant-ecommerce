import React from "react";

interface Props {
  params: Promise<{
    category: string;
  }>;
}
const SubCategoryPage = async ({ params }: Props) => {
    const { category } = await params;


  return <div>CategoryPage: {category}</div>;
};

export default SubCategoryPage;
