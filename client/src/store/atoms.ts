import { atom } from "jotai";

// Define your atoms
export const counterAtom = atom(0);

// Example of a derived atom
export const doubleCounterAtom = atom((get) => get(counterAtom) * 2);

// Example of an atom with write function
export const incrementCounterAtom = atom(
  (get) => get(counterAtom),
  (get, set) => set(counterAtom, get(counterAtom) + 1)
);

// Atom for product search from Kroger API
export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export const searchTermAtom = atom("");
export const productsAtom = atom<Product[]>([]);
export const isLoadingAtom = atom(false);

// Recipe types and data
export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  tags: string[];
};

// Mock recipe data
export const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Spaghetti Carbonara",
    description:
      "A classic Italian pasta dish with eggs, cheese, and pancetta.",
    ingredients: [
      "400g spaghetti",
      "200g pancetta or bacon, diced",
      "3 large eggs",
      "75g Pecorino Romano, grated",
      "50g Parmesan, grated",
      "2 cloves garlic, minced",
      "Salt and black pepper to taste",
    ],
    instructions: [
      "Cook pasta in salted water according to package instructions.",
      "While pasta cooks, fry pancetta until crispy.",
      "Beat eggs and mix with grated cheeses and black pepper.",
      "Drain pasta, keeping a little water, and immediately add to the pancetta.",
      "Remove from heat and quickly add egg and cheese mixture, stirring constantly.",
      "The heat from the pasta will cook the eggs, creating a creamy sauce.",
    ],
    image:
      "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&auto=format&fit=crop",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    tags: ["Italian", "Pasta", "Quick"],
  },
  {
    id: "2",
    title: "Veggie Stir Fry",
    description: "A quick and healthy vegetable stir fry with a savory sauce.",
    ingredients: [
      "2 cups broccoli florets",
      "1 red bell pepper, sliced",
      "1 carrot, julienned",
      "1 cup snap peas",
      "2 cloves garlic, minced",
      "1 tbsp ginger, minced",
      "3 tbsp soy sauce",
      "1 tbsp honey",
      "2 tbsp vegetable oil",
      "Sesame seeds for garnish",
    ],
    instructions: [
      "Mix soy sauce and honey in a small bowl to make the sauce.",
      "Heat oil in a wok or large pan over high heat.",
      "Add garlic and ginger, stir for 30 seconds.",
      "Add vegetables and stir fry for 5-7 minutes.",
      "Pour sauce over vegetables and cook for another minute.",
      "Serve hot, garnished with sesame seeds.",
    ],
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop",
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    tags: ["Vegetarian", "Healthy", "Quick"],
  },
  {
    id: "3",
    title: "Classic Chocolate Chip Cookies",
    description:
      "Soft and chewy chocolate chip cookies that are perfect with milk.",
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup unsalted butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup packed brown sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips",
    ],
    instructions: [
      "Preheat oven to 375°F (190°C).",
      "Combine flour, baking soda, and salt in a bowl.",
      "In another bowl, cream together butter and sugars.",
      "Beat in eggs and vanilla to the butter mixture.",
      "Gradually add flour mixture and mix well.",
      "Stir in chocolate chips.",
      "Drop by rounded tablespoons onto ungreased baking sheets.",
      "Bake for 9-11 minutes until golden brown.",
      "Cool on wire racks.",
    ],
    image:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop",
    prepTime: 20,
    cookTime: 10,
    servings: 24,
    tags: ["Dessert", "Baking", "Cookies"],
  },
];

export const recipesAtom = atom<Recipe[]>(mockRecipes);
