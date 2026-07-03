import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { dbService } from "../services/dbService";
import type { Order, Product } from "../services/dbService";
import { Shield, ShoppingBag, Package, RefreshCw, Plus, Minus, DollarSign, Trash2 } from "lucide-react";

export const Admin: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders");
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Product Creation States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState(10.00);
  const [newCategory, setNewCategory] = useState<"budin" | "pastel">("budin");
  const [newImage, setNewImage] = useState("/images/bread_pudding.png");
  const [newIngredients, setNewIngredients] = useState("");
  const [newSizes, setNewSizes] = useState("Mediano (6 porciones), Grande (12 porciones)");
  const [newStock, setNewStock] = useState(10);

  // Status mapping colors
  const STATUS_LABELS = {
    Pending: { text: "Pendiente (Pending)", color: "var(--accent-caramel)", bg: "var(--accent-cream)" },
    Baking: { text: "Horneando (Baking)", color: "#2563eb", bg: "#dbeafe" },
    Delivering: { text: "En Reparto (Delivering)", color: "#7c3aed", bg: "#f3e8ff" },
    Completed: { text: "Entregado (Completed)", color: "var(--success)", bg: "rgba(34,197,94,0.15)" },
  };

  useEffect(() => {
    // Only fetch if admin
    if (!user || user.role !== "admin") return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      const data = await dbService.getOrders();
      setOrders(data);
      setLoadingOrders(false);
    };

    fetchOrders();
  }, [user, refreshTrigger]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      const data = await dbService.getProducts();
      setProducts(data);
      setLoadingProducts(false);
    };

    fetchProducts();
  }, [user, refreshTrigger]);

  // Auth gate check
  if (!user || user.role !== "admin") {
    return (
      <div className="container text-center animate-fade-in" style={{ padding: "100px 24px" }}>
        <div className="glass" style={{ maxWidth: "500px", margin: "0 auto", padding: "40px", borderRadius: "var(--radius-md)" }}>
          <Shield size={48} color="var(--accent-raspberry)" style={{ margin: "0 auto 16px" }} />
          <h2 className="heading-serif" style={{ fontSize: "1.8rem", color: "var(--accent-raspberry)", marginBottom: "12px" }}>
            Acceso Restringido
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Solo los administradores registrados de Dulce Margarita pueden visualizar este panel de gestión.
          </p>
          <button onClick={() => window.location.href = "/auth"} className="btn btn-primary">
            Iniciar Sesión como Admin
          </button>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, status: Order["status"]) => {
    const success = await dbService.updateOrderStatus(orderId, status);
    if (success) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleStockChange = async (productId: string, currentStock: number, delta: number) => {
    const nextStock = Math.max(0, currentStock + delta);
    const success = await dbService.updateProduct(productId, { stock: nextStock });
    if (success) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handlePriceChange = async (productId: string, priceStr: string) => {
    const nextPrice = parseFloat(priceStr);
    if (isNaN(nextPrice) || nextPrice <= 0) return;
    const success = await dbService.updateProduct(productId, { price: nextPrice });
    if (success) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newPrice <= 0) return;

    const ingredientsList = newIngredients.split(",").map(i => i.trim()).filter(Boolean);
    const sizesList = newSizes.split(",").map(s => s.trim()).filter(Boolean);

    const newProd = {
      name: newName,
      description: newDescription,
      price: newPrice,
      category: newCategory,
      image: newImage,
      ingredients: ingredientsList.length > 0 ? ingredientsList : ["Ingredientes caseros"],
      sizes: sizesList.length > 0 ? sizesList : ["Estándar"],
      stock: newStock
    };

    try {
      await dbService.createProduct(newProd);
      // Reset form
      setNewName("");
      setNewDescription("");
      setNewPrice(10.00);
      setNewCategory("budin");
      setNewImage("/images/bread_pudding.png");
      setNewIngredients("");
      setNewSizes("Mediano (6 porciones), Grande (12 porciones)");
      setNewStock(10);
      setShowAddForm(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error creating product", err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      const success = await dbService.deleteProduct(productId);
      if (success) {
        setRefreshTrigger(prev => prev + 1);
      }
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: "60px 24px 100px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "40px"
      }}>
        <div>
          <span className="badge badge-caramel" style={{ display: "flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
            <Shield size={14} /> Panel de Control
          </span>
          <h1 className="heading-serif text-gradient" style={{ fontSize: "2.8rem", marginTop: "8px" }}>
            Administración del Taller
          </h1>
        </div>

        <button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="btn btn-outline flex-center"
          style={{ gap: "8px" }}
        >
          <RefreshCw size={16} />
          Actualizar Datos
        </button>
      </div>

      {/* Tabs Selector */}
      <div style={{
        display: "flex",
        gap: "16px",
        borderBottom: "1px solid var(--border-color)",
        marginBottom: "32px"
      }}>
        <button
          onClick={() => setActiveTab("orders")}
          className="heading-serif flex-center"
          style={{
            padding: "12px 24px",
            fontSize: "1.2rem",
            color: activeTab === "orders" ? "var(--accent-caramel-hover)" : "var(--text-muted)",
            borderBottom: activeTab === "orders" ? "3px solid var(--accent-caramel)" : "3px solid transparent",
            gap: "8px",
            transition: "var(--transition)"
          }}
        >
          <ShoppingBag size={20} />
          Pedidos Recibidos ({orders.length})
        </button>
        
        <button
          onClick={() => setActiveTab("inventory")}
          className="heading-serif flex-center"
          style={{
            padding: "12px 24px",
            fontSize: "1.2rem",
            color: activeTab === "inventory" ? "var(--accent-caramel-hover)" : "var(--text-muted)",
            borderBottom: activeTab === "inventory" ? "3px solid var(--accent-caramel)" : "3px solid transparent",
            gap: "8px",
            transition: "var(--transition)"
          }}
        >
          <Package size={20} />
          Gestión de Inventario ({products.length})
        </button>
      </div>

      {/* Tab Panel: Orders */}
      {activeTab === "orders" && (
        <div>
          {loadingOrders ? (
            <div className="flex-center" style={{ minHeight: "200px", flexDirection: "column", gap: "12px" }}>
              <div className="loading-spinner" />
              <p style={{ color: "var(--text-secondary)" }}>Buscando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass text-center" style={{ padding: "60px 24px", borderRadius: "var(--radius-md)" }}>
              <p style={{ color: "var(--text-secondary)" }}>Aún no se han recibido pedidos de postres en la base de datos.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {orders.map((ord) => {
                const badgeInfo = STATUS_LABELS[ord.status];
                return (
                  <div key={ord.id} className="glass admin-order-card" style={{
                    padding: "28px",
                    borderRadius: "var(--radius-md)",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "24px",
                    alignItems: "start"
                  }}>
                    {/* Order info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "1.1rem" }}>
                          Pedido: {ord.id}
                        </span>
                        <span className="badge" style={{ backgroundColor: badgeInfo.bg, color: badgeInfo.color }}>
                          {badgeInfo.text}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {new Date(ord.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        fontSize: "0.95rem"
                      }} className="admin-order-grid">
                        <div>
                          <strong style={{ display: "block", marginBottom: "4px" }}>Cliente:</strong>
                          <span style={{ color: "var(--text-secondary)" }}>{ord.customerName} ({ord.userEmail})</span>
                          <br />
                          <span style={{ color: "var(--text-secondary)" }}>Teléfono: {ord.phone}</span>
                        </div>
                        <div>
                          <strong style={{ display: "block", marginBottom: "4px" }}>Dirección:</strong>
                          <span style={{ color: "var(--text-secondary)" }}>{ord.shippingAddress}</span>
                          {ord.notes && (
                            <div style={{ marginTop: "8px", borderLeft: "2px solid var(--accent-caramel)", paddingLeft: "8px", fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                              <strong>Nota del cliente:</strong> "{ord.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items details */}
                      <div style={{
                        backgroundColor: "var(--bg-primary)",
                        padding: "16px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}>
                        <strong style={{ fontSize: "0.9rem" }}>Especialidades Solicitadas:</strong>
                        {ord.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", justifyItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                            <span>•</span>
                            <div style={{ flexGrow: 1 }}>
                              <strong>{item.product.name} ({item.selectedSize.split(" (")[0]})</strong> x{item.quantity}
                              {item.selectedCustomizations.length > 0 && (
                                <span style={{ color: "var(--accent-caramel-hover)" }}>
                                  {" "}-- [Toppings: {item.selectedCustomizations.join(", ")}]
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick status controls */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      height: "100%"
                    }} className="admin-order-actions">
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Total a Recaudar</span>
                        <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-caramel-hover)" }}>
                          ${ord.total.toFixed(2)}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", minWidth: "200px" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                          Cambiar Estado de Preparación:
                        </label>
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id!, e.target.value as any)}
                          className="form-control"
                          style={{
                            padding: "8px 12px",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.9rem"
                          }}
                        >
                          <option value="Pending">Pendiente (Pending)</option>
                          <option value="Baking">Horneando (Baking)</option>
                          <option value="Delivering">En Reparto (Delivering)</option>
                          <option value="Completed">Entregado (Completed)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Panel: Inventory */}
      {activeTab === "inventory" && (
        <div>
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={18} />
              {showAddForm ? "Cancelar Registro" : "Añadir Nuevo Producto"}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreateProduct} className="glass animate-fade-in" style={{
              padding: "32px",
              borderRadius: "var(--radius-md)",
              marginBottom: "32px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px"
            }}>
              <h2 className="heading-serif text-gradient" style={{ gridColumn: "span 2", fontSize: "1.5rem", marginBottom: "8px" }}>
                Nuevo Producto
              </h2>

              <div className="form-group">
                <label className="form-label">Nombre del Postre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Budín de Naranja y Glaseado"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="form-control"
                >
                  <option value="budin">Budín</option>
                  <option value="pastel">Pastel</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Descripción *</label>
                <textarea
                  required
                  placeholder="Describe la textura, sabor y presentación de este postre..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="form-control"
                  style={{ minHeight: "80px", resize: "vertical" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Precio Base ($) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Inicial *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Imagen Prediseñada *</label>
                <select
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="form-control"
                >
                  <option value="/images/bread_pudding.png">Budín Protagonista</option>
                  <option value="/images/chocolate_cake.png">Pastel de Chocolate</option>
                  <option value="/images/red_velvet.png">Red Velvet Cake</option>
                  <option value="/images/hero_bakery.png">Mesa Dulce General</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tamaños (Separados por coma) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mediano (6 porciones), Grande (12 porciones)"
                  value={newSizes}
                  onChange={(e) => setNewSizes(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Ingredientes (Separados por coma) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Harina, Azúcar, Caramelo, Ralladura de limón"
                  value={newIngredients}
                  onChange={(e) => setNewIngredients(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Registrar Postre
                </button>
              </div>
            </form>
          )}

          {loadingProducts ? (
            <div className="flex-center" style={{ minHeight: "200px" }}>
              <div className="loading-spinner" />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {products.map((prod) => (
                <div key={prod.id} className="glass admin-inventory-row" style={{
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  display: "grid",
                  gridTemplateColumns: "80px 2fr 1.5fr 1.5fr auto",
                  gap: "24px",
                  alignItems: "center"
                }}>
                  {/* Thumbnail */}
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover" }} 
                  />

                  {/* Name and category */}
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{prod.name}</h3>
                    <span className="badge badge-caramel" style={{ fontSize: "0.7rem", marginTop: "4px" }}>
                      {prod.category === "budin" ? "Budín de Pan" : "Pastel"}
                    </span>
                  </div>

                  {/* Stock adjust */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Stock Disponible:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button 
                        onClick={() => handleStockChange(prod.id, prod.stock, -1)}
                        className="btn-outline flex-center"
                        style={{ width: "32px", height: "32px", borderRadius: "50%", padding: 0 }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{
                        width: "36px",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: prod.stock <= 3 ? "var(--accent-raspberry)" : "var(--text-primary)"
                      }}>
                        {prod.stock}
                      </span>
                      <button 
                        onClick={() => handleStockChange(prod.id, prod.stock, 1)}
                        className="btn-outline flex-center"
                        style={{ width: "32px", height: "32px", borderRadius: "50%", padding: 0 }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Price adjust */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Precio Base:</span>
                    <div style={{
                      position: "relative",
                      maxWidth: "140px"
                    }}>
                      <input 
                        type="number"
                        step="0.5"
                        defaultValue={prod.price}
                        onBlur={(e) => handlePriceChange(prod.id, e.target.value)}
                        className="form-control"
                        style={{
                          padding: "8px 12px 8px 24px",
                          fontSize: "0.95rem",
                          borderRadius: "var(--radius-md)"
                        }}
                      />
                      <DollarSign size={14} style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)"
                      }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="btn-outline flex-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        color: "var(--accent-raspberry)",
                        borderColor: "var(--accent-raspberry)"
                      }}
                      title="Eliminar Postre"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .admin-order-card { grid-template-columns: 1fr !important; gap: 16px !important; }
          .admin-order-actions { align-items: flex-start !important; text-align: left !important; }
          .admin-order-actions > div { text-align: left !important; }
        }
        @media (max-width: 768px) {
          .admin-order-grid { grid-template-columns: 1fr !important; }
          .admin-inventory-row { grid-template-columns: 80px 1fr !important; gap: 16px !important; }
          .admin-inventory-row > div:nth-child(3), .admin-inventory-row > div:nth-child(4), .admin-inventory-row > div:nth-child(5) {
            grid-column: span 2;
            flex-direction: row !important;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};
