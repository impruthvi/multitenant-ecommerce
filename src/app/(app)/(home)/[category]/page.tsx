import { caller } from "@/trpc/server";
import React from "react";

interface Props {
  params: Promise<{
    category: string;
  }>;
}
const SubCategoryPage = async ({ params }: Props) => {
  const { category } = await params;
  const products = await caller.products.getMany();

  return (
    <div>
      CategoryPage: {category}
      <br />
      {JSON.stringify(products, null, 2)}
    </div>
  );
};

export default SubCategoryPage;
