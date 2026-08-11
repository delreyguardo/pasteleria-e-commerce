import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider, useApp } from "./AppContext";
import type { Product } from "../services/dbService";

const PRODUCT: Product = {
  id: "budin-limon",
  name: "Budín de Limón",
  description: "Cítrico",
  price: 12000,
  category: "budin",
  image: "/images/budin-limon.webp",
  ingredients: ["Limón"],
  sizes: ["Estándar"],
  stock: 10
};

const CartProbe: React.FC = () => {
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart, toggleTheme } = useApp();
  return (
    <div>
      <button onClick={() => addToCart(PRODUCT, "Estándar", [])}>add-estandar</button>
      <button onClick={() => addToCart(PRODUCT, "Grande", [])}>add-grande</button>
      <button onClick={() => addToCart(PRODUCT, "Estándar", ["Caja de regalo decorada"])}>
        add-custom
      </button>
      <button onClick={() => removeFromCart(0)}>remove-0</button>
      <button onClick={() => updateCartQuantity(0, 3)}>qty-3</button>
      <button onClick={() => updateCartQuantity(0, 0)}>qty-0</button>
      <button onClick={clearCart}>clear</button>
      <button onClick={toggleTheme}>toggle-theme</button>
      <ul>
        {cart.map((item, i) => (
          <li key={i}>
            {item.product.id}|{item.selectedSize}|{item.quantity}|{item.selectedCustomizations.join(",")}
          </li>
        ))}
      </ul>
    </div>
  );
};

const renderProbe = () =>
  render(
    <AppProvider>
      <CartProbe />
    </AppProvider>
  );

describe("AppContext (carrito)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("agrega un producto nuevo al carrito", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));

    expect(screen.getByText("budin-limon|Estándar|1|")).toBeInTheDocument();
  });

  it("incrementa la cantidad si el ítem ya existe (mismo tamaño y customizaciones)", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));
    await user.click(screen.getByText("add-estandar"));

    expect(screen.getByText("budin-limon|Estándar|2|")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("crea ítems separados si cambia el tamaño", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));
    await user.click(screen.getByText("add-grande"));

    expect(screen.getByText("budin-limon|Estándar|1|")).toBeInTheDocument();
    expect(screen.getByText("budin-limon|Grande|1|")).toBeInTheDocument();
  });

  it("crea ítems separados si cambian las customizaciones", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));
    await user.click(screen.getByText("add-custom"));

    expect(screen.getByText("budin-limon|Estándar|1|")).toBeInTheDocument();
    expect(screen.getByText("budin-limon|Estándar|1|Caja de regalo decorada")).toBeInTheDocument();
  });

  it("elimina un ítem por índice", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));
    await user.click(screen.getByText("remove-0"));

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("actualiza la cantidad de un ítem", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));
    await user.click(screen.getByText("qty-3"));

    expect(screen.getByText("budin-limon|Estándar|3|")).toBeInTheDocument();
  });

  it("elimina el ítem si la cantidad llega a 0", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));
    await user.click(screen.getByText("qty-0"));

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("vacía el carrito", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));
    await user.click(screen.getByText("add-grande"));
    await user.click(screen.getByText("clear"));

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("persiste el carrito en localStorage", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByText("add-estandar"));

    const saved = JSON.parse(localStorage.getItem("bakery_cart") || "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ quantity: 1, selectedSize: "Estándar" });
  });
});

describe("AppContext (tema)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("inicia en light y alterna a dark", async () => {
    const user = userEvent.setup();
    renderProbe();

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    await user.click(screen.getByText("toggle-theme"));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("bakery_theme")).toBe("dark");
  });

  it("respeta el tema guardado al montar", () => {
    localStorage.setItem("bakery_theme", "dark");
    renderProbe();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});