import { auth, isFirebaseConfigured } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";

export interface UserSession {
  uid: string;
  email: string;
  role: "admin" | "user";
}

type AuthCallback = (user: UserSession | null) => void;
const listeners = new Set<AuthCallback>();
let currentSessionUser: UserSession | null = null;

// Helper to determine role
const getRoleFromEmail = (email: string | null): "admin" | "user" => {
  if (email && email.toLowerCase() === "admin@pasteleria.com") {
    return "admin";
  }
  return "user";
};

// Initialize Mock Auth State from LocalStorage
const initMockAuth = () => {
  if (!localStorage.getItem("bakery_users")) {
    // Seed with a default admin account
    localStorage.setItem("bakery_users", JSON.stringify([
      { email: "admin@pasteleria.com", password: "adminpassword", uid: "mock_admin_1" },
      { email: "test@user.com", password: "userpassword", uid: "mock_user_1" }
    ]));
  }
  
  const savedSession = localStorage.getItem("bakery_current_session");
  if (savedSession) {
    try {
      currentSessionUser = JSON.parse(savedSession) as UserSession;
    } catch {
      currentSessionUser = null;
    }
  }
};

initMockAuth();

const notifyListeners = () => {
  listeners.forEach(cb => cb(currentSessionUser));
};

// Handle Firebase auth state changes and sync with local UserSession
if (isFirebaseConfigured && auth) {
  firebaseOnAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      currentSessionUser = {
        uid: fbUser.uid,
        email: fbUser.email || "",
        role: getRoleFromEmail(fbUser.email)
      };
    } else {
      currentSessionUser = null;
    }
    notifyListeners();
  });
}

export const authService = {
  // Sign up
  signUp: async (email: string, password: string): Promise<UserSession> => {
    if (isFirebaseConfigured && auth) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      const session = {
        uid: user.uid,
        email: user.email || "",
        role: getRoleFromEmail(user.email)
      };
      return session;
    }

    // Local Storage Mock
    const mockUsers = JSON.parse(localStorage.getItem("bakery_users") || "[]");
    const exists = mockUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("El correo electrónico ya está registrado.");
    }

    const uid = "mock_" + Math.random().toString(36).substr(2, 9);
    const newUser = { email, password, uid };
    mockUsers.push(newUser);
    localStorage.setItem("bakery_users", JSON.stringify(mockUsers));

    const session: UserSession = {
      uid,
      email,
      role: getRoleFromEmail(email)
    };
    
    currentSessionUser = session;
    localStorage.setItem("bakery_current_session", JSON.stringify(session));
    notifyListeners();
    return session;
  },

  // Sign in
  signIn: async (email: string, password: string): Promise<UserSession> => {
    if (isFirebaseConfigured && auth) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      const session = {
        uid: user.uid,
        email: user.email || "",
        role: getRoleFromEmail(user.email)
      };
      return session;
    }

    // Local Storage Mock
    const mockUsers = JSON.parse(localStorage.getItem("bakery_users") || "[]");
    const foundUser = mockUsers.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const session: UserSession = {
      uid: foundUser.uid,
      email: foundUser.email,
      role: getRoleFromEmail(foundUser.email)
    };

    currentSessionUser = session;
    localStorage.setItem("bakery_current_session", JSON.stringify(session));
    notifyListeners();
    return session;
  },

  // Sign out
  signOut: async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
      return;
    }

    // Local Storage Mock
    currentSessionUser = null;
    localStorage.removeItem("bakery_current_session");
    notifyListeners();
  },

  // Check state
  getCurrentUser: (): UserSession | null => {
    return currentSessionUser;
  },

  // Listen to changes
  onAuthStateChanged: (callback: AuthCallback): (() => void) => {
    listeners.add(callback);
    // Call immediately with current value
    callback(currentSessionUser);
    
    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
    };
  }
};
