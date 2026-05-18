"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import styles from "./page.module.css";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
};

const CATEGORIES = ["Electricas", "Acusticas", "Bajos", "Accesorios"];

export default function AdminProductos() {
  const supabase = createClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    setProducts(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openNew() {
    setForm(EMPTY_FORM);
    setSelected(null);
    setError("");
    setModal("new");
  }

  function openEdit(product) {
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price != null ? String(product.price) : "",
      category: product.category ?? "",
      image: product.image ?? "",
    });
    setSelected(product);
    setError("");
    setModal("edit");
  }

  function openDelete(product) {
    setSelected(product);
    setModal("delete");
  }

  function closeModal() {
    setModal(null);
    setSelected(null);
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
      image: form.image.trim(),
    };

    if (!payload.name || isNaN(payload.price) || !payload.category) {
      setError("Nombre, precio y categoría son obligatorios.");
      setSaving(false);
      return;
    }

    let result;
    if (modal === "new") {
      result = await supabase.from("products").insert(payload).select().single();
    } else {
      result = await supabase
        .from("products")
        .update(payload)
        .eq("id", selected.id)
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      await loadProducts();
      closeModal();
    }
    setSaving(false);
  }

  async function handleDelete() {
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", selected.id);
    if (error) {
      setError(error.message);
    } else {
      await loadProducts();
      closeModal();
    }
    setSaving(false);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Productos</h1>
          <p className={styles.pageSubtitle}>
            {products.length} productos en el catálogo
          </p>
        </div>
        <button className="btn btn-accent" onClick={openNew}>
          + Nuevo producto
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay productos. Creá el primero.</p>
          <button className="btn btn-accent" onClick={openNew}>
            Crear producto
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <colgroup>
              <col /><col /><col /><col /><col />
            </colgroup>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt={p.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder}>—</div>
                    )}
                  </td>
                  <td className={styles.nameCell}>
                    <span>{p.name}</span>
                  </td>
                  <td>
                    <span className={styles.categoryTag}>{p.category}</span>
                  </td>
                  <td className={styles.priceCell}>
                    {formatPrice(p.price)}
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                        onClick={() => openEdit(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                        onClick={() => openDelete(p)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: nuevo / editar */}
      {(modal === "new" || modal === "edit") && (
        <div className={styles.overlay} onClick={closeModal}>
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{modal === "new" ? "Nuevo producto" : "Editar producto"}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>
                ✕
              </button>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Nombre <span>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    maxLength={120}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Categoría <span>*</span>
                  </label>
                  <select
                    className={styles.input}
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Precio (ARS) <span>*</span>
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>URL de imagen</label>
                  <input
                    type="url"
                    className={styles.input}
                    value={form.image}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Descripción</label>
                  <textarea
                    className={styles.textarea}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={3}
                    maxLength={500}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-accent"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : modal === "new"
                    ? "Crear producto"
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: confirmar eliminación */}
      {modal === "delete" && selected && (
        <div className={styles.overlay} onClick={closeModal}>
          <div
            className={`${styles.modalBox} ${styles.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Eliminar producto</h2>
              <button className={styles.closeBtn} onClick={closeModal}>
                ✕
              </button>
            </div>
            <p className={styles.deleteMsg}>
              ¿Estás seguro que querés eliminar{" "}
              <strong>{selected.name}</strong>? Esta acción no se puede
              deshacer.
            </p>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={closeModal}>
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
