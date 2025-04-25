import { useAtom } from "jotai";
import { selectedRecipeAtom, selectedRecipeIdAtom } from "./atoms";

export function RecipeDetail() {
  const [selectedRecipe] = useAtom(selectedRecipeAtom);
  const [, setSelectedRecipeId] = useAtom(selectedRecipeIdAtom);

  if (!selectedRecipe) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => setSelectedRecipeId(null)}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
      >
        ← Back to Recipes
      </button>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {selectedRecipe.imageUrl && (
          <div className="h-64 overflow-hidden">
            <img
              src={selectedRecipe.imageUrl}
              alt={selectedRecipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{selectedRecipe.title}</h1>
          <p className="text-gray-700 mb-4">{selectedRecipe.description}</p>

          <div className="flex mb-6 text-gray-600">
            <div className="mr-6">
              <span className="font-semibold">Prep time:</span>{" "}
              {selectedRecipe.prepTime} min
            </div>
            <div>
              <span className="font-semibold">Cook time:</span>{" "}
              {selectedRecipe.cookTime} min
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-disc ml-6 space-y-1">
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <ol className="list-decimal ml-6 space-y-3">
              {selectedRecipe.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
