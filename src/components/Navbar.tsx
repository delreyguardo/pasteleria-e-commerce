import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { authService } from "../services/authService";
import { ShoppingCart, Sun, Moon, LogOut, User, Menu, X, Shield } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, theme, toggleTheme, cart } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="glass" style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "16px 0",
      transition: "var(--transition)"
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: "var(--text-primary)"
        }} className="heading-serif">
          <img
            src="/images/dulce-margarita-logo.jpg"
            alt="Logo de Dulce Margarita"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--accent-caramel)",
              boxShadow: "0 4px 12px rgba(84, 105, 62, 0.18)"
            }}
          />
          <span>Dulce <span style={{ color: "var(--accent-caramel)" }}>Margarita</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "32px"
        }} className="desktop-nav">
          <Link to="/" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>Inicio</Link>
          <Link to="/shop" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>Tienda</Link>
          {user && (
            <Link to="/orders" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>Mis Pedidos</Link>
          )}
          {user && user.role === "admin" && (
            <Link to="/admin" style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 600,
              color: "var(--accent-caramel)"
            }}>
              <Shield size={16} />
              Panel Admin
            </Link>
          )}
        </div>

        {/* Action Controls */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="btn-outline flex-center" 
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              padding: 0,
              backgroundColor: "transparent"
            }}
            title="Cambiar tema"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Cart Icon Button */}
          <Link to="/cart" className="btn-secondary flex-center" style={{
            position: "relative",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            padding: 0
          }}>
            <ShoppingCart size={18} />
            {totalCartItems > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "var(--accent-raspberry)",
                color: "#ffffff",
                fontSize: "0.7rem",
                fontWeight: 700,
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
              }}>
                {totalCartItems}
              </span>
            )}
          </Link>

          {/* Authentication Session Buttons */}
          <div className="desktop-nav">
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <User size={14} />
                  {user.email.split("@")[0]}
                </span>
                <button onClick={handleSignOut} className="btn-outline" style={{
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.9rem"
                }}>
                  <LogOut size={14} />
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.9rem" }}>
                Ingresar
              </Link>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button 
            className="mobile-toggle flex-center btn-outline" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              padding: 0
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive Nav) */}
      {mobileMenuOpen && (
        <div className="glass animate-fade-in" style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          padding: "24px",
          borderTop: "1px solid var(--border-glass)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 500, fontSize: "1.1rem" }}>Inicio</Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 500, fontSize: "1.1rem" }}>Tienda</Link>
          {user && (
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 500, fontSize: "1.1rem" }}>Mis Pedidos</Link>
          )}
          {user && user.role === "admin" && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{
              fontWeight: 600,
              fontSize: "1.1rem",
              color: "var(--accent-caramel)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <Shield size={18} />
              Panel Administrativo
            </Link>
          )}
          
          <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "8px 0" }} />
          
          {user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Sesión: {user.email}
              </span>
              <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="btn-danger" style={{
                width: "100%",
                padding: "10px",
                borderRadius: "var(--radius-md)"
              }}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center" style={{
              width: "100%",
              padding: "10px",
              borderRadius: "var(--radius-md)"
            }}>
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}

      {/* Embedded CSS specific to layout hides to toggle mobile navigation */}
      <style>{`
        @media (min-width: 769px) {
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
