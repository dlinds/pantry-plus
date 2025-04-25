import { useAtom } from "jotai";
import { recipesAtom, selectedRecipeIdAtom } from "./atoms";

export function RecipeList() {
  const [recipes] = useAtom(recipesAtom);
  const [selectedId, setSelectedId] = useAtom(selectedRecipeIdAtom);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Recipes</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className={`border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
              selectedId === recipe.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedId(recipe.id)}
          >
            {recipe.imageUrl && (
              <div className="h-48 overflow-hidden">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
              <p className="text-gray-600 mb-2">{recipe.description}</p>
              <div className="flex text-sm text-gray-500">
                <span className="mr-4">Prep: {recipe.prepTime} min</span>
                <span>Cook: {recipe.cookTime} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
