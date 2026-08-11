import { describe, it, expect, beforeEach } from "vitest";
import {
  dbService,
  formatPrice,
  getCustomizationPrice,
  CUSTOMIZATION_OPTIONS,
  type Product,
  type Order
} from "./dbService";

const PRODUCTS: Product[] = [
  {
    id: "budin-limon",
    name: "Budín de Limón",
    description: "Cítrico y fresco",
    price: 12000,
    category: "budin",
    image: "/images/budin-limon.webp",
    ingredients: ["Limón"],
    sizes: ["Estándar"],
    stock: 10
  },
  {
    id: "budin-chocolate",
    name: "Budín de Chocolate",
    description: "Intenso",
    price: 12000,
    category: "budin",
    image: "/images/budin-chocolate.webp",
    ingredients: ["Cacao"],
    sizes: ["Estándar"],
    stock: 5
  }
];

const seedLocalDb = () => {
  localStorage.setItem("bakery_products", JSON.stringify(PRODUCTS));
  localStorage.setItem("bakery_orders", JSON.stringify([]));
};

const sampleOrder = (): Order => ({
  userId: "user-1",
  userEmail: "test@user.com",
  customerName: "Juan Pérez",
  shippingAddress: "Calle Falsa 123",
  phone: "3515555555",
  items: [
    {
      product: PRODUCTS[0],
      quantity: 2,
      selectedSize: "Estándar",
      selectedCustomizations: []
    }
  ],
  subtotal: 24000,
  tax: 0,
  total: 24000,
  status: "Pending",
  createdAt: "2026-01-01T00:00:00.000Z"
});

describe("formatPrice y customizaciones", () => {
  it("formatea precios en ARS sin decimales", () => {
    expect(formatPrice(12000)).toBe("$12.000");
    expect(formatPrice(12499.6)).toBe("$12.500");
  });

  it("suma el precio de las customizaciones conocidas", () => {
    expect(getCustomizationPrice([])).toBe(0);
    expect(getCustomizationPrice(["Caramelo extra casero"])).toBe(500);
    expect(getCustomizationPrice(["Caramelo extra casero", "Caja de regalo decorada"])).toBe(2000);
  });

  it("ignora customizaciones desconocidas", () => {
    expect(getCustomizationPrice(["No existe"])).toBe(0);
  });

  it("expone las opciones de customización", () => {
    expect(CUSTOMIZATION_OPTIONS).toHaveLength(3);
  });
});

describe("dbService (modo mock)", () => {
  beforeEach(() => {
    localStorage.clear();
    seedLocalDb();
  });

  describe("getProducts", () => {
    it("devuelve los productos del catálogo", async () => {
      const products = await dbService.getProducts();
      expect(products).toHaveLength(2);
      expect(products[0]).toMatchObject({ name: "Budín de Limón", price: 12000 });
    });
  });

  describe("getProductById", () => {
    it("devuelve el producto por id", async () => {
      const product = await dbService.getProductById("budin-chocolate");
      expect(product?.name).toBe("Budín de Chocolate");
    });

    it("devuelve null si no existe", async () => {
      expect(await dbService.getProductById("no-existe")).toBeNull();
    });
  });

  describe("createOrder", () => {
    it("crea la orden con id y estado Pending", async () => {
      const order = await dbService.createOrder(sampleOrder());

      expect(order.id).toBeTruthy();
      expect(order.status).toBe("Pending");
      expect(order.createdAt).toBeTruthy();

      const orders = JSON.parse(localStorage.getItem("bakery_orders") || "[]");
      expect(orders).toHaveLength(1);
      expect(orders[0].id).toBe(order.id);
    });

    it("decrementa el stock de los productos pedidos", async () => {
      await dbService.createOrder(sampleOrder());

      const products = JSON.parse(localStorage.getItem("bakery_products") || "[]");
      expect(products.find((p: Product) => p.id === "budin-limon").stock).toBe(8);
    });

    it("no deja el stock en negativo", async () => {
      const order = sampleOrder();
      order.items[0].quantity = 99;
      await dbService.createOrder(order);

      const products = JSON.parse(localStorage.getItem("bakery_products") || "[]");
      expect(products.find((p: Product) => p.id === "budin-limon").stock).toBe(0);
    });
  });

  describe("getOrders", () => {
    it("devuelve las órdenes ordenadas por fecha descendente", async () => {
      const older = sampleOrder();
      older.createdAt = "2026-01-01T00:00:00.000Z";
      const newer = sampleOrder();
      newer.createdAt = "2026-02-01T00:00:00.000Z";
      localStorage.setItem("bakery_orders", JSON.stringify([newer, older]));

      const orders = await dbService.getOrders();
      expect(orders.map((o) => o.createdAt)).toEqual([
        "2026-02-01T00:00:00.000Z",
        "2026-01-01T00:00:00.000Z"
      ]);
    });

    it("filtra por usuario", async () => {
      const mine = sampleOrder();
      mine.userId = "user-1";
      const other = sampleOrder();
      other.userId = "user-2";
      await dbService.createOrder(mine);
      await dbService.createOrder(other);

      const orders = await dbService.getOrders("user-1");
      expect(orders).toHaveLength(1);
      expect(orders[0].userId).toBe("user-1");
    });
  });

  describe("updateOrderStatus", () => {
    it("actualiza el estado de la orden", async () => {
      const order = await dbService.createOrder(sampleOrder());
      const result = await dbService.updateOrderStatus(order.id!, "Completed");

      expect(result).toBe(true);
      const stored = JSON.parse(localStorage.getItem("bakery_orders") || "[]");
      expect(stored[0].status).toBe("Completed");
    });

    it("devuelve false si la orden no existe", async () => {
      expect(await dbService.updateOrderStatus("nope", "Baking")).toBe(false);
    });
  });

  describe("CRUD de productos", () => {
    it("crea un producto con slug a partir del nombre", async () => {
      const created = await dbService.createProduct({
        name: "Budín de Manzana y Canela",
        description: "Perfumado",
        price: 13000,
        category: "budin",
        image: "/images/budin-manzana.webp",
        ingredients: ["Manzana"],
        sizes: ["Estándar"],
        stock: 4
      });

      expect(created.id).toBe("budin-de-manzana-y-canela");

      const stored = JSON.parse(localStorage.getItem("bakery_products") || "[]");
      expect(stored).toHaveLength(3);
    });

    it("actualiza un producto existente", async () => {
      const result = await dbService.updateProduct("budin-limon", { stock: 3, price: 13500 });

      expect(result).toBe(true);
      const product = await dbService.getProductById("budin-limon");
      expect(product).toMatchObject({ stock: 3, price: 13500 });
    });

    it("elimina un producto", async () => {
      const result = await dbService.deleteProduct("budin-limon");

      expect(result).toBe(true);
      expect(await dbService.getProducts()).toHaveLength(1);
    });

    it("devuelve false al eliminar un producto inexistente", async () => {
      expect(await dbService.deleteProduct("no-existe")).toBe(false);
    });
  });
});