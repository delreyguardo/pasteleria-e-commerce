import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import type { UserSession } from "../services/authService";
import type { Product, OrderItem } from "../services/dbService";

interface AppContextType {
  user: UserSession | null;
  loadingAuth: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  cart: OrderItem[];
  addToCart: (product: Product, size: string, customizations: string[]) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [cart, setCart] = useState<OrderItem[]>([]);

  // 1. Sync Authentication
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((sessionUser) => {
      setUser(sessionUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("bakery_theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("bakery_theme", nextTheme);
  };

  // 3. Sync Cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("bakery_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const saveCartToStorage = (updatedCart: OrderItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("bakery_cart", JSON.stringify(updatedCart));
  };

  const addToCart = (product: Product, size: string, customizations: string[]) => {
    const updatedCart = [...cart];
    // Check if item already exists in cart with same size and customizations
    const existingIndex = updatedCart.findIndex(
      (item) => 
        item.product.id === product.id && 
        item.selectedSize === size &&
        JSON.stringify(item.selectedCustomizations.sort()) === JSON.stringify(customizations.sort())
    );

    if (existingIndex !== -1) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart.push({
        product,
        quantity: 1,
        selectedSize: size,
        selectedCustomizations: customizations
      });
    }
    saveCartToStorage(updatedCart);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    saveCartToStorage(updatedCart);
  };

  const updateCartQuantity = (index: number, qty: number) => {
    const updatedCart = [...cart];
    if (qty <= 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = qty;
    }
    saveCartToStorage(updatedCart);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  return (
    <AppContext.Provider value={{
      user,
      loadingAuth,
      theme,
      toggleTheme,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
