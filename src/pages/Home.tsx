import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dbService, formatPrice } from "../services/dbService";
import type { Product } from "../services/dbService";
import { ArrowRight, Award, Clock, Heart, PackageCheck, Sparkles, Star } from "lucide-react";

export const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const all = await dbService.getProducts();
      setFeatured(all.filter((product) => product.category === "budin").slice(0, 3));
    };

    fetchFeatured();
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "80px" }}>
      <section className="brand-hero">
        <div className="container brand-hero-grid">
          <div className="brand-hero-copy">
            <span className="badge badge-caramel" style={{ width: "fit-content" }}>
              Budines caseros por encargo
            </span>
            <h1 className="heading-serif text-gradient brand-hero-title">
              Dulce Margarita
            </h1>
            <p className="brand-hero-lead">
              Pastelería artesanal enfocada en budines: recetas caseras, caramelo dorado y ese sabor de merienda que pide mate, café o una mesa compartida.
            </p>
            <div className="brand-hero-actions">
              <Link to="/" className="btn btn-primary">
                Ver Budines
                <ArrowRight size={18} />
              </Link>
              <a href="#story" className="btn btn-outline">
                Conocer la Marca
              </a>
            </div>
          </div>

          <div className="brand-visual" aria-label="Logo y producto principal de Dulce Margarita">
            <img
              className="brand-logo-feature"
              src="/images/dulce-margarita-logo.webp"
              alt="Logo de Dulce Margarita, gatita pastelera con gorro de chef"
              fetchPriority="high"
              decoding="async"
            />
            <div className="brand-product-frame">
              <img
                src="/images/bread_pudding.webp"
                alt="Budín casero de Dulce Margarita"
                fetchPriority="high"
                decoding="async"
              />
              <div className="brand-product-badge glass">
                <Award size={22} />
                <span>Producto protagonista: budín casero</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--bg-secondary)", padding: "72px 0" }}>
        <div className="container">
          <div className="text-center section-heading">
            <span className="badge badge-caramel" style={{ width: "fit-content", margin: "0 auto" }}>
              Lo que representa
            </span>
            <h2 className="heading-serif text-gradient">Una pastelería pequeña, cálida y bien casera</h2>
            <p>
              Por ahora la propuesta gira alrededor del budín: pocas variedades, mucho cuidado y una presentación linda para regalar o compartir.
            </p>
          </div>

          <div className="feature-grid">
            <div className="glass hover-card feature-card">
              <div className="feature-icon">
                <Heart size={28} />
              </div>
              <h3 className="heading-serif">Hecho con cariño</h3>
              <p>Cada budín se prepara a mano, con recetas simples y sabores familiares.</p>
            </div>

            <div className="glass hover-card feature-card">
              <div className="feature-icon">
                <Clock size={28} />
              </div>
              <h3 className="heading-serif">Horneado fresco</h3>
              <p>Producción chica para cuidar textura, humedad y punto justo de caramelo.</p>
            </div>

            <div className="glass hover-card feature-card">
              <div className="feature-icon">
                <PackageCheck size={28} />
              </div>
              <h3 className="heading-serif">Listo para regalar</h3>
              <p>Opciones pensadas para una merienda, una visita o un detalle dulce.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="catalog-heading">
            <div>
              <span className="badge badge-caramel" style={{ width: "fit-content" }}>
                Por ahora
              </span>
              <h2 className="heading-serif">Budines disponibles</h2>
            </div>
            <Link to="/" className="btn btn-outline">
              Ver catálogo
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-products">
            {featured.map((prod) => (
              <div key={prod.id} className="glass hover-card product-card">
                <div className="product-image-wrap">
                  <img src={prod.image} alt={prod.name} />
                  <span className="badge badge-caramel product-badge">Budín</span>
                </div>
                <div className="product-card-body">
                  <h3 className="heading-serif">{prod.name}</h3>
                  <p>{prod.description}</p>
                  <div className="product-card-footer">
                     <span>{formatPrice(prod.price)}</span>
                    <Link to={`/product/${prod.id}`} className="btn-secondary product-detail-link">
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story" style={{ backgroundColor: "var(--bg-secondary)", padding: "92px 0" }}>
        <div className="container story-grid">
          <div className="story-image">
            <img
              src="/images/dulce-margarita-logo.webp"
              alt="Identidad visual Dulce Margarita"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="story-copy">
            <span className="badge badge-caramel" style={{ width: "fit-content" }}>
              Identidad de marca
            </span>
            <h2 className="heading-serif text-gradient">
              Una imagen dulce, cercana y memorable
            </h2>
            <p>
              El logo de Dulce Margarita combina una mascota pastelera con tonos verdes, crema y caramelo. Funciona muy bien para una marca artesanal porque se siente simpática, familiar y fácil de recordar.
            </p>
            <p>
              Para representar el negocio mientras el menú crece, la web usa el budín como foto principal: es el producto actual, el que cuenta la historia real de la pastelería hoy.
            </p>
            <Link to="/" className="btn btn-primary">
              Elegir un Budín
              <Sparkles size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="text-center section-heading">
            <span className="badge badge-caramel" style={{ width: "fit-content", margin: "0 auto" }}>
              Reseñas
            </span>
            <h2 className="heading-serif">Lo que dicen quienes ya probaron</h2>
          </div>

          <div className="testimonial-grid">
            {[
              {
                text: "El budín llegó húmedo, con mucho sabor a caramelo y perfecto para la merienda.",
                name: "María Fernanda R."
              },
              {
                text: "Se nota que es casero. Lo pedí para compartir con la familia y no quedó ni una porción.",
                name: "Carlos H."
              },
              {
                text: "La presentación es hermosa para regalar y el sabor acompaña. Muy recomendable.",
                name: "Sofía L."
              }
            ].map((testimonial) => (
              <div key={testimonial.name} className="glass testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--accent-caramel)" />
                  ))}
                </div>
                <p>"{testimonial.text}"</p>
                <h5>{testimonial.name}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
