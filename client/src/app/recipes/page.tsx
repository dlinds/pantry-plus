import RecipeList from "@/components/RecipeList";

export default function RecipesPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Recipes</h1>
        <RecipeList title="Browse All Recipes" />
      </div>
    </main>
  );
}
