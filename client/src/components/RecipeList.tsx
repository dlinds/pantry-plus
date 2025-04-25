"use client";

import { useAtom } from "jotai";
import { recipesAtom } from "@/store/atoms";
import RecipeCard from "./RecipeCard";

interface RecipeListProps {
  title?: string;
}

export default function RecipeList({ title = "Recipes" }: RecipeListProps) {
  const [recipes] = useAtom(recipesAtom);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
