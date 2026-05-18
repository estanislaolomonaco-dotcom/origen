"use client";

import styles from "./ProductFilters.module.css";

export default function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
}) {
  return (
    <div className={styles.filters}>
      <div className={styles.field}>
        <label htmlFor="search" className={styles.label}>
          Buscar
        </label>
        <input
          id="search"
          type="search"
          placeholder="Nombre del producto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="category" className={styles.label}>
          Categoria
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={styles.input}
        >
          <option value="">Todas</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="sort" className={styles.label}>
          Ordenar por
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className={styles.input}
        >
          <option value="default">Relevancia</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre A-Z</option>
        </select>
      </div>
    </div>
  );
}
