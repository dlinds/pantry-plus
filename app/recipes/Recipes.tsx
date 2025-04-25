import { useAtom } from "jotai";
import { selectedRecipeIdAtom } from "./atoms";
import { RecipeList } from "./RecipeList";
import { RecipeDetail } from "./RecipeDetail";

export function Recipes() {
  const [selectedRecipeId] = useAtom(selectedRecipeIdAtom);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Pantry Plus</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {selectedRecipeId ? <RecipeDetail /> : <RecipeList />}
      </main>
    </div>
  );
}
