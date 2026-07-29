// page.tsx
import { Suspense } from "react";
import { getCategories } from "@/lib/actions/categories/categories";
import CategoriesClient from "./categories-client";

async function CategoriesData() {
  const categories = await getCategories(); // auth() runs here, inside Suspense
  return <CategoriesClient categories={categories} />;
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesData />
    </Suspense>
  );
}

function CategoriesSkeleton() {
  return <div className="p-6">Loading categories...</div>;
}