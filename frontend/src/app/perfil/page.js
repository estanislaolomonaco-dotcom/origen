"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

export default function PerfilPage() {
  const { user, profile, loading, updateName } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    const { error } = await updateName(name.trim());
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading || !user) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p className="text-muted">Cargando...</p>
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = profile?.name || user.email?.split("@")[0] || "Usuario";

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Mi perfil</h1>
          <p className={styles.subtitle}>Administrá tu información personal</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.avatarCard}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.avatarFallback}>
                {displayName[0].toUpperCase()}
              </div>
            )}
            <p className={styles.avatarName}>{displayName}</p>
            <p className={styles.avatarEmail}>{user.email}</p>
            {profile?.role === "admin" && (
              <span className={styles.adminBadge}>Administrador</span>
            )}
          </div>

          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Editar información</h2>

            {success && (
              <div className={styles.successMsg}>
                ✓ Nombre actualizado correctamente
              </div>
            )}
            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  placeholder="Tu nombre"
                  maxLength={80}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={user.email}
                  className={`${styles.input} ${styles.inputDisabled}`}
                  disabled
                />
                <p className={styles.hint}>
                  El email proviene de tu cuenta de Google y no se puede
                  modificar aquí.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="btn btn-accent"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
