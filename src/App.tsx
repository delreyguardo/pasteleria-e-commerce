import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Navbar } from "./components/Navbar";

// Eager-load routes that are almost always visited immediately
import { Shop } from "./pages/Shop";
import { Auth } from "./pages/Auth";

// Lazy-load the rest — loaded only when the user navigates there
const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const ProductDetail = lazy(() =>
  import("./pages/ProductDetail").then((m) => ({ default: m.ProductDetail }))
);
const Cart = lazy(() => import("./pages/Cart").then((m) => ({ default: m.Cart })));
const Checkout = lazy(() =>
  import("./pages/Checkout").then((m) => ({ default: m.Checkout }))
);
const Admin = lazy(() => import("./pages/Admin").then((m) => ({ default: m.Admin })));
const Orders = lazy(() =>
  import("./pages/Orders").then((m) => ({ default: m.Orders }))
);

const PageLoader: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <div className="loading-spinner" style={{ width: 36, height: 36 }} />
    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Cargando…</span>
  </div>
);

const RouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="animate-fade-in">{children}</div>
);

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Navbar />

          <main style={{ flexGrow: 1 }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Shop />} />
                <Route
                  path="/sobre-nosotros"
                  element={
                    <RouteTransition>
                      <Home />
                    </RouteTransition>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <RouteTransition>
                      <ProductDetail />
                    </RouteTransition>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <RouteTransition>
                      <Cart />
                    </RouteTransition>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <RouteTransition>
                      <Checkout />
                    </RouteTransition>
                  }
                />
                <Route
                  path="/auth"
                  element={
                    <RouteTransition>
                      <Auth />
                    </RouteTransition>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RouteTransition>
                      <Admin />
                    </RouteTransition>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <RouteTransition>
                      <Orders />
                    </RouteTransition>
                  }
                />
              </Routes>
            </Suspense>
          </main>

          <footer
            className="glass"
            style={{
              padding: "32px 0",
              textAlign: "center",
              marginTop: "auto",
              borderTop: "1px solid var(--border-glass)",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              transition: "var(--transition)",
            }}
          >
            <div className="container">
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>
                Dulce Margarita | Budines caseros
              </p>
              <p style={{ fontSize: "0.8rem" }}>
                © 2026. Pastelería artesanal enfocada en budines. Todos los derechos reservados.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
