import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { getCustomizationPrice, formatPrice } from "../services/dbService";

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity } = useApp();

  const getItemPrice = (item: typeof cart[0]) => {
    return item.product.price + getCustomizationPrice(item.selectedCustomizations);
  };

  const subtotal = cart.reduce((total, item) => {
    return total + getItemPrice(item) * item.quantity;
  }, 0);

  const total = subtotal;

  if (cart.length === 0) {
    return (
      <div className="container text-center animate-fade-in" style={{ padding: "100px 24px" }}>
        <div className="flex-center" style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "var(--accent-cream)",
          color: "var(--accent-caramel-hover)",
          margin: "0 auto 24px"
        }}>
          <ShoppingBag size={36} />
        </div>
        <h2 className="heading-serif" style={{ fontSize: "2rem", marginBottom: "12px" }}>Tu Carrito está Vacío</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "450px", margin: "0 auto 32px" }}>
          Parece que aún no has agregado ninguna de nuestras deliciosas especialidades. ¡Endulza tu día explorando la tienda!
        </p>
        <Link to="/" className="btn btn-primary">
          Explorar Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: "60px 24px 100px" }}>
      <h1 className="heading-serif text-gradient" style={{ fontSize: "2.8rem", marginBottom: "40px" }}>
        Tu Carrito de Delicias
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "48px",
        alignItems: "start"
      }} className="cart-layout">
        {/* Left Side: Items List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {cart.map((item, index) => {
            const itemPrice = getItemPrice(item);
            return (
              <div key={index} className="glass cart-item" style={{
                padding: "20px",
                borderRadius: "var(--radius-md)",
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: "20px",
                alignItems: "center"
              }}>
                {/* Product Image */}
                <div style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden"
                }}>
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
                    {item.product.name}
                  </h3>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {item.selectedSize && item.selectedSize !== "Estándar" && (
                      <span className="badge" style={{
                        backgroundColor: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-secondary)",
                        fontSize: "0.75rem",
                        padding: "2px 8px"
                      }}>
                        Tamaño: {item.selectedSize.split(" (")[0]}
                      </span>
                    )}
                    
                    {item.selectedCustomizations.map((cust, i) => (
                      <span key={i} className="badge" style={{
                        backgroundColor: "var(--accent-cream)",
                        color: "var(--accent-caramel-hover)",
                        fontSize: "0.75rem",
                        padding: "2px 8px"
                      }}>
                        + {cust}
                      </span>
                    ))}
                  </div>

                  <span style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    Precio unitario: {formatPrice(itemPrice)}
                  </span>
                </div>

                {/* Quantity & Delete Action */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end"
                }}>
                  {/* Quantity Controls */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--bg-primary)",
                    padding: "4px"
                  }}>
                    <button 
                      onClick={() => updateCartQuantity(index, item.quantity - 1)}
                      className="flex-center"
                      style={{ width: "28px", height: "28px", borderRadius: "50%", color: "var(--text-secondary)" }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ width: "32px", textAlign: "center", fontWeight: 600, fontSize: "0.95rem" }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateCartQuantity(index, item.quantity + 1)}
                      className="flex-center"
                      style={{ width: "28px", height: "28px", borderRadius: "50%", color: "var(--text-secondary)" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal of item */}
                  <span style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--text-primary)", minWidth: "80px", textAlign: "right" }}>
                    {formatPrice(itemPrice * item.quantity)}
                  </span>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(index)}
                    className="flex-center btn-outline"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      color: "var(--accent-raspberry)",
                      padding: 0,
                      borderColor: "transparent"
                    }}
                    title="Eliminar producto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Order Summary */}
        <div className="glass" style={{
          padding: "32px",
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          <h2 className="heading-serif" style={{ fontSize: "1.4rem" }}>Resumen del Pedido</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(subtotal)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Envío</span>
              <span style={{ fontWeight: 600, color: "var(--success)" }}>Gratis</span>
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: "1.6rem", color: "var(--accent-caramel-hover)" }}>
                 {formatPrice(total)}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/checkout" className="btn btn-primary" style={{ width: "100%", padding: "14px" }}>
              Proceder al Pago
              <ArrowRight size={18} />
            </Link>
             <Link to="/" className="btn btn-outline text-center" style={{ width: "100%", padding: "14px" }}>
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .cart-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 600px) {
          .cart-item { grid-template-columns: 100px 1fr !important; }
          .cart-item > div:last-child {
            grid-column: span 2;
            justify-content: space-between !important;
            margin-top: 10px;
          }
        }
      `}</style>
    </div>
  );
};
