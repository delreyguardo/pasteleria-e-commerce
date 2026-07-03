import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { dbService } from "../services/dbService";
import type { Order } from "../services/dbService";
import { ShoppingBag, CreditCard, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";

export const Checkout: React.FC = () => {
  const { user, cart, clearCart } = useApp();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"delivery" | "transfer">("delivery");

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if cart is empty and order is not successful yet
  if (cart.length === 0 && !successOrder) {
    return (
      <div className="container text-center animate-fade-in" style={{ padding: "100px 24px" }}>
        <h2 className="heading-serif" style={{ fontSize: "2rem", marginBottom: "16px" }}>Checkout vacío</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>No tienes productos en tu carrito para realizar un pedido.</p>
        <Link to="/shop" className="btn btn-primary">Ir a la Tienda</Link>
      </div>
    );
  }

  const getCustomizationPrice = (customizations: string[]) => {
    const CUSTOMIZATION_PRICES: { [key: string]: number } = {
      "Caramelo extra casero": 1.50,
      "Porción de crema chantilly": 2.00,
      "Caja de regalo decorada": 3.00,
    };
    return customizations.reduce((total, name) => total + (CUSTOMIZATION_PRICES[name] || 0), 0);
  };

  const getItemPrice = (item: typeof cart[0]) => {
    return item.product.price + getCustomizationPrice(item.selectedCustomizations);
  };

  const subtotal = cart.reduce((total, item) => {
    return total + getItemPrice(item) * item.quantity;
  }, 0);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("Debes iniciar sesión para realizar pedidos.");
      return;
    }

    if (!customerName || !shippingAddress || !phone) {
      setErrorMsg("Por favor completa todos los campos requeridos.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const orderPayload: Order = {
        userId: user.uid,
        userEmail: user.email,
        customerName,
        shippingAddress,
        phone,
        items: cart,
        subtotal,
        tax,
        total,
        status: "Pending",
        createdAt: new Date().toISOString(),
        notes: notes.trim() ? notes : undefined
      };

      const result = await dbService.createOrder(orderPayload);
      setSuccessOrder(result);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error al procesar tu pedido.");
    } finally {
      setLoading(false);
    }
  };

  // 1. If not logged in, show auth gate
  if (!user) {
    return (
      <div className="container text-center animate-fade-in" style={{ padding: "100px 24px" }}>
        <div className="glass" style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "40px",
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          <div className="flex-center" style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-cream)",
            color: "var(--accent-caramel-hover)",
            margin: "0 auto"
          }}>
            <AlertTriangle size={32} />
          </div>
          <h2 className="heading-serif" style={{ fontSize: "1.8rem" }}>Inicio de Sesión Requerido</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Para poder procesar y registrar tu pedido en nuestro sistema de pastelería, necesitas iniciar sesión en tu cuenta.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/auth?redirect=checkout" className="btn btn-primary" style={{ padding: "12px" }}>
              Iniciar Sesión / Registrarse
            </Link>
            <Link to="/cart" className="btn btn-outline" style={{ padding: "12px" }}>
              Volver al Carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Success screen
  if (successOrder) {
    return (
      <div className="container animate-fade-in" style={{ padding: "80px 24px", maxWidth: "600px" }}>
        <div className="glass text-center" style={{
          padding: "48px 32px",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "var(--shadow-lg)"
        }}>
          <div className="flex-center" style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            color: "var(--success)",
            margin: "0 auto"
          }}>
            <CheckCircle size={40} />
          </div>
          <div>
            <h1 className="heading-serif" style={{ fontSize: "2.2rem", color: "var(--text-primary)", marginBottom: "12px" }}>
              ¡Pedido Confirmado!
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
              Gracias por tu compra, <strong>{successOrder.customerName}</strong>. Tu pedido ha sido enviado a nuestras cocinas.
            </p>
          </div>

          <div style={{
            backgroundColor: "var(--bg-primary)",
            padding: "20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "0.95rem"
          }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>ID del Pedido:</span>{" "}
              <strong style={{ fontFamily: "monospace" }}>{successOrder.id}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Estado:</span>{" "}
              <span className="badge badge-success">Preparando (Baking)</span>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Dirección de Entrega:</span>{" "}
              <strong>{successOrder.shippingAddress}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Total Pagado:</span>{" "}
              <strong style={{ color: "var(--accent-caramel-hover)" }}>${successOrder.total.toFixed(2)}</strong>
            </div>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Puedes hacer seguimiento de este pedido en cualquier momento desde tu panel de usuario.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <a 
              href={`https://wa.me/5491123456789?text=Hola%20Dulce%20Margarita!%20Acabo%20de%20realizar%20el%20pedido%20ID%20${successOrder.id}.%20Adjunto%20el%20comprobante%20de%20pago.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#25D366",
                borderColor: "#25D366",
                color: "#ffffff"
              }}
            >
              📱 Enviar comprobante por WhatsApp
            </a>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <Link to="/orders" className="btn btn-secondary" style={{ flexGrow: 1, padding: "12px", fontSize: "0.9rem" }}>
                Ver Mis Pedidos
              </Link>
              <Link to="/shop" className="btn btn-outline" style={{ flexGrow: 1, padding: "12px", fontSize: "0.9rem" }}>
                Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Normal checkout form
  return (
    <div className="container animate-fade-in" style={{ padding: "60px 24px 100px" }}>
      <h1 className="heading-serif text-gradient" style={{ fontSize: "2.8rem", marginBottom: "40px" }}>
        Finalizar Pedido
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: "48px",
        alignItems: "start"
      }} className="checkout-layout">
        {/* Shipping Form */}
        <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-md)" }}>
          <h2 className="heading-serif" style={{ fontSize: "1.5rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingBag size={22} color="var(--accent-caramel)" />
            Datos de Entrega
          </h2>

          {errorMsg && (
            <div className="glass animate-fade-in" style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(190, 18, 62, 0.1)",
              border: "1px solid var(--accent-raspberry)",
              color: "var(--accent-raspberry)",
              fontSize: "0.9rem",
              fontWeight: 600,
              marginBottom: "24px"
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Nombre del Destinatario *</label>
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dirección Completa de Envío *</label>
              <input 
                type="text" 
                placeholder="Calle, Número, Departamento, Ciudad" 
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto *</label>
              <input 
                type="tel" 
                placeholder="Ej. +569 1234 5678" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notas Adicionales (Opcional)</label>
              <textarea 
                placeholder="Indicaciones para el despacho o personalizaciones especiales..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-control"
                style={{ minHeight: "100px", resize: "vertical" }}
              />
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "8px 0" }} />

            <h3 className="heading-serif" style={{ fontSize: "1.25rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={18} color="var(--accent-caramel)" />
              Método de Pago
            </h3>
            
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => setPaymentMethod("delivery")}
                className="btn"
                style={{
                  flexGrow: 1,
                  fontSize: "0.85rem",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: paymentMethod === "delivery" ? "var(--accent-cream)" : "transparent",
                  color: paymentMethod === "delivery" ? "var(--accent-caramel-hover)" : "var(--text-secondary)",
                  fontWeight: paymentMethod === "delivery" ? 700 : 500
                }}
              >
                Efectivo al recibir
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className="btn"
                style={{
                  flexGrow: 1,
                  fontSize: "0.85rem",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: paymentMethod === "transfer" ? "var(--accent-cream)" : "transparent",
                  color: paymentMethod === "transfer" ? "var(--accent-caramel-hover)" : "var(--text-secondary)",
                  fontWeight: paymentMethod === "transfer" ? 700 : 500
                }}
              >
                Transferencia Bancaria
              </button>
            </div>

            {paymentMethod === "delivery" ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                Pagarás en efectivo o mediante transferencia directa al repartidor cuando llegue tu pedido.
              </p>
            ) : (
              <div className="glass" style={{
                padding: "16px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                fontSize: "0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "12px"
              }}>
                <div><strong>Banco:</strong> Banco Dulce Margarita (Simulado)</div>
                <div><strong>CBU:</strong> 0000003100012345678901</div>
                <div><strong>Alias:</strong> dulce.margarita.mp</div>
                <div><strong>Titular:</strong> Pastelería Dulce Margarita S.A.</div>
                <div style={{ color: "var(--accent-caramel-hover)", fontWeight: 600, marginTop: "4px" }}>
                  ⚠️ Envía el comprobante de transferencia al finalizar para iniciar la cocción.
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary flex-center" 
              style={{ width: "100%", padding: "14px", marginTop: "16px" }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: "20px", height: "20px", borderTopColor: "white" }} />
                  Procesando Pedido...
                </>
              ) : (
                <>
                  Confirmar y Comprar Pedido
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Purchase Summary */}
        <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2 className="heading-serif" style={{ fontSize: "1.4rem" }}>Resumen de Compra</h2>

          {/* List of items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "300px", overflowY: "auto" }}>
            {cart.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyItems: "center", gap: "12px" }}>
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }} 
                />
                <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 700 }}>{item.product.name} x {item.quantity}</span>
                  <span style={{ color: "var(--text-muted)" }}>{item.selectedSize.split(" (")[0]}</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  ${(getItemPrice(item) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--border-color)" }} />

          {/* Summary pricing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.95rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Impuestos (8%)</span>
              <span style={{ fontWeight: 600 }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Despacho</span>
              <span style={{ fontWeight: 600, color: "var(--success)" }}>Gratis</span>
            </div>
            <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <span style={{ fontWeight: 700 }}>Total a Pagar</span>
              <span style={{ fontWeight: 800, fontSize: "1.45rem", color: "var(--accent-caramel-hover)" }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .checkout-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
};
