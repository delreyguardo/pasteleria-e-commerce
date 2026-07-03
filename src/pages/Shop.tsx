import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dbService } from "../services/dbService";
import type { Product } from "../services/dbService";
import { Filter, RefreshCw, Search } from "lucide-react";

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "budin">("all");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

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
    <div className="container animate-fade-in" style={{ padding: "60px 24px 100px" }}>
      <div className="text-center" style={{ marginBottom: "50px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <span className="badge badge-caramel" style={{ width: "fit-content", margin: "0 auto" }}>Budines Dulce Margarita</span>
        <h1 className="heading-serif text-gradient" style={{ fontSize: "2.8rem" }}>Catálogo de Budines</h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto" }}>
          Elegí el budín que mejor acompaña tu merienda, una visita o un regalo casero.
        </p>
      </div>

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
                <img src={prod.image} alt={prod.name} />
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
                  <span>${prod.price.toFixed(2)}</span>
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
