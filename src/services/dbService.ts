import { db as _db, isFirebaseConfigured } from "../firebase";
import type { Firestore } from "firebase/firestore";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";

// Narrow the type: when isFirebaseConfigured is true, db is guaranteed non-null
const db = _db as Firestore;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "budin" | "pastel";
  image: string;
  ingredients: string[];
  sizes: string[];
  stock: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedCustomizations: string[];
}

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  customerName: string;
  shippingAddress: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Pending" | "Baking" | "Delivering" | "Completed";
  createdAt: string;
  notes?: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  { id: "extra-caramel", name: "Caramelo extra casero", price: 500 },
  { id: "chantilly", name: "Porción de crema chantilly", price: 800 },
  { id: "gift-box", name: "Caja de regalo decorada", price: 1500 },
];

export const formatPrice = (price: number): string => {
  return `$${Math.round(price).toLocaleString("es-AR")}`;
};

export const getCustomizationPrice = (customizations: string[]): number => {
  return customizations.reduce((total, name) => {
    const option = CUSTOMIZATION_OPTIONS.find(o => o.name === name);
    return total + (option ? option.price : 0);
  }, 0);
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "budin-limon-amapola",
    name: "Budín de Limón y Amapola",
    description: "Suave y aromático, con glaseado de limón casero y semillas de amapola. Húmedo por dentro, con ese cítrico fresco que acompaña perfecto el mate o el café.",
    price: 12000,
    category: "budin",
    image: "/images/budin-limon-amapola.webp",
    ingredients: ["Harina", "Limón fresco", "Semillas de amapola", "Huevos", "Azúcar", "Glaseado de limón"],
    sizes: ["Mediano (6 porciones)", "Grande (12 porciones)"],
    stock: 10
  },
  {
    id: "budin-carrot-cake",
    name: "Budín Carrot Cake",
    description: "Con zanahoria rallada, especias cálidas y cubierto con una crema de queso espesa y nueces tostadas. Una combinación clásica que siempre enamora.",
    price: 12000,
    category: "budin",
    image: "/images/budin-carrot-cake.webp",
    ingredients: ["Zanahoria rallada", "Nueces", "Crema de queso", "Canela", "Jengibre", "Azúcar mascabo"],
    sizes: ["Mediano (6 porciones)", "Grande (12 porciones)"],
    stock: 8
  },
  {
    id: "budin-chocolate",
    name: "Budín de Chocolate",
    description: "Intenso y esponjoso, bañado en ganache de chocolate negro artesanal con chips encima. Para los que no pueden resistirse al chocolate puro.",
    price: 12000,
    category: "budin",
    image: "/images/budin-chocolate.webp",
    ingredients: ["Cacao amargo", "Chocolate negro", "Ganache casero", "Chips de chocolate", "Huevos", "Manteca"],
    sizes: ["Mediano (6 porciones)", "Grande (12 porciones)"],
    stock: 12
  },
  {
    id: "budin-manzana",
    name: "Budín de Manzana",
    description: "Con láminas de manzana caramelizadas y canela en cada bocado. Húmedo, perfumado y con una corteza dorada que lo hace irresistible.",
    price: 12000,
    category: "budin",
    image: "/images/budin-manzana.webp",
    ingredients: ["Manzana roja", "Canela", "Azúcar rubio", "Huevos", "Harina", "Manteca"],
    sizes: ["Mediano (6 porciones)", "Grande (12 porciones)"],
    stock: 10
  },
  {
    id: "budin-banana-chips",
    name: "Budín de Banana con Chips",
    description: "Banana bien madura que da una textura húmeda y dulce natural, con chips de chocolate distribuidos por toda la miga. Un clásico que nunca falla.",
    price: 12000,
    category: "budin",
    image: "/images/budin-banana-chips.webp",
    ingredients: ["Banana madura", "Chips de chocolate", "Harina", "Huevos", "Azúcar", "Esencia de vainilla"],
    sizes: ["Mediano (6 porciones)", "Grande (12 porciones)"],
    stock: 10
  }
];

const PRODUCT_SEED_VERSION = "dulce-margarita-budines-v3";

const initLocalDb = () => {
  if (localStorage.getItem("bakery_products_version") !== PRODUCT_SEED_VERSION) {
    localStorage.setItem("bakery_products", JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem("bakery_products_version", PRODUCT_SEED_VERSION);
  }

  if (!localStorage.getItem("bakery_orders")) {
    localStorage.setItem("bakery_orders", JSON.stringify([]));
  }
};

initLocalDb();

export const dbService = {
  getProducts: async (): Promise<Product[]> => {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "products");
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) {
          for (const prod of INITIAL_PRODUCTS) {
            await setDoc(doc(db, "products", prod.id), prod);
          }
          return INITIAL_PRODUCTS;
        }
        return snapshot.docs.map(d => d.data() as Product);
      } catch (error) {
        console.error("Firestore getProducts failed, falling back to LocalStorage:", error);
      }
    }
    return JSON.parse(localStorage.getItem("bakery_products") || "[]");
  },

  getProductById: async (id: string): Promise<Product | null> => {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as Product;
        }
      } catch (error) {
        console.error("Firestore getProductById failed, falling back to LocalStorage:", error);
      }
    }
    const products = JSON.parse(localStorage.getItem("bakery_products") || "[]") as Product[];
    return products.find(p => p.id === id) || null;
  },

  createOrder: async (order: Order): Promise<Order> => {
    const newOrder = {
      ...order,
      createdAt: new Date().toISOString(),
      status: "Pending" as const
    };

    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "orders");
        const docRef = await addDoc(colRef, newOrder);
        newOrder.id = docRef.id;

        for (const item of order.items) {
          const prodDocRef = doc(db, "products", item.product.id);
          const prodSnap = await getDoc(prodDocRef);
          if (prodSnap.exists()) {
            const currentStock = prodSnap.data().stock || 0;
            await updateDoc(prodDocRef, {
              stock: Math.max(0, currentStock - item.quantity)
            });
          }
        }
        return newOrder;
      } catch (error) {
        console.error("Firestore createOrder failed, falling back to LocalStorage:", error);
      }
    }

    const orders = JSON.parse(localStorage.getItem("bakery_orders") || "[]") as Order[];
    newOrder.id = "ord_" + Math.random().toString(36).substr(2, 9);
    orders.push(newOrder);
    localStorage.setItem("bakery_orders", JSON.stringify(orders));

    const products = JSON.parse(localStorage.getItem("bakery_products") || "[]") as Product[];
    newOrder.items.forEach(item => {
      const idx = products.findIndex(p => p.id === item.product.id);
      if (idx !== -1) {
        products[idx].stock = Math.max(0, products[idx].stock - item.quantity);
      }
    });
    localStorage.setItem("bakery_products", JSON.stringify(products));

    return newOrder;
  },

  getOrders: async (userId?: string): Promise<Order[]> => {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, "orders");
        const q = query(colRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order));
        if (userId) {
          return list.filter(o => o.userId === userId);
        }
        return list;
      } catch (error) {
        console.error("Firestore getOrders failed, falling back to LocalStorage:", error);
      }
    }

    const orders = JSON.parse(localStorage.getItem("bakery_orders") || "[]") as Order[];
    const sorted = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (userId) {
      return sorted.filter(o => o.userId === userId);
    }
    return sorted;
  },

  updateOrderStatus: async (orderId: string, status: Order["status"]): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "orders", orderId);
        await updateDoc(docRef, { status });
        return true;
      } catch (error) {
        console.error("Firestore updateOrderStatus failed, falling back to LocalStorage:", error);
      }
    }

    const orders = JSON.parse(localStorage.getItem("bakery_orders") || "[]") as Order[];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      localStorage.setItem("bakery_orders", JSON.stringify(orders));
      return true;
    }
    return false;
  },

  updateProduct: async (productId: string, updates: Partial<Product>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "products", productId);
        await updateDoc(docRef, updates);
        return true;
      } catch (error) {
        console.error("Firestore updateProduct failed, falling back to LocalStorage:", error);
      }
    }

    const products = JSON.parse(localStorage.getItem("bakery_products") || "[]") as Product[];
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updates };
      localStorage.setItem("bakery_products", JSON.stringify(products));
      return true;
    }
    return false;
  },

  createProduct: async (product: Omit<Product, "id">): Promise<Product> => {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const newProduct = {
      ...product,
      id: slug || "prod-" + Math.random().toString(36).substr(2, 9)
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "products", newProduct.id), newProduct);
        return newProduct;
      } catch (error) {
        console.error("Firestore createProduct failed, falling back to LocalStorage:", error);
      }
    }

    const products = JSON.parse(localStorage.getItem("bakery_products") || "[]") as Product[];
    products.push(newProduct);
    localStorage.setItem("bakery_products", JSON.stringify(products));
    return newProduct;
  },

  deleteProduct: async (productId: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "products", productId);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error("Firestore deleteProduct failed, falling back to LocalStorage:", error);
      }
    }

    const products = JSON.parse(localStorage.getItem("bakery_products") || "[]") as Product[];
    const filtered = products.filter(p => p.id !== productId);
    if (products.length !== filtered.length) {
      localStorage.setItem("bakery_products", JSON.stringify(filtered));
      return true;
    }
    return false;
  }
};
