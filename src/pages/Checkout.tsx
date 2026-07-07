import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { dbService, getCustomizationPrice, formatPrice } from "../services/dbService";
import type { Order } from "../services/dbService";
import { ShoppingBag, CreditCard, ChevronRight, CheckCircle } from "lucide-react";

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
        <Link to="/" className="btn btn-primary">Ir a la Tienda</Link>
      </div>
    );
  }



  const getItemPrice = (item: typeof cart[0]) => {
    return item.product.price + getCustomizationPrice(item.selectedCustomizations);
  };

  const subtotal = cart.reduce((total, item) => {
    return total + getItemPrice(item) * item.quantity;
  }, 0);

  // Sin recargo adicional — precios ya incluyen IVA
  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !shippingAddress || !phone) {
      setErrorMsg("Por favor completa todos los campos requeridos.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const orderPayload: Order = {
        userId: user ? user.uid : "invitado",
        userEmail: user ? user.email : "anonimo@dulcemargarita.com",
        customerName,
        shippingAddress,
        phone,
        items: cart,
        subtotal,
        tax: 0,
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

  const getWhatsAppLink = (order: Order) => {
    const itemsText = order.items.map(item => {
      const customizations = item.selectedCustomizations.length > 0 
        ? ` (Agregados: ${item.selectedCustomizations.join(", ")})` 
        : "";
      const sizeText = item.selectedSize && item.selectedSize !== "Estándar" 
        ? ` [${item.selectedSize}]` 
        : "";
      return `- ${item.product.name} x${item.quantity}${sizeText}${customizations}`;
    }).join("\n");

    const methodText = paymentMethod === "transfer" ? "Transferencia Bancaria" : "Efectivo al recibir";

    let text = `¡Hola Dulce Margarita! Quisiera realizar un pedido:\n\n`;
    text += `👤 *Nombre:* ${order.customerName}\n`;
    text += `📍 *Dirección:* ${order.shippingAddress}\n`;
    text += `📞 *Teléfono:* ${order.phone}\n`;
    if (order.notes) {
      text += `📝 *Notas:* ${order.notes}\n`;
    }
    text += `💳 *Método de pago:* ${methodText}\n\n`;
    text += `🛒 *Detalle de compra:*\n${itemsText}\n\n`;
    text += `💰 *Total:* ${formatPrice(order.total)}`;
    
    return `https://wa.me/5493515724879?text=${encodeURIComponent(text)}`;
  };

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
              <span style={{ color: "var(--text-muted)" }}>Total a Pagar:</span>{" "}
              <strong style={{ color: "var(--accent-caramel-hover)" }}>{formatPrice(successOrder.total)}</strong>
            </div>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Hacé clic en el botón de abajo para enviar los detalles de tu pedido directamente a nuestro WhatsApp y coordinar el envío/pago.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <a
              href={getWhatsAppLink(successOrder)}
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
              📱 Enviar pedido por WhatsApp
            </a>
            
            <div style={{ display: "flex", gap: "12px" }}>
              {user && (
                <Link to="/orders" className="btn btn-secondary" style={{ flexGrow: 1, padding: "12px", fontSize: "0.9rem" }}>
                  Ver Mis Pedidos
                </Link>
              )}
              <Link to="/" className="btn btn-outline" style={{ flexGrow: 1, padding: "12px", fontSize: "0.9rem" }}>
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
                <div><strong>Alias:</strong> Dulce.margarita10</div>
                <div><strong>Titular:</strong> Camila Belén Ávila</div>
                <div><strong>Billetera:</strong> Claro Pay</div>
                <div style={{ color: "var(--accent-caramel-hover)", fontWeight: 600, marginTop: "4px" }}>
                  ⚠️ Enviá el comprobante por WhatsApp al finalizar para iniciar la preparación.
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
                  {item.selectedSize && item.selectedSize !== "Estándar" && (
                    <span style={{ color: "var(--text-muted)" }}>{item.selectedSize.split(" (")[0]}</span>
                  )}
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {formatPrice(getItemPrice(item) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--border-color)" }} />

          {/* Summary pricing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.95rem" }}>
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
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: "1.45rem", color: "var(--accent-caramel-hover)" }}>
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
