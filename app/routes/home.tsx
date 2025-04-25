import type { Route } from "./+types/home";
import { Recipes } from "../recipes/Recipes";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pantry Plus - Recipe App" },
    { name: "description", content: "Find and save your favorite recipes!" },
  ];
}

export default function Home() {
  return <Recipes />;
}
