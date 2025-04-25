"use client";

import { useAtom } from "jotai";
import { recipesAtom } from "@/store/atoms";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function RecipeDetail() {
  const [recipes] = useAtom(recipesAtom);
  const params = useParams();
  const recipeId = params.id as string;

  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Recipe Not Found</h1>
          <p className="mb-8">
            The recipe you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/recipes"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition-colors"
          >
            Back to Recipes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/recipes"
            className="text-blue-500 hover:underline inline-flex items-center"
          >
            ← Back to Recipes
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-80 overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
            <p className="text-gray-700 mb-6">{recipe.description}</p>

            <div className="flex justify-between text-sm text-gray-500 mb-6 p-4 bg-gray-50 rounded">
              <div>
                <span className="block font-bold">Prep Time</span>
                {recipe.prepTime} minutes
              </div>
              <div>
                <span className="block font-bold">Cook Time</span>
                {recipe.cookTime} minutes
              </div>
              <div>
                <span className="block font-bold">Servings</span>
                {recipe.servings}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Ingredients</h2>
              <ul className="list-disc pl-5 space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Instructions</h2>
              <ol className="list-decimal pl-5 space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="pl-2">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
