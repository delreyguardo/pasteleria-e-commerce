import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dbService, formatPrice } from "../services/dbService";
import type { Product } from "../services/dbService";
import { Filter, RefreshCw, Search } from "lucide-react";

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "budin">("all");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [products]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await dbService.getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="container animate-fade-in" style={{ padding: "40px 24px 100px" }}>
      {/* Carousel de Fotos de Productos */}
      {products.length > 0 && (
        <div className="glass shop-carousel-layout" style={{
          position: "relative",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: "40px",
          boxShadow: "var(--shadow-lg)",
          height: "380px",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
        }}>
          {/* Slide Image */}
          <div style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            backgroundColor: "#000"
          }}>
            <img 
              src={products[currentSlide].image} 
              alt={products[currentSlide].name} 
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "opacity 0.6s ease-in-out",
              }}
            />
            {/* Dark Overlay for Mobile Banner */}
            <div className="carousel-mobile-overlay" style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 20%, transparent 80%)",
            }} />
          </div>

          {/* Slide Copy / Info Panel */}
          <div style={{
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
            background: "var(--bg-glass)",
            zIndex: 1
          }} className="shop-carousel-info">
            <span className="badge badge-caramel" style={{ width: "fit-content" }}>Especialidades de la Casa</span>
            <h2 className="heading-serif" style={{ fontSize: "2.2rem", color: "var(--text-primary)" }}>
              {products[currentSlide].name}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              {products[currentSlide].description}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-caramel-hover)" }}>
                {formatPrice(products[currentSlide].price)}
              </span>
              <Link to={`/product/${products[currentSlide].id}`} className="btn btn-primary">
                Ver Detalles
              </Link>
            </div>
          </div>

          {/* Navigation Controls */}
          <button onClick={prevSlide} className="flex-center btn-outline" style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            cursor: "pointer",
            zIndex: 10
          }}>
            &#10094;
          </button>
          <button onClick={nextSlide} className="flex-center btn-outline" style={{
            position: "absolute",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            cursor: "pointer",
            zIndex: 10
          }}>
            &#10095;
          </button>

          {/* Indicators / Dots */}
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "8px",
            zIndex: 10
          }}>
            {products.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: currentSlide === i ? "var(--accent-caramel)" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  transition: "var(--transition)"
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="glass" style={{
        padding: "24px",
        borderRadius: "var(--radius-md)",
        marginBottom: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{
            position: "relative",
            flexGrow: 1,
            maxWidth: "400px",
            minWidth: "260px"
          }}>
            <input
              type="text"
              placeholder="Buscar budín o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: "44px" }}
            />
            <Search size={18} style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }} />
          </div>

          <div style={{
            display: "flex",
            gap: "8px",
            backgroundColor: "var(--bg-primary)",
            padding: "4px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-color)",
            flexWrap: "wrap"
          }}>
            <button
              onClick={() => setSelectedCategory("all")}
              className="btn"
              style={{
                padding: "8px 16px",
                fontSize: "0.9rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: selectedCategory === "all" ? "var(--accent-caramel)" : "transparent",
                color: selectedCategory === "all" ? "#ffffff" : "var(--text-secondary)",
                fontWeight: selectedCategory === "all" ? 600 : 500
              }}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedCategory("budin")}
              className="btn"
              style={{
                padding: "8px 16px",
                fontSize: "0.9rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: selectedCategory === "budin" ? "var(--accent-caramel)" : "transparent",
                color: selectedCategory === "budin" ? "#ffffff" : "var(--text-secondary)",
                fontWeight: selectedCategory === "budin" ? 600 : 500
              }}
            >
              Budines
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Filter size={16} />
              Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="form-control"
              style={{
                padding: "8px 16px",
                width: "180px",
                borderRadius: "var(--radius-md)"
              }}
            >
              <option value="name">Alfabético</option>
              <option value="price-asc">Precio: Bajo a Alto</option>
              <option value="price-desc">Precio: Alto a Bajo</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: "300px", flexDirection: "column", gap: "16px" }}>
          <div className="loading-spinner" style={{ width: "40px", height: "40px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Cargando budines...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass text-center" style={{ padding: "80px 24px", borderRadius: "var(--radius-md)" }}>
          <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
            No encontramos ningún budín que coincida con tu búsqueda.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSortBy("name"); }}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <RefreshCw size={16} />
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid-products">
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="glass hover-card product-card">
              <div className="product-image-wrap">
                <img src={prod.image} alt={prod.name} loading="lazy" decoding="async" />
                <span className="badge badge-caramel product-badge">Budín</span>

                {prod.stock === 0 ? (
                  <span className="badge" style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    backgroundColor: "var(--accent-raspberry)",
                    color: "white"
                  }}>
                    Agotado
                  </span>
                ) : prod.stock <= 3 ? (
                  <span className="badge badge-caramel" style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    backgroundColor: "var(--accent-cream)",
                    color: "var(--accent-caramel-hover)",
                    border: "1px solid var(--accent-caramel)"
                  }}>
                    Solo quedan {prod.stock}
                  </span>
                ) : null}
              </div>

              <div className="product-card-body">
                <h3 className="heading-serif">{prod.name}</h3>
                <p>{prod.description}</p>

                <div className="product-card-footer">
                  <span>{formatPrice(prod.price)}</span>
                  <Link to={`/product/${prod.id}`} className="btn btn-primary product-detail-link">
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
