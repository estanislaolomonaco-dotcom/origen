"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

const GUEST_KEY = "musictrack_cart_guest";
function storageKeyFor(userId) {
  return userId ? `musictrack_cart_user_${userId}` : GUEST_KEY;
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);

  // Cargar / cambiar carrito cuando cambia el usuario.
  // Cada usuario tiene su propio carrito en localStorage; el guest tiene el suyo.
  // Así un usuario nunca ve el carrito de otro aunque compartan el navegador.
  useEffect(() => {
    if (authLoading) return;
    const key = storageKeyFor(user?.id);
    try {
      const stored = window.localStorage.getItem(key);
      setItems(stored ? JSON.parse(stored) : []);
    } catch {
      setItems([]);
    }
    setCurrentKey(key);
    setHydrated(true);
  }, [user?.id, authLoading]);

  // Persistir cambios en el slot del usuario actual.
  useEffect(() => {
    if (!hydrated || !currentKey) return;
    window.localStorage.setItem(currentKey, JSON.stringify(items));
  }, [items, hydrated, currentKey]);

  function addItem(product, quantity = 1) {
    setItems((current) => {
      const existing = current.find((i) => i.id === product.id);
      if (existing) {
        return current.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity,
        },
      ];
    });
  }

  function removeItem(productId) {
    setItems((current) => current.filter((i) => i.id !== productId));
  }

  function updateQuantity(productId, quantity) {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems((current) =>
      current.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      )
    );
  }

  function increment(productId) {
    setItems((current) =>
      current.map((i) =>
        i.id === productId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }

  function decrement(productId) {
    setItems((current) =>
      current
        .map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    increment,
    decrement,
    clearCart,
    totalItems,
    totalPrice,
    hydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return ctx;
}
