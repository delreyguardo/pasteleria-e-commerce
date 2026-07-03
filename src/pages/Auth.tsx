import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { Cake, LogIn, UserPlus, Info } from "lucide-react";

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await authService.signIn(email, password);
      } else {
        await authService.signUp(email, password);
      }

      // Success redirect
      if (redirect === "checkout") {
        navigate("/checkout");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error en la autenticación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex-center animate-fade-in" style={{ padding: "60px 24px 100px", minHeight: "calc(100vh - 120px)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", maxWidth: "460px" }}>
        
        {/* Auth Box */}
        <div className="glass" style={{
          padding: "40px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "28px"
        }}>
          {/* Header */}
          <div className="text-center" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="flex-center" style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-cream)",
              color: "var(--accent-caramel-hover)",
              margin: "0 auto 8px"
            }}>
              <Cake size={28} />
            </div>
            <h1 className="heading-serif" style={{ fontSize: "1.8rem" }}>
              {isLogin ? "Bienvenido de Vuelta" : "Crea tu Cuenta Dulce"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {isLogin 
                ? "Ingresa tus credenciales para continuar tus compras." 
                : "Regístrate para hacer seguimiento de tus compras y envíos."}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            backgroundColor: "var(--bg-primary)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)"
          }}>
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(""); }}
              className="flex-center"
              style={{
                padding: "10px",
                borderRadius: "calc(var(--radius-md) - 2px)",
                fontSize: "0.9rem",
                fontWeight: 600,
                backgroundColor: isLogin ? "var(--accent-caramel)" : "transparent",
                color: isLogin ? "#ffffff" : "var(--text-secondary)",
                gap: "6px"
              }}
            >
              <LogIn size={14} />
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(""); }}
              className="flex-center"
              style={{
                padding: "10px",
                borderRadius: "calc(var(--radius-md) - 2px)",
                fontSize: "0.9rem",
                fontWeight: 600,
                backgroundColor: !isLogin ? "var(--accent-caramel)" : "transparent",
                color: !isLogin ? "#ffffff" : "var(--text-secondary)",
                gap: "6px"
              }}
            >
              <UserPlus size={14} />
              Registrarse
            </button>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="glass animate-fade-in" style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(190, 18, 62, 0.1)",
              border: "1px solid var(--accent-raspberry)",
              color: "var(--accent-raspberry)",
              fontSize: "0.85rem",
              fontWeight: 600
            }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="ejemplo@correo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
              />
            </div>

            {!isLogin && (
              <div className="form-group animate-fade-in">
                <label className="form-label">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary flex-center"
              style={{ width: "100%", padding: "14px", marginTop: "8px" }}
            >
              {loading ? (
                <div className="loading-spinner" style={{ width: "20px", height: "20px", borderTopColor: "white" }} />
              ) : isLogin ? (
                "Iniciar Sesión"
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>
        </div>

        {/* Tip Box */}
        <div className="glass" style={{
          padding: "20px",
          borderRadius: "var(--radius-md)",
          fontSize: "0.85rem",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          borderLeft: "4px solid var(--accent-caramel)"
        }}>
          <Info size={20} color="var(--accent-caramel)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Acceso de Prueba Administrador:</span>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              Inicia sesión o regístrate con el correo <strong>admin@pasteleria.com</strong> (y cualquier contraseña) para desbloquear el panel de control de inventario y pedidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
