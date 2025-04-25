import ProductSearch from "@/components/ProductSearch";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pantry Plus</h1>

        <div>
          <ProductSearch />
        </div>
      </div>
    </main>
  );
}
