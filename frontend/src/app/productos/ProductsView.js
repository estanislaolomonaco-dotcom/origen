"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";

export default function ProductsView({ products = [], categories = [] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria") || "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("default");

  // Si cambia el query param desde otra pagina, sincronizamos.
  useEffect(() => {
    const cat = searchParams.get("categoria") || "";
    setCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return list;
  }, [products, category, search, sort]);

  return (
    <>
      <ProductFilters
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

      <p className="text-muted" style={{ marginBottom: "1rem" }}>
        Mostrando {filtered.length} producto{filtered.length === 1 ? "" : "s"}
      </p>

      <ProductGrid
        products={filtered}
        emptyMessage="No encontramos productos con esos filtros."
      />
    </>
  );
}
