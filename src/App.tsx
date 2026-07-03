import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Admin } from "./pages/Admin";
import { Auth } from "./pages/Auth";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { Orders } from "./pages/Orders";
import { ProductDetail } from "./pages/ProductDetail";
import { Shop } from "./pages/Shop";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh"
        }}>
          <Navbar />

          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<RouteTransition><Shop /></RouteTransition>} />
              <Route path="/product/:id" element={<RouteTransition><ProductDetail /></RouteTransition>} />
              <Route path="/cart" element={<RouteTransition><Cart /></RouteTransition>} />
              <Route path="/checkout" element={<RouteTransition><Checkout /></RouteTransition>} />
              <Route path="/auth" element={<RouteTransition><Auth /></RouteTransition>} />
              <Route path="/admin" element={<RouteTransition><Admin /></RouteTransition>} />
              <Route path="/orders" element={<RouteTransition><Orders /></RouteTransition>} />
            </Routes>
          </main>

          <footer className="glass" style={{
            padding: "32px 0",
            textAlign: "center",
            marginTop: "auto",
            borderTop: "1px solid var(--border-glass)",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            transition: "var(--transition)"
          }}>
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

const RouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="animate-fade-in">{children}</div>;
};

export default App;
