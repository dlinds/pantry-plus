import { atom } from "jotai";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime: number; // in minutes
  prepTime: number; // in minutes
  imageUrl?: string;
}

// Initial recipe data
const initialRecipes: Recipe[] = [
  {
    id: "1",
    title: "Spaghetti Carbonara",
    description:
      "A classic Italian pasta dish with eggs, cheese, pancetta, and pepper.",
    ingredients: [
      "1 pound spaghetti",
      "2 large eggs",
      "1 cup grated Pecorino Romano",
      "4 oz pancetta, diced",
      "4 garlic cloves, minced",
      "Freshly ground black pepper",
      "Salt",
    ],
    instructions: [
      "Bring a large pot of salted water to boil and cook spaghetti according to package directions.",
      "While pasta cooks, heat a large skillet over medium heat. Add pancetta and cook until crispy.",
      "In a bowl, whisk together eggs and cheese. Season with pepper.",
      "Drain pasta, reserving 1/2 cup pasta water.",
      "Working quickly, add hot pasta to skillet with pancetta. Toss to combine.",
      "Remove from heat and add egg mixture, tossing continuously until creamy. Add pasta water as needed.",
      "Serve immediately with extra cheese and pepper.",
    ],
    cookTime: 15,
    prepTime: 10,
    imageUrl: "https://example.com/carbonara.jpg",
  },
  {
    id: "2",
    title: "Chicken Stir-Fry",
    description: "A quick and healthy stir-fry with chicken and vegetables.",
    ingredients: [
      "1 pound chicken breast, cut into strips",
      "2 cups mixed vegetables (bell peppers, broccoli, carrots)",
      "2 cloves garlic, minced",
      "1 tablespoon ginger, minced",
      "3 tablespoons soy sauce",
      "1 tablespoon sesame oil",
      "2 tablespoons vegetable oil",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Heat vegetable oil in a large wok or skillet over high heat.",
      "Add chicken and stir-fry until cooked through, about 5-6 minutes.",
      "Remove chicken and set aside.",
      "Add vegetables, garlic, and ginger to the wok and stir-fry for 3-4 minutes.",
      "Return chicken to the wok. Add soy sauce and sesame oil.",
      "Stir-fry for another 1-2 minutes until everything is well combined.",
      "Season with salt and pepper to taste.",
      "Serve hot over rice.",
    ],
    cookTime: 15,
    prepTime: 10,
  },
];

// Atom for the list of recipes
export const recipesAtom = atom<Recipe[]>(initialRecipes);

// Atom for the selected recipe
export const selectedRecipeIdAtom = atom<string | null>(null);

// Derived atom for getting the selected recipe
export const selectedRecipeAtom = atom((get) => {
  const recipes = get(recipesAtom);
  const selectedId = get(selectedRecipeIdAtom);

  if (!selectedId) return null;

  return recipes.find((recipe) => recipe.id === selectedId) || null;
});
