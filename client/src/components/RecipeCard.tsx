"use client";

import { Recipe } from "@/store/atoms";
import Link from "next/link";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
        <p className="text-gray-700 mb-3 line-clamp-2">{recipe.description}</p>

        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <div>Prep: {recipe.prepTime} min</div>
          <div>Cook: {recipe.cookTime} min</div>
          <div>Serves: {recipe.servings}</div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/recipes/${recipe.id}`}
          className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
}
