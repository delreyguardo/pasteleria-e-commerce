import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { dbService } from "../services/dbService";
import type { Product } from "../services/dbService";
import { useApp } from "../context/AppContext";
import { ArrowLeft, Check, ShoppingCart, Info, Award } from "lucide-react";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useApp();

  // Selection states
  const [selectedSize, setSelectedSize] = useState("");
  const [customizations, setCustomizations] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);

  // Available customizations
  const CUSTOMIZATION_OPTIONS = [
    { id: "extra-caramel", name: "Caramelo extra casero", price: 1.50 },
    { id: "chantilly", name: "Porción de crema chantilly", price: 2.00 },
    { id: "gift-box", name: "Caja de regalo decorada", price: 3.00 },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const data = await dbService.getProductById(id);
      if (data) {
        setProduct(data);
        // Default to first size
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-center container" style={{ minHeight: "500px", flexDirection: "column", gap: "16px" }}>
        <div className="loading-spinner" style={{ width: "40px", height: "40px" }} />
        <p>Preparando los detalles de tu postre...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center" style={{ padding: "100px 24px" }}>
        <h2 className="heading-serif" style={{ fontSize: "2rem", marginBottom: "16px" }}>¡Postre no encontrado!</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Lo sentimos, la delicia que buscas no está en nuestro catálogo.</p>
        <Link to="/shop" className="btn btn-primary">Volver a la Tienda</Link>
      </div>
    );
  }

  const handleCustomizationToggle = (optionName: string) => {
    setCustomizations(prev => 
      prev.includes(optionName)
        ? prev.filter(c => c !== optionName)
        : [...prev, optionName]
    );
  };

  const getCustomizationPrice = () => {
    return customizations.reduce((total, name) => {
      const option = CUSTOMIZATION_OPTIONS.find(o => o.name === name);
      return total + (option ? option.price : 0);
    }, 0);
  };

  const currentPrice = product.price + getCustomizationPrice();

  const handleAddToCart = () => {
    addToCart(product, selectedSize, customizations);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
    }, 3000);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: "40px 24px 100px" }}>
      {/* Back button */}
      <Link to="/shop" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "var(--text-secondary)",
        fontWeight: 500,
        marginBottom: "32px",
        transition: "var(--transition)"
      }} className="hover-link">
        <ArrowLeft size={16} />
        Volver a la Tienda
      </Link>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "64px",
        alignItems: "start"
      }} className="detail-layout">
        {/* Left Column: Image and Ingredients */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Image */}
          <div style={{
            position: "relative",
            width: "100%",
            height: "450px",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)"
          }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
            <span className="badge badge-caramel" style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              fontSize: "0.85rem",
              padding: "6px 16px"
            }}>
              {product.category === "budin" ? "Tradicional Budín de Pan" : "Gourmet Pastel"}
            </span>
          </div>

          {/* Ingredients list */}
          <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-md)" }}>
            <h4 className="heading-serif" style={{ fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Info size={18} color="var(--accent-caramel)" />
              Ingredientes Seleccionados
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {product.ingredients.map((ing, i) => (
                <span key={i} className="badge" style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                  padding: "6px 12px",
                  fontSize: "0.85rem"
                }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Title, Config, Price and CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div>
            <h1 className="heading-serif text-gradient" style={{ fontSize: "2.6rem", lineHeight: "1.2", marginBottom: "12px" }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-caramel)", fontSize: "0.9rem", fontWeight: 600 }}>
              <Award size={16} />
              <span>Dulce Margarita Original</span>
            </div>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
            {product.description}
          </p>

          <div style={{ height: "1px", backgroundColor: "var(--border-color)" }} />

          {/* Configuration: Size */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "12px", color: "var(--text-secondary)" }}>
              Selecciona el Tamaño:
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {product.sizes.map((size) => (
                <label 
                  key={size} 
                  className="glass flex-center"
                  style={{
                    justifyContent: "flex-start",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    border: selectedSize === size ? "2px solid var(--accent-caramel)" : "1px solid var(--border-glass)",
                    transition: "var(--transition)",
                    backgroundColor: selectedSize === size ? "var(--accent-cream)" : "var(--bg-glass)",
                    color: selectedSize === size ? "var(--accent-caramel-hover)" : "var(--text-primary)",
                    fontWeight: selectedSize === size ? 600 : 500
                  }}
                >
                  <input 
                    type="radio" 
                    name="product-size" 
                    value={size}
                    checked={selectedSize === size}
                    onChange={() => setSelectedSize(size)}
                    style={{ marginRight: "12px", accentColor: "var(--accent-caramel)" }}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>

          {/* Configuration: Customizations */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "12px", color: "var(--text-secondary)" }}>
              Toppings y Personalización (Opcional):
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {CUSTOMIZATION_OPTIONS.map((opt) => (
                <label 
                  key={opt.id} 
                  className="glass flex-center"
                  style={{
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    border: customizations.includes(opt.name) ? "1px solid var(--accent-caramel)" : "1px solid var(--border-glass)",
                    backgroundColor: customizations.includes(opt.name) ? "var(--bg-primary)" : "var(--bg-glass)",
                    fontSize: "0.95rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input 
                      type="checkbox"
                      checked={customizations.includes(opt.name)}
                      onChange={() => handleCustomizationToggle(opt.name)}
                      style={{ marginRight: "12px", accentColor: "var(--accent-caramel)" }}
                    />
                    <span>{opt.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--accent-caramel-hover)" }}>
                    +${opt.price.toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Pricing & Add to Cart Action */}
          <div className="glass" style={{
            padding: "24px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Precio Total</span>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-caramel-hover)" }}>
                ${currentPrice.toFixed(2)}
              </span>
            </div>

            {product.stock === 0 ? (
              <button disabled className="btn" style={{
                backgroundColor: "var(--border-color)",
                color: "var(--text-muted)",
                cursor: "not-allowed"
              }}>
                Agotado Temporalmente
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button onClick={handleAddToCart} className="btn btn-primary" style={{
                  padding: "14px 32px",
                  fontSize: "1rem"
                }}>
                  <ShoppingCart size={18} />
                  Añadir al Carrito
                </button>
                {successMsg && (
                  <span className="animate-fade-in" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--success)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    justifyContent: "center"
                  }}>
                    <Check size={14} /> ¡Añadido con éxito!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .hover-link:hover {
          color: var(--accent-caramel-hover) !important;
          transform: translateX(-4px);
        }
        @media (max-width: 768px) {
          .detail-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
          div[style*="height: 450px"] { height: 280px !important; }
        }
      `}</style>
    </div>
  );
};
