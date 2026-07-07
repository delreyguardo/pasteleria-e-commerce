import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { dbService, formatPrice } from "../services/dbService";
import type { Order } from "../services/dbService";
import { Calendar, MapPin, ClipboardList } from "lucide-react";

export const Orders: React.FC = () => {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Status badge config
  const STATUS_CONFIG = {
    Pending: { text: "Pendiente (Pending)", color: "var(--accent-caramel)", bg: "var(--accent-cream)" },
    Baking: { text: "En Horno (Baking)", color: "#2563eb", bg: "#dbeafe" },
    Delivering: { text: "En Reparto (Delivering)", color: "#7c3aed", bg: "#f3e8ff" },
    Completed: { text: "Entregado (Completed)", color: "var(--success)", bg: "rgba(34,197,94,0.15)" },
  };

  useEffect(() => {
    if (!user) return;

    const fetchUserOrders = async () => {
      setLoading(true);
      try {
        const data = await dbService.getOrders(user.uid);
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch user orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container text-center animate-fade-in" style={{ padding: "100px 24px" }}>
        <h2 className="heading-serif" style={{ fontSize: "2rem", marginBottom: "16px" }}>Inicia Sesión</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Debes estar autenticado para ver tu historial de pedidos.</p>
        <Link to="/auth" className="btn btn-primary">Iniciar Sesión</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: "60px 24px 100px", maxWidth: "800px" }}>
      <h1 className="heading-serif text-gradient" style={{ fontSize: "2.8rem", marginBottom: "40px" }}>
        Mis Pedidos Dulces
      </h1>

      {loading ? (
        <div className="flex-center" style={{ minHeight: "300px", flexDirection: "column", gap: "12px" }}>
          <div className="loading-spinner" />
          <p style={{ color: "var(--text-secondary)" }}>Buscando tu historial...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass text-center" style={{ padding: "80px 24px", borderRadius: "var(--radius-md)" }}>
          <div className="flex-center" style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-cream)",
            color: "var(--accent-caramel-hover)",
            margin: "0 auto 20px"
          }}>
            <ClipboardList size={30} />
          </div>
          <h3 className="heading-serif" style={{ fontSize: "1.5rem", marginBottom: "12px" }}>Aún no tienes pedidos</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Cuando realices una compra de budín de pan o pasteles, aparecerán aquí para que les hagas seguimiento.
          </p>
          <Link to="/" className="btn btn-primary">Ir a la Tienda</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {orders.map((ord) => {
            const statusStyle = STATUS_CONFIG[ord.status];
            return (
              <div key={ord.id} className="glass animate-fade-in" style={{
                padding: "24px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}>
                {/* Card Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "1rem" }}>
                      Pedido ID: {ord.id}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={12} />
                      {new Date(ord.createdAt).toLocaleDateString()} a las {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <span className="badge" style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    padding: "6px 12px",
                    fontWeight: 700
                  }}>
                    {statusStyle.text}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "24px",
                  alignItems: "start"
                }} className="orders-card-grid">
                  {/* Items list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {ord.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} 
                        />
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem", flexGrow: 1 }}>
                          <span style={{ fontWeight: 600 }}>{item.product.name} x {item.quantity}</span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                            {[
                              item.selectedSize && item.selectedSize !== "Estándar" ? item.selectedSize.split(" (")[0] : null,
                              item.selectedCustomizations.length > 0 ? `Toppings: ${item.selectedCustomizations.join(", ")}` : null
                            ].filter(Boolean).join(" -- ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery summary */}
                  <div style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    borderLeft: "1px solid var(--border-color)",
                    paddingLeft: "20px"
                  }} className="orders-card-meta">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={14} color="var(--accent-caramel)" />
                      <span>{ord.shippingAddress}</span>
                    </div>
                    
                    {ord.notes && (
                      <div style={{ marginTop: "4px", fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        <strong>Nota:</strong> "{ord.notes}"
                      </div>
                    )}
                    
                    <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "4px 0" }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <span>Total Pagado:</span>
                      <strong style={{ fontSize: "1.2rem", color: "var(--accent-caramel-hover)", fontWeight: 800 }}>
                        {formatPrice(ord.total)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
