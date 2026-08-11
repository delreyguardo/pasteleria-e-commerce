import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import { Checkout } from "./Checkout";
import type { Product, OrderItem } from "../services/dbService";

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

const CART_ITEM: OrderItem = {
  product: PRODUCT,
  quantity: 1,
  selectedSize: "Estándar",
  selectedCustomizations: []
};

const seedCart = () => {
  localStorage.setItem("bakery_cart", JSON.stringify([CART_ITEM]));
  localStorage.setItem("bakery_products", JSON.stringify([PRODUCT]));
  localStorage.setItem("bakery_orders", JSON.stringify([]));
};

const renderCheckout = () =>
  render(
    <AppProvider>
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    </AppProvider>
  );

describe("Checkout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("muestra el estado vacío si no hay carrito", () => {
    renderCheckout();
    expect(screen.getByText("Checkout vacío")).toBeInTheDocument();
  });

  it("valida los campos requeridos al enviar", () => {
    seedCart();
    const { container } = renderCheckout();

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    expect(screen.getByText("Por favor completa todos los campos requeridos.")).toBeInTheDocument();
  });

  it("muestra el resumen de compra con subtotal y total", () => {
    seedCart();
    renderCheckout();

    expect(screen.getByText(/Budín de Limón x 1/)).toBeInTheDocument();
    expect(screen.getAllByText("$12.000")).toHaveLength(3);
  });

  it("crea la orden con pago por transferencia y muestra la confirmación con WhatsApp", async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    await user.type(screen.getByPlaceholderText("Ej. Juan Pérez"), "Juan Pérez");
    await user.type(screen.getByPlaceholderText("Calle, Número, Departamento, Ciudad"), "Calle Falsa 123");
    await user.type(screen.getByPlaceholderText("Ej. +569 1234 5678"), "3515555555");
    await user.click(screen.getByRole("button", { name: "Transferencia Bancaria" }));
    await user.click(screen.getByRole("button", { name: /Confirmar y Comprar Pedido/ }));

    expect(await screen.findByText("¡Pedido Confirmado!")).toBeInTheDocument();

    // La orden quedó guardada
    const orders = JSON.parse(localStorage.getItem("bakery_orders") || "[]");
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      customerName: "Juan Pérez",
      shippingAddress: "Calle Falsa 123",
      phone: "3515555555",
      status: "Pending",
      total: 12000
    });

    // El carrito se vació tras la compra
    expect(JSON.parse(localStorage.getItem("bakery_cart") || "[]")).toEqual([]);

    // El stock del producto se decrementó
    const products = JSON.parse(localStorage.getItem("bakery_products") || "[]");
    expect(products[0].stock).toBe(9);

    // El link de WhatsApp incluye los detalles y el método de pago elegido
    const waLink = screen.getByRole("link", { name: /Enviar pedido por WhatsApp/ }) as HTMLAnchorElement;
    expect(waLink.href).toContain("wa.me/5493515724879");
    expect(decodeURIComponent(waLink.href)).toContain("Transferencia Bancaria");
    expect(decodeURIComponent(waLink.href)).toContain("Budín de Limón x1");
    expect(decodeURIComponent(waLink.href)).toContain("*Total:* $12.000");
  });

  it("crea la orden con pago en efectivo al recibir por defecto", async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    await user.type(screen.getByPlaceholderText("Ej. Juan Pérez"), "Juan Pérez");
    await user.type(screen.getByPlaceholderText("Calle, Número, Departamento, Ciudad"), "Calle Falsa 123");
    await user.type(screen.getByPlaceholderText("Ej. +569 1234 5678"), "3515555555");
    await user.click(screen.getByRole("button", { name: /Confirmar y Comprar Pedido/ }));

    expect(await screen.findByText("¡Pedido Confirmado!")).toBeInTheDocument();

    const waLink = screen.getByRole("link", { name: /Enviar pedido por WhatsApp/ }) as HTMLAnchorElement;
    expect(decodeURIComponent(waLink.href)).toContain("Efectivo al recibir");
  });

  it("muestra los datos de la transferencia al seleccionar ese método", async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    await user.click(screen.getByRole("button", { name: "Transferencia Bancaria" }));

    expect(screen.getByText("Dulce.margarita10")).toBeInTheDocument();
  });

  it("guarda las notas si se completan", async () => {
    const user = userEvent.setup();
    seedCart();
    renderCheckout();

    await user.type(screen.getByPlaceholderText("Ej. Juan Pérez"), "Juan Pérez");
    await user.type(
      screen.getByPlaceholderText("Calle, Número, Departamento, Ciudad"),
      "Calle Falsa 123"
    );
    await user.type(screen.getByPlaceholderText("Ej. +569 1234 5678"), "3515555555");
    await user.type(
      screen.getByPlaceholderText("Indicaciones para el despacho o personalizaciones especiales..."),
      "Sin apuro, por la tarde"
    );
    await user.click(screen.getByRole("button", { name: /Confirmar y Comprar Pedido/ }));

    expect(await screen.findByText("¡Pedido Confirmado!")).toBeInTheDocument();

    const orders = JSON.parse(localStorage.getItem("bakery_orders") || "[]");
    expect(orders[0].notes).toBe("Sin apuro, por la tarde");

    const waLink = screen.getByRole("link", { name: /Enviar pedido por WhatsApp/ }) as HTMLAnchorElement;
    expect(decodeURIComponent(waLink.href)).toContain("Sin apuro, por la tarde");
  });
});