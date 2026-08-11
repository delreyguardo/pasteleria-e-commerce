import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "./authService";

const SEED_USERS = [
  { email: "admin@pasteleria.com", password: "adminpassword", uid: "mock_admin_1" },
  { email: "test@user.com", password: "userpassword", uid: "mock_user_1" }
];

const seedUsers = () => {
  localStorage.setItem("bakery_users", JSON.stringify(SEED_USERS));
};

describe("authService (modo mock)", () => {
  beforeEach(async () => {
    localStorage.clear();
    seedUsers();
    await authService.signOut();
  });

  describe("signUp", () => {
    it("crea un usuario nuevo con rol user", async () => {
      const session = await authService.signUp("nuevo@user.com", "secret123");

      expect(session.email).toBe("nuevo@user.com");
      expect(session.role).toBe("user");
      expect(session.uid).toBeTruthy();

      const stored = JSON.parse(localStorage.getItem("bakery_users") || "[]");
      expect(stored).toHaveLength(3);
    });

    it("rechaza un email ya registrado", async () => {
      await expect(authService.signUp("test@user.com", "otraclave")).rejects.toThrow(
        "ya está registrado"
      );
    });

    it("guarda la sesión actual tras el registro", async () => {
      const session = await authService.signUp("nuevo@user.com", "secret123");
      expect(authService.getCurrentUser()).toEqual(session);
    });
  });

  describe("signIn", () => {
    it("inicia sesión con credenciales correctas", async () => {
      const session = await authService.signIn("test@user.com", "userpassword");

      expect(session.email).toBe("test@user.com");
      expect(session.role).toBe("user");
      expect(session.uid).toBe("mock_user_1");
    });

    it("rechaza contraseña incorrecta para un usuario normal", async () => {
      await expect(authService.signIn("test@user.com", "incorrecta")).rejects.toThrow(
        "Correo o contraseña incorrectos"
      );
    });

    it("rechaza un usuario inexistente", async () => {
      await expect(authService.signIn("ghost@user.com", "clave123")).rejects.toThrow(
        "Correo o contraseña incorrectos"
      );
    });

    it("asigna rol admin al email de administración", async () => {
      const session = await authService.signIn("admin@pasteleria.com", "adminpassword");
      expect(session.role).toBe("admin");
    });
  });

  describe("signOut / estado de sesión", () => {
    it("limpia la sesión al cerrar", async () => {
      await authService.signIn("test@user.com", "userpassword");
      expect(authService.getCurrentUser()).not.toBeNull();

      await authService.signOut();
      expect(authService.getCurrentUser()).toBeNull();
      expect(localStorage.getItem("bakery_current_session")).toBeNull();
    });

    it("notifica a los listeners cuando cambia el estado", async () => {
      const states: (string | null)[] = [];
      const unsubscribe = authService.onAuthStateChanged((user) => {
        states.push(user ? user.email : null);
      });

      await authService.signIn("test@user.com", "userpassword");
      await authService.signOut();
      unsubscribe();

      expect(states).toEqual([null, "test@user.com", null]);
    });

    it("devuelve la función de desuscripción", async () => {
      const calls: unknown[] = [];
      const unsubscribe = authService.onAuthStateChanged((u) => calls.push(u));
      await authService.signIn("test@user.com", "userpassword");
      unsubscribe();
      await authService.signOut();
      expect(calls).toHaveLength(2);
    });
  });
});